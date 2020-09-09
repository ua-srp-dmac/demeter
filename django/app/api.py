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
def de_login(request):
    """
    Logs into the DE via the Terrain API, stores that Token in the
    Django Model associated with the current user 

    params:
    username -> string
    password -> string
    """

    if request.method == "POST":

        data = json.loads(request.body.decode())

        username = data['username']
        password = data['password']

        if User.objects.filter(username=username).exists():
            try:
                

                r = requests.get("https://de.cyverse.org/terrain/token", auth=(username, password))
                r.raise_for_status()
                token = r.json()['access_token']
                time = int(r.json()['expires_in'])

                ## Authenticated by cyverse after this point

                accs = CyVerseAccount.objects.filter(user__username=username)

                if (len(accs)) >= 1:

                    acc = accs.first()

                    if (acc.api_token and (acc.api_token_expiration > timezone.now() )):
                        user = User.objects.filter(username=username).first()
                        # authenticate(request, username=user.username)
                        login(request, user,  backend='app.auth_backend.PasswordlessAuthBackend')
                        return HttpResponse(status=200)
                    
                    else:
                        print("deleting old token")
                        acc.delete()

                user = User.objects.filter(username=username).first()

                acc = CyVerseAccount(user=user)
                acc.api_token = token
                acc.api_token_expiration = timezone.now() + timedelta(seconds=time) 
                    
                acc.save()
                # authenticate(request, username= user.username)
                login(request, user, backend='app.auth_backend.PasswordlessAuthBackend')
                return HttpResponse(status=200)

            except Exception as e:
                print(type(e))
                print(str(e))
                return HttpResponse(status=400)
                
        else:
            try:
                print(username)
                r = requests.get("https://de.cyverse.org/terrain/token", auth=(username, password))
                r.raise_for_status()
                token = r.json()['access_token']
                time = int(r.json()['expires_in'])

                # Authenticated by cyverse after this point

                user = User.objects.create_user(username=username, email=username+'@beatles.com')
                acc = CyVerseAccount(user=user)
                acc.api_token = token
                acc.api_token_expiration = timezone.now() + timedelta(seconds=time) 
                acc.save()
                user.save()
                # authenticate(request, username=user.username)
                login(request, user,  backend='app.auth_backend.PasswordlessAuthBackend')
                return HttpResponse(status=200)
            except Exception as e:
                print("c")
                traceback.print_exc()
                print(type(e))
                print(str(e))
                return HttpResponse(status=400)
    print("f")
    return HttpResponse(status=400)


def signout(request):
    """
    Logs into the DE via the Terrain API, stores that Token in the
    Django Model associated with the current user 
    
    
    params:
    username -> string
    password -> string
    """

    logout(request)
    return HttpResponse(status=200)


def de_file_list(request):
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
