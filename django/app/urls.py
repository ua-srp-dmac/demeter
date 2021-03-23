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
from django.views.decorators.csrf import csrf_exempt

from .api import app_login, app_logout, is_user_logged_in, file_list, file_transfer
from .api import bowtie2_analysis, analysis_list, star_analysis, bowtie2_paired, star_paired
from .views import FrontendAppView

urlpatterns = [
    path('', FrontendAppView.as_view()),
    path('launch', FrontendAppView.as_view()),
    path('analyses', FrontendAppView.as_view()),
    path('admin/', admin.site.urls),
    path('api/login/', app_login, name='app_login'),
    path('api/logout/', app_logout, name='app_logout'),
    path('api/auth/', is_user_logged_in, name='is_user_logged_in'),
    path('api/files/', file_list, name='file_list'),
    path('api/file-transfer/', file_transfer, name='file_transfer'),
    path('api/analyses/', analysis_list, name='analysis_list'),
    path('api/bowtie2_analysis/', bowtie2_analysis, name='bowtie2_analysis'),
    path('api/bowtie2_paired/', bowtie2_paired, name='bowtie2_paired'),
    path('api/star_analysis/', star_analysis, name='star_analysis'),
    path('api/star_paired/', star_paired, name='star_paired'),
]
