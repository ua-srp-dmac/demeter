import json
import requests
import logging
import traceback
import time

from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from datetime import timedelta

from .models import CyVerseAccount
from .helpers import format_size


def is_user_logged_in(request):
    """ Checks if user is authenticated through Django.
    """
    if request.user.is_authenticated:
        return HttpResponse(status=200)

    return HttpResponse(status=403)

def user_de_info_set(request):
    """ Checks if user has a valid Terrain API Token.
    """
    username = None
    if request.user.is_authenticated:
        username = request.user.username
        try:
            acc = CyVerseAccount.objects.get(user__username=username)
            if (acc.api_token and (acc.api_token_expiration > timezone.now() )):
                return HttpResponse(status=200)
        except:
            pass

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
            return HttpResponse(status=400)
                
        try:
            r = requests.get("https://de.cyverse.org/terrain/token", auth=(username, password))
            r.raise_for_status()
            token = r.json()['access_token']
            time = int(r.json()['expires_in'])
        except Exception as e:
            print(type(e))
            print(str(e))
            return HttpResponse(status=400)

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

    logout(request)
    return HttpResponse(status=200)


def file_list(request):
    """ returns the files and folders at the specified path,
    has additional arguments to modify how data is presented (for treeview)

    params:
    path -> path to get files and folders at
    tree -> boolean to return in tree form
    listchildren -> boolean to only list the children in an array instead of an object
    """

    if request.user.is_authenticated:
        username = request.user.username
        path='/iplant/home/' + username

        query_params = {
            "path": path,
            "limit": 100,
            "offset": 0,
            "entity-type": "file",
            "info-type": "fastq"
        }
        try:
            acc = CyVerseAccount.objects.get(user__username=username)
            print(acc.api_token)
            url = "https://de.cyverse.org/terrain/secured/filesystem/paged-directory"
            auth_headers = {"Authorization": "Bearer " + acc.api_token}
            r = requests.get(url, headers=auth_headers, params=query_params)
            r.raise_for_status()

            fileList = []
            
            for n in r.json()['files']:
                
                updated = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(n['date-modified']/1000.0))

                size = format_size(n['file-size'])

                fileList.append({
                    "name": n['label'],
                    "last_updated": updated,
                    "size": size,
                    "type": "file"
                })

            response = {
                'path': path,
                'fileList' : fileList
            }

            return JsonResponse(fileList, safe=False)

        except Exception as e:
            print (str(e))
            print ("There was an exception")
            pass

    return HttpResponse(status=400)
