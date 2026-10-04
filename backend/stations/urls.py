from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FuelStationViewSet

router = DefaultRouter()
router.register(r'', FuelStationViewSet, basename='station')

urlpatterns = [
    path('', include(router.urls)),
]
