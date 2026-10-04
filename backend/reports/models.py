from django.db import models
from django.contrib.auth import get_user_model
from stations.models import FuelStation

User = get_user_model()

class StationReport(models.Model):
    REPORT_TYPES = [
        ('correction', 'Data Correction'),
        ('availability', 'Fuel Availability'),
        ('closure', 'Station Closed'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    station = models.ForeignKey(FuelStation, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField()
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.report_type} report for {self.station.name}"
