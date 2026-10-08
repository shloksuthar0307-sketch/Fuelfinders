from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from stations.models import FuelStation
import requests

class Command(BaseCommand):
    help = 'Syncs fuel stations from Geoapify for a given city'

    def add_arguments(self, parser):
        parser.add_argument('--city', type=str, required=True, help='City to sync')

    def handle(self, *args, **options):
        city = options['city']
        self.stdout.write(f'Syncing stations for {city}...')
        
        GEOAPIFY_API_KEY = settings.GEOAPIFY_API_KEY
        geocode_url = f"https://api.geoapify.com/v1/geocode/search?text={city}&format=json&apiKey={GEOAPIFY_API_KEY}"
        resp = requests.get(geocode_url)
        if not resp.ok:
            self.stderr.write('Geocoding failed')
            return
            
        data = resp.json()
        if not data.get('results'):
            self.stderr.write('City not found')
            return
            
        bbox = data['results'][0].get('bbox')
        if not bbox:
            self.stderr.write('No bounding box found for city')
            return
            
        lon_min, lat_min, lon_max, lat_max = bbox
        
        places_url = (
            f"https://api.geoapify.com/v2/places?"
            f"categories=commercial.vehicle.fuel&"
            f"filter=rect:{lon_min},{lat_min},{lon_max},{lat_max}&"
            f"limit=50&apiKey={GEOAPIFY_API_KEY}"
        )
        places_resp = requests.get(places_url)
        if not places_resp.ok:
            self.stderr.write('Places API failed')
            return
            
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
                
        self.stdout.write(self.style.SUCCESS(f'Successfully synced {city}: {added} added, {updated} updated.'))
