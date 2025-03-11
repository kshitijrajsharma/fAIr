from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db import models


class OsmUser(AbstractUser):

    NOTIFICATION_METHOD_CHOICES = [
        ("email", "Email"),
        ("web", "Web"),
    ]

    class Meta:
        db_table = "auth_user"

    REQUIRED_FIELDS = ("osm_id",)
    osm_id = models.BigIntegerField(blank=False, unique=True, null=False)
    img_url = models.URLField(null=True, blank=True, max_length=1000)

    notifications_delivery_methods = ArrayField(
        models.CharField(max_length=10, choices=NOTIFICATION_METHOD_CHOICES),
        default=list,
        blank=True,
    )
