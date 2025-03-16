from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from backend.core.models import YourModel
from backend.core.serializers import YourModelSerializer

BASE_URL = "http://testserver/api"


class CoreViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.home_url = f"{BASE_URL}/"
        self.model_instance = YourModel.objects.create(field1="value1", field2="value2")

    def test_home_redirect(self):
        res = self.client.get(self.home_url)
        self.assertEqual(res.status_code, status.HTTP_302_FOUND)
        self.assertRedirects(res, reverse("schema-swagger-ui"))

    def test_model_serialization(self):
        serializer = YourModelSerializer(self.model_instance)
        self.assertEqual(serializer.data["field1"], "value1")
        self.assertEqual(serializer.data["field2"], "value2")
