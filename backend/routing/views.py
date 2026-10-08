import os
import math
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

def get_geoapify_key():
    return getattr(settings, 'GEOAPIFY_API_KEY', os.environ.get('GEOAPIFY_API_KEY'))

@api_view(['GET'])
@permission_classes([AllowAny])
def autocomplete(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response([])
        
    try:
        results = []
        
        # 1. Search local database first
        from stations.models import FuelStation
        from django.db.models import Q
        
        search_query = query.split(',')[0].strip()
        local_stations = FuelStation.objects.filter(
            Q(name__icontains=search_query) | Q(address__icontains=search_query) | Q(city__icontains=search_query)
        )[:3]
        
        for station in local_stations:
            display_name = f"{station.name}"
            if station.city:
                display_name += f", {station.city}"
            results.append({
                'place_id': station.external_source_id or str(station.id),
                'lat': str(station.latitude),
                'lon': str(station.longitude),
                'display_name': display_name
            })

        # 2. Search Geoapify
        url = f"https://api.geoapify.com/v1/geocode/autocomplete?text={query}&limit=5&apiKey={get_geoapify_key()}"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        for feature in data.get('features', []):
            props = feature.get('properties', {})
            results.append({
                'place_id': props.get('place_id'),
                'lat': str(props.get('lat')),
                'lon': str(props.get('lon')),
                'display_name': props.get('formatted')
            })
            
        return Response(results)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def geocode_search(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response([])
        
    try:
        results = []
        
        # 1. Search local database first
        from stations.models import FuelStation
        from django.db.models import Q
        
        search_query = query.split(',')[0].strip()
        local_stations = FuelStation.objects.filter(
            Q(name__icontains=search_query) | Q(address__icontains=search_query) | Q(city__icontains=search_query)
        )[:3]
        
        for station in local_stations:
            display_name = f"{station.name}"
            if station.city:
                display_name += f", {station.city}"
            results.append({
                'place_id': station.external_source_id or str(station.id),
                'lat': str(station.latitude),
                'lon': str(station.longitude),
                'display_name': display_name
            })

        # 2. Search Geoapify
        url = f"https://api.geoapify.com/v1/geocode/search?text={query}&limit=5&apiKey={get_geoapify_key()}"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        for feature in data.get('features', []):
            props = feature.get('properties', {})
            results.append({
                'place_id': props.get('place_id'),
                'lat': str(props.get('lat')),
                'lon': str(props.get('lon')),
                'display_name': props.get('formatted')
            })
            
        return Response(results)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def reverse_geocode(request):
    lat = request.query_params.get('lat')
    lon = request.query_params.get('lon')
    if not lat or not lon:
        return Response({"error": "Missing lat/lon"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        url = f"https://api.geoapify.com/v1/geocode/reverse?lat={lat}&lon={lon}&limit=1&apiKey={get_geoapify_key()}"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        results = []
        for feature in data.get('features', []):
            props = feature.get('properties', {})
            results.append({
                'place_id': props.get('place_id'),
                'lat': str(props.get('lat')),
                'lon': str(props.get('lon')),
                'display_name': props.get('formatted')
            })
        return Response(results)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def distance_to_line_segment(p_lat, p_lon, v_lat, v_lon, w_lat, w_lon):
    l2 = (w_lat - v_lat)**2 + (w_lon - v_lon)**2
    if l2 == 0.0:
        return haversine_distance(p_lat, p_lon, v_lat, v_lon)
        
    t = max(0, min(1, ((p_lat - v_lat) * (w_lat - v_lat) + (p_lon - v_lon) * (w_lon - v_lon)) / l2))
    proj_lat = v_lat + t * (w_lat - v_lat)
    proj_lon = v_lon + t * (w_lon - v_lon)
    return haversine_distance(p_lat, p_lon, proj_lat, proj_lon)

def min_distance_to_polyline(lat, lon, polyline):
    min_dist = float('inf')
    for i in range(len(polyline) - 1):
        p1 = polyline[i]
        p2 = polyline[i + 1]
        dist = distance_to_line_segment(lat, lon, p1[1], p1[0], p2[1], p2[0]) # polyline is [lon, lat]
        if dist < min_dist:
            min_dist = dist
    return min_dist

@api_view(['POST'])
@permission_classes([AllowAny])
def get_route(request):
    origin = request.data.get('origin') # "lat,lon"
    destination = request.data.get('destination')
    
    if not origin or not destination:
        return Response({"error": "Missing origin or destination"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        o_lat, o_lon = origin.split(',')
        d_lat, d_lon = destination.split(',')
        url = f"https://api.geoapify.com/v1/routing?waypoints={o_lat},{o_lon}|{d_lat},{d_lon}&mode=drive&apiKey={get_geoapify_key()}"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        return Response(resp.json())
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def get_route_stations(request):
    origin = request.data.get('origin') # "lat,lon"
    destination = request.data.get('destination')
    tolerance = float(request.data.get('tolerance', 2.0)) # km
    fuels = request.data.get('fuels', []) # ['petrol', 'diesel', 'cng']
    
    if not origin or not destination:
        return Response({"error": "Missing origin or destination"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        o_lat, o_lon = origin.split(',')
        d_lat, d_lon = destination.split(',')
        route_url = f"https://api.geoapify.com/v1/routing?waypoints={o_lat},{o_lon}|{d_lat},{d_lon}&mode=drive&apiKey={get_geoapify_key()}"
        route_resp = requests.get(route_url, timeout=10)
        route_resp.raise_for_status()
        route_data = route_resp.json()
        
        if not route_data.get('features'):
            return Response({"error": "No route found"}, status=status.HTTP_404_NOT_FOUND)
            
        feature = route_data['features'][0]
        base_distance = feature['properties']['distance']
        base_time = feature['properties']['time']
        geometry = feature['geometry']['coordinates'][0]
        
        lons = [c[0] for c in geometry]
        lats = [c[1] for c in geometry]
        min_lon, max_lon = min(lons), max(lons)
        min_lat, max_lat = min(lats), max(lats)
        
        buffer_deg = tolerance / 111.0
        rect = f"{min_lon-buffer_deg},{min_lat-buffer_deg},{max_lon+buffer_deg},{max_lat+buffer_deg}"
        
        places_url = f"https://api.geoapify.com/v2/places?categories=service.vehicle.fuel&filter=rect:{rect}&limit=100&apiKey={get_geoapify_key()}"
        places_resp = requests.get(places_url, timeout=10)
        places_resp.raise_for_status()
        places_data = places_resp.json()
        
        geo_stations_dict = {}
        for place in places_data.get('features', []):
            props = place['properties']
            supported_fuels = ['petrol', 'diesel']
            if 'cng' in str(props.get('name', '')).lower() or 'cng' in str(props.get('street', '')).lower():
                supported_fuels.append('cng')
                
            pid = props.get('place_id')
            geo_stations_dict[pid] = {
                'id': pid,
                'name': props.get('name', 'Fuel Station'),
                'latitude': props.get('lat'),
                'longitude': props.get('lon'),
                'address': props.get('formatted', ''),
                'city': props.get('city', ''),
                'state': props.get('state', ''),
                'supported_fuels': supported_fuels,
                'source': 'geoapify',
                'is_verified': False
            }
            
        from stations.models import FuelStation
        db_stations = FuelStation.objects.filter(
            latitude__gte=min_lat-buffer_deg, latitude__lte=max_lat+buffer_deg,
            longitude__gte=min_lon-buffer_deg, longitude__lte=max_lon+buffer_deg
        ).prefetch_related('prices')
        
        for db_s in db_stations:
            prices = [{'fuel_type': p.fuel_type.upper(), 'price': str(p.price), 'unit': p.unit, 'currency': p.currency} for p in db_s.prices.all()]
            s_data = {
                'id': db_s.external_source_id or str(db_s.id),
                'db_id': db_s.id,
                'name': db_s.name,
                'latitude': db_s.latitude,
                'longitude': db_s.longitude,
                'address': db_s.address,
                'city': db_s.city,
                'state': db_s.state,
                'supported_fuels': db_s.supported_fuels,
                'phone': db_s.phone,
                'opening_hours': db_s.opening_hours,
                'source': 'manual',
                'is_verified': db_s.is_verified,
                'prices': prices
            }
            
            if db_s.external_source_id and db_s.external_source_id in geo_stations_dict:
                geo_stations_dict[db_s.external_source_id] = s_data
            else:
                geo_stations_dict[str(db_s.id)] = s_data
                
        candidate_stations = []
        for station in geo_stations_dict.values():
            if fuels and not any(f in station.get('supported_fuels', []) for f in fuels):
                continue
                
            dist = min_distance_to_polyline(station['latitude'], station['longitude'], geometry)
            if dist <= tolerance:
                station['distance_from_route'] = dist
                station['detour_distance'] = dist * 2
                station['extra_time'] = int((station['detour_distance'] / 30.0) * 60)
                candidate_stations.append(station)
                
        sort_by = request.data.get('sortBy', 'detour')
        if sort_by == 'time':
            candidate_stations.sort(key=lambda x: x['extra_time'])
        else:
            candidate_stations.sort(key=lambda x: x['detour_distance'])
            
        total_items = len(candidate_stations)
        page = int(request.data.get('page', 1))
        limit = int(request.data.get('limit', 10))
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_stations = candidate_stations[start_index:end_index]
        
        return Response({
            "route_geometry": geometry,
            "base_distance": base_distance,
            "base_time": base_time,
            "stations": paginated_stations,
            "total_items": total_items,
            "current_page": page,
            "limit": limit
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_city_stations(request):
    city = request.query_params.get('city')
    if not city:
        return Response({"error": "Missing city parameter"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        geocode_url = f"https://api.geoapify.com/v1/geocode/search?text={city}&limit=1&apiKey={get_geoapify_key()}"
        geocode_resp = requests.get(geocode_url, timeout=5)
        geocode_resp.raise_for_status()
        geocode_data = geocode_resp.json()
        
        if not geocode_data.get('features'):
            return Response({"error": "City not found"}, status=status.HTTP_404_NOT_FOUND)
            
        feature = geocode_data['features'][0]
        bbox = feature.get('bbox')
        
        if not bbox:
            lat = feature['properties']['lat']
            lon = feature['properties']['lon']
            places_url = f"https://api.geoapify.com/v2/places?categories=service.vehicle.fuel&filter=circle:{lon},{lat},10000&limit=50&apiKey={get_geoapify_key()}"
        else:
            rect = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
            places_url = f"https://api.geoapify.com/v2/places?categories=service.vehicle.fuel&filter=rect:{rect}&limit=50&apiKey={get_geoapify_key()}"
            
        places_resp = requests.get(places_url, timeout=10)
        places_resp.raise_for_status()
        places_data = places_resp.json()
        
        geo_stations_dict = {}
        for place in places_data.get('features', []):
            props = place['properties']
            supported_fuels = ['petrol', 'diesel']
            if 'cng' in str(props.get('name', '')).lower() or 'cng' in str(props.get('street', '')).lower():
                supported_fuels.append('cng')
                
            pid = props.get('place_id')
            geo_stations_dict[pid] = {
                'id': pid,
                'name': props.get('name', 'Fuel Station'),
                'latitude': props.get('lat'),
                'longitude': props.get('lon'),
                'address': props.get('formatted', ''),
                'city': props.get('city', city),
                'state': props.get('state', ''),
                'supported_fuels': supported_fuels,
                'phone': props.get('contact', {}).get('phone', ''),
                'opening_hours': props.get('opening_hours', ''),
                'source': 'geoapify',
                'is_verified': False
            }
            
        from stations.models import FuelStation
        if bbox:
            db_stations = FuelStation.objects.filter(
                latitude__gte=bbox[1], latitude__lte=bbox[3],
                longitude__gte=bbox[0], longitude__lte=bbox[2]
            ).prefetch_related('prices')
        else:
            db_stations = FuelStation.objects.filter(city__icontains=city).prefetch_related('prices')
            
        for db_s in db_stations:
            prices = [{'fuel_type': p.fuel_type.upper(), 'price': str(p.price), 'unit': p.unit, 'currency': p.currency} for p in db_s.prices.all()]
            s_data = {
                'id': db_s.external_source_id or str(db_s.id),
                'db_id': db_s.id,
                'name': db_s.name,
                'latitude': db_s.latitude,
                'longitude': db_s.longitude,
                'address': db_s.address,
                'city': db_s.city,
                'state': db_s.state,
                'supported_fuels': db_s.supported_fuels,
                'phone': db_s.phone,
                'opening_hours': db_s.opening_hours,
                'source': 'manual',
                'is_verified': db_s.is_verified,
                'prices': prices
            }
            
            if db_s.external_source_id and db_s.external_source_id in geo_stations_dict:
                geo_stations_dict[db_s.external_source_id] = s_data
            else:
                geo_stations_dict[str(db_s.id)] = s_data
                
        return Response({
            "city": city,
            "center": [feature['properties']['lat'], feature['properties']['lon']],
            "stations": list(geo_stations_dict.values())
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_station_details(request, place_id):
    if not place_id:
        return Response({"error": "Missing place_id"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        from stations.models import FuelStation
        db_s = FuelStation.objects.filter(external_source_id=place_id).first()
        if not db_s and place_id.isdigit():
            db_s = FuelStation.objects.filter(id=place_id).first()
            
        if db_s:
            prices = [{'fuel_type': p.fuel_type.upper(), 'price': str(p.price), 'unit': p.unit, 'currency': p.currency} for p in db_s.prices.all()]
            return Response({
                'id': db_s.external_source_id or str(db_s.id),
                'db_id': db_s.id,
                'name': db_s.name,
                'latitude': db_s.latitude,
                'longitude': db_s.longitude,
                'address': db_s.address,
                'city': db_s.city,
                'state': db_s.state,
                'supported_fuels': db_s.supported_fuels,
                'phone': db_s.phone,
                'opening_hours': db_s.opening_hours,
                'source': 'manual',
                'is_verified': db_s.is_verified,
                'prices': prices
            })
            
        url = f"https://api.geoapify.com/v2/place-details?id={place_id}&apiKey={get_geoapify_key()}"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        if not data.get('features'):
            return Response({"error": "Station not found"}, status=status.HTTP_404_NOT_FOUND)
            
        props = data['features'][0]['properties']
        
        supported_fuels = ['petrol', 'diesel']
        if 'cng' in str(props.get('name', '')).lower() or 'cng' in str(props.get('street', '')).lower():
            supported_fuels.append('cng')
            
        station = {
            'id': props.get('place_id'),
            'name': props.get('name', 'Fuel Station'),
            'latitude': props.get('lat'),
            'longitude': props.get('lon'),
            'address': props.get('formatted', ''),
            'city': props.get('city', ''),
            'state': props.get('state', ''),
            'supported_fuels': supported_fuels,
            'phone': props.get('contact', {}).get('phone', ''),
            'opening_hours': props.get('opening_hours', ''),
            'source': 'geoapify',
            'is_verified': False,
        }
        
        return Response(station)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_station_prices(request, place_id):
    from stations.models import FuelStation, FuelPrice
    prices_data = []
    
    station = FuelStation.objects.filter(external_source_id=place_id).first()
    if not station and place_id.isdigit():
        station = FuelStation.objects.filter(id=place_id).first()
        
    if not station:
        return Response([])
    
    fuel_types = ['petrol', 'diesel', 'cng']
    for ft in fuel_types:
        latest_price = FuelPrice.objects.filter(fuel_type=ft, station=station).order_by('-verified_at').first()
        if latest_price:
            prices_data.append({
                'id': latest_price.id,
                'fuel_type': latest_price.get_fuel_type_display().upper(),
                'price': str(latest_price.price),
                'unit': latest_price.unit,
                'currency': latest_price.currency,
                'source': latest_price.source or 'Govt Data',
                'verified_at': latest_price.verified_at.isoformat()
            })
            
    return Response(prices_data)
