from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FuelStation, FuelPrice
from .serializers import FuelStationSerializer, FuelPriceSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class FuelStationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing fuel stations.
    Read-only for public access. Admin can perform CRUD.
    """
    queryset = FuelStation.objects.all()
    serializer_class = FuelStationSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        q = self.request.query_params.get('q', None)
        if q:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=q) | 
                Q(city__icontains=q) | 
                Q(address__icontains=q)
            )
        return queryset
    
    # We will implement geospatial queries here later (e.g., nearby, along-route)
    
    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby(self, request):
        """
        Placeholder for spatial search.
        Requires lat, lng, radius.
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 5)
        
        # For now, just return all or a sliced list since we don't have PostGIS/math setup yet
        # In phase 4 we'll do real haversine/postgis queries
        return Response({"message": "Spatial search not fully implemented in Phase 1.", "data": []})

    @action(detail=False, methods=['get'], url_path='along-route')
    def along_route(self, request):
        """
        Find stations along a route.
        Expects: origin (lat,lng), destination (lat,lng), tolerance (km, default 5)
        """
        origin = request.query_params.get('origin')
        destination = request.query_params.get('destination')
        tolerance_str = request.query_params.get('tolerance', '5')
        
        if not origin or not destination:
            return Response({"error": "Missing origin or destination"}, status=400)
            
        try:
            tolerance = float(tolerance_str)
        except ValueError:
            tolerance = 5.0

        # 1. Fetch route from OSRM API (Free, no key required)
        import requests
        import polyline
        
        # OSRM expects longitude,latitude format
        origin_lon_lat = f"{origin.split(',')[1]},{origin.split(',')[0]}"
        dest_lon_lat = f"{destination.split(',')[1]},{destination.split(',')[0]}"
        
        url = f"http://router.project-osrm.org/route/v1/driving/{origin_lon_lat};{dest_lon_lat}"
        try:
            resp = requests.get(url, params={'overview': 'full'}, timeout=5)
            resp.raise_for_status()
            route_data = resp.json()
            
            if route_data.get('code') != 'Ok':
                return Response({"error": route_data.get('message', 'Routing failed')}, status=400)
                
            # OSRM returns an encoded polyline in 'geometry'
            encoded_polyline = route_data['routes'][0]['geometry']
            decoded_points = polyline.decode(encoded_polyline) # returns [(lat, lng), ...]
            geometry = [[lng, lat] for lat, lng in decoded_points]
        except Exception as e:
            return Response({"error": f"Routing failed: {str(e)}"}, status=502)

        # 2. Bounding box optimization
        lngs = [c[0] for c in geometry]
        lats = [c[1] for c in geometry]
        min_lng, max_lng = min(lngs), max(lngs)
        min_lat, max_lat = min(lats), max(lats)
        
        # Add a rough buffer to bounding box (1 degree is ~111km)
        buffer_deg = tolerance / 111.0 
        
        # Query stations within bounding box
        candidate_stations = FuelStation.objects.filter(
            latitude__gte=min_lat - buffer_deg,
            latitude__lte=max_lat + buffer_deg,
            longitude__gte=min_lng - buffer_deg,
            longitude__lte=max_lng + buffer_deg
        )
        
        # 3. Filter precisely using haversine distance to polyline
        from .utils import min_distance_to_polyline
        valid_stations = []
        for station in candidate_stations:
            dist = min_distance_to_polyline(station.latitude, station.longitude, geometry)
            if dist <= tolerance:
                # We can inject 'distance_from_route' dynamically if needed
                serializer = self.get_serializer(station)
                data = serializer.data
                data['distance_from_route'] = round(dist, 2)
                valid_stations.append(data)
                
        # Sort by distance from route as a simple default
        valid_stations.sort(key=lambda x: x['distance_from_route'])

        return Response({
            "stations": valid_stations,
            "route_geometry": geometry
        })

    @action(detail=False, methods=['post'], url_path='import-geoapify')
    def import_geoapify(self, request):
        city = request.query_params.get('city') or request.data.get('city')
        if not city:
            return Response({"error": "City is required"}, status=400)
            
        import requests
        from django.utils import timezone
        from django.conf import settings
        
        GEOAPIFY_API_KEY = settings.GEOAPIFY_API_KEY
        geocode_url = f"https://api.geoapify.com/v1/geocode/search?text={city}&format=json&apiKey={GEOAPIFY_API_KEY}"
        resp = requests.get(geocode_url)
        if not resp.ok:
            return Response({"error": "Geocoding failed"}, status=400)
            
        data = resp.json()
        if not data.get('results'):
            return Response({"error": "City not found"}, status=404)
            
        bbox = data['results'][0].get('bbox')
        if not bbox:
            return Response({"error": "No bounding box found for city"}, status=400)
            
        lon_min, lat_min, lon_max, lat_max = bbox
        
        places_url = (
            f"https://api.geoapify.com/v2/places?"
            f"categories=commercial.vehicle.fuel&"
            f"filter=rect:{lon_min},{lat_min},{lon_max},{lat_max}&"
            f"limit=50&apiKey={GEOAPIFY_API_KEY}"
        )
        places_resp = requests.get(places_url)
        if not places_resp.ok:
            return Response({"error": "Places API failed"}, status=400)
            
        places_data = places_resp.json()
        features = places_data.get('features', [])
        
        added = 0
        updated = 0
        
        for feature in features:
            props = feature['properties']
            place_id = props.get('place_id')
            if not place_id:
                continue
                
            name = props.get('name', 'Unknown Fuel Station')
            lat = props.get('lat')
            lon = props.get('lon')
            address = props.get('formatted', '')
            state = props.get('state', '')
            phone = props.get('contact', {}).get('phone', '')
            
            station, created = FuelStation.objects.get_or_create(
                external_source_id=place_id,
                defaults={
                    'name': name[:255],
                    'latitude': lat,
                    'longitude': lon,
                    'address': address,
                    'city': city[:100],
                    'state': state[:100],
                    'phone': phone[:50] if isinstance(phone, str) else '',
                    'last_synced_at': timezone.now()
                }
            )
            
            if created:
                added += 1
            else:
                if not station.is_manually_edited:
                    station.name = name[:255]
                    station.latitude = lat
                    station.longitude = lon
                    station.address = address
                    station.city = city[:100]
                    station.state = state[:100]
                    station.phone = phone[:50] if isinstance(phone, str) else ''
                station.last_synced_at = timezone.now()
                station.save()
                updated += 1
                
        return Response({"added": added, "updated": updated})

    @action(detail=True, methods=['get', 'post'], url_path='prices')
    def get_prices(self, request, pk=None):
        station = self.get_object()
        if request.method == 'POST':
            serializer = FuelPriceSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(station=station)
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
            
        prices = station.prices.all()
        serializer = FuelPriceSerializer(prices, many=True)
        return Response(serializer.data)

class FuelPriceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing fuel prices.
    Only admin can modify.
    """
    queryset = FuelPrice.objects.all()
    serializer_class = FuelPriceSerializer
    permission_classes = [IsAdminOrReadOnly]
    http_method_names = ['get', 'patch', 'delete']
