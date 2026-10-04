import os
import django
import sys
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Core.settings')
django.setup()

from stations.models import FuelStation, FuelPrice

def seed():
    stations_data = [
        {
            "name": "Reliance Petrol Pump",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "address": "Bandra Kurla Complex",
            "city": "Mumbai",
            "state": "Maharashtra",
            "supported_fuels": ["petrol", "diesel"],
            "phone": "+91-9876543210",
            "is_verified": True
        },
        {
            "name": "Mahanagar Gas CNG Station",
            "latitude": 19.1136,
            "longitude": 72.8697,
            "address": "Andheri East",
            "city": "Mumbai",
            "state": "Maharashtra",
            "supported_fuels": ["cng"],
            "phone": "+91-8765432109",
            "is_verified": True
        },
        {
            "name": "IndianOil",
            "latitude": 28.7041,
            "longitude": 77.1025,
            "address": "Connaught Place",
            "city": "New Delhi",
            "state": "Delhi",
            "supported_fuels": ["petrol", "diesel", "cng"],
            "phone": "",
            "is_verified": False
        }
    ]

    for data in stations_data:
        station, created = FuelStation.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"Created station: {station.name}")
            
            # Add some prices
            if "petrol" in data["supported_fuels"]:
                FuelPrice.objects.create(station=station, fuel_type="petrol", price=106.31, unit="litre")
            if "diesel" in data["supported_fuels"]:
                FuelPrice.objects.create(station=station, fuel_type="diesel", price=94.27, unit="litre")
            if "cng" in data["supported_fuels"]:
                FuelPrice.objects.create(station=station, fuel_type="cng", price=79.00, unit="kg")
        else:
            print(f"Station already exists: {station.name}")

if __name__ == "__main__":
    seed()
