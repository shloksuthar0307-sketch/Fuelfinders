from django.db import models
import json

# Instead of ArrayField for SQLite compatibility, we'll use a JSONField or comma-separated string for supported_fuels.
# Django 3.1+ has models.JSONField which works on SQLite.

class FuelStation(models.Model):
    external_source_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    
    # List of supported fuels: e.g., ["petrol", "diesel", "cng"]
    supported_fuels = models.JSONField(default=list, blank=True)
    
    phone = models.CharField(max_length=50, blank=True, null=True)
    opening_hours = models.CharField(max_length=255, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_manually_edited = models.BooleanField(default=False)
    
    last_synced_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({', '.join(self.supported_fuels)})"

class FuelPrice(models.Model):
    FUEL_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('cng', 'CNG'),
    ]
    UNIT_CHOICES = [
        ('litre', 'Litre'),
        ('kg', 'Kg'),
    ]
    
    station = models.ForeignKey(FuelStation, on_delete=models.CASCADE, related_name='prices')
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    currency = models.CharField(max_length=10, default='INR')
    source = models.CharField(max_length=100, blank=True, null=True)
    verified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.station.name} - {self.fuel_type}: {self.price} {self.currency}/{self.unit}"
