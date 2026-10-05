from django.urls import path
from .views import autocomplete, geocode_search, reverse_geocode, get_route, get_route_stations, get_station_details, get_station_prices

urlpatterns = [
    path('autocomplete/', autocomplete, name='autocomplete'),
    path('geocode/', geocode_search, name='geocode_search'),
    path('reverse-geocode/', reverse_geocode, name='reverse_geocode'),
    path('route/', get_route, name='get_route'),
    path('route-stations/', get_route_stations, name='get_route_stations'),
    path('station/<str:place_id>/', get_station_details, name='get_station_details'),
    path('station/<str:place_id>/prices/', get_station_prices, name='get_station_prices'),
]
