from rest_framework import serializers
from .models import FuelStation, FuelPrice

class FuelPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelPrice
        fields = ['id', 'fuel_type', 'price', 'unit', 'currency', 'source', 'verified_at']

class FuelStationSerializer(serializers.ModelSerializer):
    prices = FuelPriceSerializer(many=True, read_only=True)

    class Meta:
        model = FuelStation
        fields = [
            'id', 'external_source_id', 'name', 'latitude', 'longitude',
            'address', 'city', 'state', 'supported_fuels', 'phone',
            'opening_hours', 'is_verified', 'last_synced_at', 'created_at',
            'updated_at', 'prices'
        ]
