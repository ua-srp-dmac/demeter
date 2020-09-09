import json
import requests
import time

from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from datetime import timedelta

from .models import CyVerseAccount
from .helpers import format_size


def is_user_logged_in(request):
    """ Checks if user is logged into Django AND has a valid Terrain API Token.
    """

    # check user is logged into Django
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
            print(type(e))
            print(str(e))
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

    logout(request)
    return HttpResponse(status=200)


def file_list(request):
    """ Returns the fastq files in the user's home directory (for now).
    TODO: Dynamically show files specific to the user's Group affiliations.
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
            account = CyVerseAccount.objects.get(user__username=username)
            url = "https://de.cyverse.org/terrain/secured/filesystem/paged-directory"
            auth_headers = {"Authorization": "Bearer " + account.api_token}
            r = requests.get(url, headers=auth_headers, params=query_params)
            r.raise_for_status()

            # {
            #     'infoType': 'fastq',
            #     'path': '/iplant/home/michellito/ERR008015.fastq',
            #     'date-created': 1599070087000,
            #     'permission': 'own',
            #     'date-modified': 1599070087000,
            #     'file-size': 2394058,
            #     'badName': False,
            #     'isFavorite': False,
            #     'label': 'ERR008015.fastq',
            #     'id': '4139e402-ed47-11ea-9281-90e2ba675364'
            # }

            fileList = []
            
            for item in r.json()['files']:
                
                updated = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(item['date-modified']/1000.0))
                size = format_size(item['file-size'])

                fileList.append({
                    "name": item['label'],
                    "last_updated": updated,
                    "size": size,
                    "type": "file",
                    "path": item['path']
                })

            return JsonResponse(fileList, safe=False)

        except Exception as e:
            print (str(e))
            pass

    return HttpResponse(status=400)


def submit_analysis(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST":

        form_data = json.loads(request.body.decode())

        genome = form_data['genome']
        fastq = form_data['fastq']
        system_id = 'de'
        app_id = '4f9b03f0-f2d3-11ea-9df7-008cfa5ae621'
        username = request.user.username

        config = {
           "4f9b8fa0-f2d3-11ea-9df7-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/michellito/genomes/bowtie2_mm10",
           "4f9b8fa0-f2d3-11ea-9df7-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "mm10",
           "4f9b8fa0-f2d3-11ea-9df7-008cfa5ae621_4f9deef8-f2d3-11ea-9df7-008cfa5ae621": fastq,
        }

        time = timezone.now()
        print(str(time))

        request_body = {
            "name": "bowtie2_" + str(time),
            "app_id": app_id,
            "system_id": system_id,
            "debug": False,
            "output_dir": "/iplant/home/" + username + "/analyses",
            "notify": True
        }

        request_body['config'] = config

        username = None
        if request.user.is_authenticated:
            username = request.user.username
            try:
                print('submitting to cyverse!')
                acc = CyVerseAccount.objects.get(user__username=username)
                auth_headers = {"Authorization": "Bearer " + acc.api_token}
                r = requests.post("https://de.cyverse.org/terrain/analyses", headers=auth_headers, json=request_body)
                print (r.content)
                r.raise_for_status()
                return JsonResponse(r.json())

            except:
                print ("testing here")
                pass

    return HttpResponse(status=400)
