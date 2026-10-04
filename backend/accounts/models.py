from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_history')
    origin_lat = models.FloatField()
    origin_lon = models.FloatField()
    dest_lat = models.FloatField()
    dest_lon = models.FloatField()
    
    # Store selected fuels as JSON e.g. ["petrol", "diesel"]
    selected_fuel_types = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} search at {self.created_at}"
