from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

User = get_user_model()

class UserModelTest(TestCase):
    """
    Test cases for the User model.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )

    def test_user_creation(self):
        """
        Test that a user is created successfully.
        """
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'testuser@example.com')
        self.assertTrue(self.user.check_password('testpassword'))

    def test_user_str(self):
        """
        Test the string representation of the user.
        """
        self.assertEqual(str(self.user), 'testuser')


class LoginAPITest(TestCase):
    """
    Test cases for the login API.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )
        self.login_url = reverse('login')

    def test_login_success(self):
        """
        Test that a user can log in successfully with correct credentials.
        """
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_failure(self):
        """
        Test that login fails with incorrect credentials.
        """
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('token', response.data)
