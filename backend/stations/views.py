from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FuelStation, FuelPrice
from .serializers import FuelStationSerializer, FuelPriceSerializer

class FuelStationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing fuel stations.
    Read-only for public access. Admin can manage via Django admin.
    """
    queryset = FuelStation.objects.all()
    serializer_class = FuelStationSerializer
    
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

        # 1. Fetch route from Google Maps API
        import requests
        import polyline
        import os
        
        url = "https://maps.googleapis.com/maps/api/directions/json"
        try:
            resp = requests.get(url, params={
                'origin': origin,
                'destination': destination,
                'key': os.environ.get('GOOGLE_MAPS_API_KEY', '')
            }, timeout=5)
            resp.raise_for_status()
            route_data = resp.json()
            
            if route_data.get('status') != 'OK':
                return Response({"error": route_data.get('error_message', route_data.get('status'))}, status=400)
                
            # Google maps returns an encoded polyline. We need list of [lng, lat]
            encoded_polyline = route_data['routes'][0]['overview_polyline']['points']
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

    @action(detail=True, methods=['get'], url_path='prices')
    def get_prices(self, request, pk=None):
        station = self.get_object()
        prices = station.prices.all()
        serializer = FuelPriceSerializer(prices, many=True)
        return Response(serializer.data)
