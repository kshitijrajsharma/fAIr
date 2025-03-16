from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import YourModel
from .serializers import YourModelSerializer

class YourModelTestCase(TestCase):
    """
    Test case for YourModel.
    """

    def setUp(self):
        """
        Set up the test case with initial data.
        """
        self.client = APIClient()
        self.model_data = {'field1': 'value1', 'field2': 'value2'}
        self.model = YourModel.objects.create(**self.model_data)

    def test_model_creation(self):
        """
        Test the creation of YourModel.
        """
        self.assertEqual(self.model.field1, 'value1')
        self.assertEqual(self.model.field2, 'value2')

    def test_model_serialization(self):
        """
        Test the serialization of YourModel.
        """
        serializer = YourModelSerializer(self.model)
        self.assertEqual(serializer.data['field1'], 'value1')
        self.assertEqual(serializer.data['field2'], 'value2')

    def test_model_api_get(self):
        """
        Test the GET API for YourModel.
        """
        response = self.client.get(f'/api/yourmodel/{self.model.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['field1'], 'value1')
        self.assertEqual(response.data['field2'], 'value2')

    def test_model_api_post(self):
        """
        Test the POST API for YourModel.
        """
        response = self.client.post('/api/yourmodel/', self.model_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['field1'], 'value1')
        self.assertEqual(response.data['field2'], 'value2')

    def test_model_api_put(self):
        """
        Test the PUT API for YourModel.
        """
        updated_data = {'field1': 'new_value1', 'field2': 'new_value2'}
        response = self.client.put(f'/api/yourmodel/{self.model.id}/', updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['field1'], 'new_value1')
        self.assertEqual(response.data['field2'], 'new_value2')

    def test_model_api_delete(self):
        """
        Test the DELETE API for YourModel.
        """
        response = self.client.delete(f'/api/yourmodel/{self.model.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(YourModel.objects.filter(id=self.model.id).exists())
