"""app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from .api import app_login, app_logout, is_user_logged_in, file_list, submit_analysis
from .views import FrontendAppView

urlpatterns = [
    path('', FrontendAppView.as_view()),
    path('admin/', admin.site.urls),

    path('api/login/', app_login, name='app_login'),
    path('api/logout/', app_logout, name='app_logout'),
    path('api/auth/', is_user_logged_in, name='is_user_logged_in'),
    path('api/files/', file_list, name='file_list'),
    path('api/submit-analysis/', submit_analysis, name='submit_analysis'),
]
