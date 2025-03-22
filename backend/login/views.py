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

# Create your views here.
# initialize osm_auth with our credentials
osm_auth = Auth(
    osm_url=settings.OSM_URL,
    client_id=settings.OSM_CLIENT_ID,
    client_secret=settings.OSM_CLIENT_SECRET,
    secret_key=settings.OSM_SECRET_KEY,
    login_redirect_uri=settings.OSM_LOGIN_REDIRECT_URI,
    scope=settings.OSM_SCOPE,
)


class login(APIView):
    def get(self, request, format=None):
        """Generates login url for OSM Login

        Args:
            request (get): _description_

        Returns:
            json: login_url
        """
        login_url = osm_auth.login()
        return JsonResponse(json.loads(login_url))


class callback(APIView):
    def get(self, request, format=None):  # pragma: no cover
        """Callback method redirected from osm callback method

        Args:
            request (_type_): contains code and state as parametr redirected from osm

        Returns:
            json: access_token
        """
        # Generating token through osm_auth library method
        uri = request.build_absolute_uri()
        token = osm_auth.callback(uri)
        return JsonResponse(json.loads(token))


class GetMyData(APIView):
    authentication_classes = [OsmAuthentication]
    permission_classes = [IsOsmAuthenticated]

    def get(self, request, format=None):
        serialized_field = UserStatsSerializer(instance=request.user)
        return Response(serialized_field.data, status=status.HTTP_201_CREATED)

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
        user = request.user

        serializer = UserStatsSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
