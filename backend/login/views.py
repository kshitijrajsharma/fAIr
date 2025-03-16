import json

from core.serializers import UserStatsSerializer
from django.conf import settings
from django.http import JsonResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from login.authentication import OsmAuthentication
from login.permissions import IsOsmAuthenticated
from osm_login_python.core import Auth
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

# initialize osm_auth with our credentials
osm_auth = Auth(
    osm_url=settings.OSM_URL,
    client_id=settings.OSM_CLIENT_ID,
    client_secret=settings.OSM_CLIENT_SECRET,
    secret_key=settings.OSM_SECRET_KEY,
    login_redirect_uri=settings.OSM_LOGIN_REDIRECT_URI,
    scope=settings.OSM_SCOPE,
)


class LoginView(APIView):
    """
    View to generate login URL for OSM Login.
    """

    def get(self, request, format=None):
        """
        Generates login URL for OSM Login.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            JsonResponse: The login URL in JSON format.
        """
        login_url = osm_auth.login()
        return JsonResponse(json.loads(login_url))


class CallbackView(APIView):
    """
    View to handle the callback from OSM Login.
    """

    def get(self, request, format=None):  # pragma: no cover
        """
        Callback method redirected from OSM.

        Args:
            request (HttpRequest): The HTTP request object containing code and state as parameters redirected from OSM.

        Returns:
            JsonResponse: The access token in JSON format.
        """
        uri = request.build_absolute_uri()
        token = osm_auth.callback(uri)
        return JsonResponse(json.loads(token))


class GetMyDataView(APIView):
    """
    View to get and update the authenticated user's data.
    """
    authentication_classes = [OsmAuthentication]
    permission_classes = [IsOsmAuthenticated]

    def get(self, request, format=None):
        """
        Get the authenticated user's data.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            Response: The authenticated user's data in JSON format.
        """
        serialized_field = UserStatsSerializer(instance=request.user)
        return Response(serialized_field.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "email": openapi.Schema(
                    type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL
                )
            },
            required=["email"],
        )
    )
    def patch(self, request, format=None):
        """
        Update the authenticated user's data.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            Response: The updated user's data in JSON format.
        """
        user = request.user
        serializer = UserStatsSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
