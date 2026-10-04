from django.urls import path
from .views import geocode_search, get_route

urlpatterns = [
    path('geocode/', geocode_search, name='geocode_search'),
    path('route/', get_route, name='get_route'),
]
