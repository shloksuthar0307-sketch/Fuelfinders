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
        url = f"https://api.geoapify.com/v1/geocode/autocomplete?text={query}&limit=5&apiKey={get_geoapify_key()}"
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

@api_view(['GET'])
@permission_classes([AllowAny])
def geocode_search(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response([])
        
    try:
        url = f"https://api.geoapify.com/v1/geocode/search?text={query}&limit=5&apiKey={get_geoapify_key()}"
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
        # 1. Get base route
        o_lat, o_lon = origin.split(',')
        d_lat, d_lon = destination.split(',')
        route_url = f"https://api.geoapify.com/v1/routing?waypoints={o_lat},{o_lon}|{d_lat},{d_lon}&mode=drive&apiKey={get_geoapify_key()}"
        route_resp = requests.get(route_url, timeout=10)
        route_resp.raise_for_status()
        route_data = route_resp.json()
        
        if not route_data.get('features'):
            return Response({"error": "No route found"}, status=status.HTTP_404_NOT_FOUND)
            
        feature = route_data['features'][0]
        base_distance = feature['properties']['distance'] # in meters
        base_time = feature['properties']['time'] # in seconds
        geometry = feature['geometry']['coordinates'][0] # list of [lon, lat]
        
        # 2. Get Bounding Box and query Places
        lons = [c[0] for c in geometry]
        lats = [c[1] for c in geometry]
        min_lon, max_lon = min(lons), max(lons)
        min_lat, max_lat = min(lats), max(lats)
        
        # Buffer bounding box (roughly 1 degree = 111km)
        buffer_deg = tolerance / 111.0
        rect = f"{min_lon-buffer_deg},{min_lat-buffer_deg},{max_lon+buffer_deg},{max_lat+buffer_deg}"
        
        places_url = f"https://api.geoapify.com/v2/places?categories=service.vehicle.fuel&filter=rect:{rect}&limit=100&apiKey={get_geoapify_key()}"
        places_resp = requests.get(places_url, timeout=10)
        places_resp.raise_for_status()
        places_data = places_resp.json()
        
        # 3. Filter stations near route and by fuel
        candidate_stations = []
        for place in places_data.get('features', []):
            props = place['properties']
            
            # Simple mock of fuel types since Geoapify doesn't reliably return specific fuels for every station in basic tier
            # In a real app we'd parse props.get('details', {}).get('facilities')
            supported_fuels = ['petrol', 'diesel'] # Default assumption for gas stations
            if 'cng' in str(props.get('name', '')).lower() or 'cng' in str(props.get('street', '')).lower():
                supported_fuels.append('cng')
                
            if fuels and not any(f in supported_fuels for f in fuels):
                continue
                
            p_lat = props.get('lat')
            p_lon = props.get('lon')
            dist = min_distance_to_polyline(p_lat, p_lon, geometry)
            
            if dist <= tolerance:
                candidate_stations.append({
                    'id': props.get('place_id'),
                    'name': props.get('name', 'Fuel Station'),
                    'latitude': p_lat,
                    'longitude': p_lon,
                    'address': props.get('formatted', ''),
                    'city': props.get('city', ''),
                    'state': props.get('state', ''),
                    'supported_fuels': supported_fuels,
                    'distance_from_route': dist,
                })
                
        # 4. Rank and limit stations (take top 10 closest to route to avoid abusing Routing API)
        candidate_stations.sort(key=lambda x: x['distance_from_route'])
        candidate_stations = candidate_stations[:10]
        
        # 5. Calculate detour using routing (or approximate)
        # We'll use straight line detour approximation here to avoid 20+ routing calls, 
        # but the formula is: detour = dist(orig, station) + dist(station, dest) - base_dist
        # Actually, let's use Route Matrix API if possible, or just simple math.
        for station in candidate_stations:
            # Approx detour using haversine from origin to station to dest
            # For exact detour, we'd call Geoapify Routing, but to save time & requests:
            station['detour_distance'] = station['distance_from_route'] * 2 # Rough estimate
            station['extra_time'] = int((station['detour_distance'] / 30.0) * 60) # Assume 30km/h detour speed
        
        return Response({
            "route_geometry": geometry,
            "base_distance": base_distance,
            "base_time": base_time,
            "stations": candidate_stations
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
            'is_verified': True,
        }
        
        return Response(station)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_station_prices(request, place_id):
    from stations.models import FuelPrice
    prices_data = []
    
    fuel_types = ['petrol', 'diesel', 'cng']
    for ft in fuel_types:
        latest_price = FuelPrice.objects.filter(fuel_type=ft).order_by('-verified_at').first()
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
