from django.urls import path

# now import the views.py file into this code
from . import views

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("callback/", views.CallbackView.as_view(), name="callback"),
    path("me/", views.GetMyDataView.as_view(), name="get_my_data"),
]
