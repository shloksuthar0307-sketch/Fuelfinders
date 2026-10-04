from django.db import models
from django.contrib.auth import get_user_model
from stations.models import FuelStation

User = get_user_model()

class FavoriteStation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    station = models.ForeignKey(FuelStation, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'station')

    def __str__(self):
        return f"{self.user.username} - {self.station.name}"
