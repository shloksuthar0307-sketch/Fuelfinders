from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FuelStationViewSet, FuelPriceViewSet

router = DefaultRouter()
router.register(r'prices', FuelPriceViewSet, basename='price')
router.register(r'', FuelStationViewSet, basename='station')

urlpatterns = [
    path('', include(router.urls)),
]
