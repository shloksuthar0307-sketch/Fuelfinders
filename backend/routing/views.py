import os
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')

@api_view(['GET'])
@permission_classes([AllowAny])
def geocode_search(request):
    """
    GET /api/routing/geocode/?q=<search_query>
    """
    query = request.query_params.get('q', '')
    if not query:
        return Response({"error": "Missing 'q' parameter"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        response = requests.get(url, params={'address': query, 'key': GOOGLE_MAPS_API_KEY}, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 'OK':
            # Zero results is OK in terms of no crash, but let's return empty list
            if data.get('status') == 'ZERO_RESULTS':
                return Response([])
            return Response({"error": data.get('error_message', data.get('status'))}, status=status.HTTP_400_BAD_REQUEST)
            
        results = []
        for i, item in enumerate(data.get('results', [])):
            results.append({
                'place_id': item.get('place_id', str(i)),
                'lat': str(item['geometry']['location']['lat']),
                'lon': str(item['geometry']['location']['lng']),
                'display_name': item.get('formatted_address', '')
            })
        return Response(results)
    except requests.RequestException as e:
        return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_route(request):
    """
    GET /api/routing/route/?origin=lat,lng&destination=lat,lng
    """
    origin = request.query_params.get('origin')
    destination = request.query_params.get('destination')
    
    if not origin or not destination:
        return Response({"error": "Missing origin or destination"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        url = "https://maps.googleapis.com/maps/api/directions/json"
        response = requests.get(url, params={
            'origin': origin,
            'destination': destination,
            'key': GOOGLE_MAPS_API_KEY
        }, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 'OK':
            return Response({"error": data.get('error_message', data.get('status'))}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
