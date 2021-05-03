import json
import requests

from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.shortcuts import redirect

from datetime import timedelta

from app.models import CyVerseAccount
from django.contrib.auth.models import User


def keycloak(request):
    """ Returns request headers.
    """
    
    string = request.META.get('OIDC_preferred_username', None)

    return HttpResponse(string, status=200)


def is_user_logged_in(request):
    """ Checks if user is logged into Django AND has a valid Terrain API Token.
    """
    # check user is logged into Django

    username = request.META.get('OIDC_preferred_username', None)

    if username:
        return HttpResponse(status=200)

    if request.user.is_authenticated:
        try:
            # check that user has non-expired Terrain API token, else log out.
            account = CyVerseAccount.objects.get(user=request.user)
            if account.api_token and (account.api_token_expiration > timezone.now()):
                return HttpResponse(status=200)
            else:
                logout(request)
        except:
            logout(request)

    return HttpResponse(status=403)

@csrf_exempt
def app_login(request):
    """
    Logs into the CyVerse via Terrain, and stores the API token in the
    CyVerseAccount model for the logged in User.

    params:
    username -> string
    password -> string
    """

    if request.method == "POST":

        data = json.loads(request.body.decode())

        username = data['username']
        password = data['password']
        
        try:
            user = User.objects.get(username=username)
        except:
            return HttpResponse('No account with this username was found.', status=400)
                
        try:
            r = requests.get("https://de.cyverse.org/terrain/token", auth=(username, password))
            r.raise_for_status()
            token = r.json()['access_token']
            time = int(r.json()['expires_in'])
        except Exception as e:
            return HttpResponse('Error logging into CyVerse. Make sure you are using your CyVerse credentials.', status=400)

        ## Authenticated by cyverse after this point
        try: 
            account = CyVerseAccount.objects.get(user=user)
        except:
            account = CyVerseAccount.objects.create(user=user)

        account.api_token = token
        account.api_token_expiration = timezone.now() + timedelta(seconds=time) 
        account.save()
            
        login(request, user, backend='app.auth_backend.PasswordlessAuthBackend')   
        return HttpResponse(status=200)
        
    return HttpResponse(status=400)


def app_logout(request):
    """
    Logs out of Django.
    """

    username = request.META.get('OIDC_preferred_username', None)

    if username:
        response = redirect('https://demeter.pharmacy.arizona.edu/redirect_uri?logout=https://demeter.pharmacy.arizona.edu')
        return response
    
    logout(request)
    return HttpResponse(status=200)