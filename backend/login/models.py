from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db import models


class OsmUser(AbstractUser):
    """
    Represents an OSM user in the system.

    Attributes:
        osm_id (int): The OSM ID of the user.
        img_url (str): The URL of the user's profile image.
        notifications_delivery_methods (list): The methods for delivering notifications to the user.
        newsletter_subscription (bool): Whether the user is subscribed to the newsletter.
        account_deletion_requested (bool): Whether the user has requested account deletion.
    """

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
        default=["web"],
        blank=True,
    )
    newsletter_subscription = models.BooleanField(default=False)
    account_deletion_requested = models.BooleanField(default=False)
