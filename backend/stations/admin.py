from django.contrib import admin
from .models import FuelStation, FuelPrice

@admin.register(FuelStation)
class FuelStationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'is_verified')
    search_fields = ('name', 'city', 'external_source_id')
    list_filter = ('is_verified', 'state')

@admin.register(FuelPrice)
class FuelPriceAdmin(admin.ModelAdmin):
    list_display = ('station', 'fuel_type', 'price', 'unit', 'currency', 'verified_at')
    list_filter = ('fuel_type', 'unit', 'currency')
    search_fields = ('station__name',)
