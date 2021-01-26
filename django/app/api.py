import json
import requests
import time
from urllib.parse import urlencode, quote

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
                    "path": item['path'],
                    "id": item['id']
                })

            return JsonResponse(fileList, safe=False)

        except Exception as e:
            print (str(e))
            pass

    return HttpResponse(status=400)


def analysis_list(request):
    """ Returns the user's analyses and their statuses.
    """

    if request.user.is_authenticated:

        username = request.user.username

        query_params = {
            "filter": json.dumps([
                { "field": "app_name", "value": "demeter" }
            ]),
        }

        query_str = urlencode(query_params, encoding='utf-8', quote_via=quote)

        try:
            account = CyVerseAccount.objects.get(user__username=username)
            url = "https://de.cyverse.org/terrain/analyses?" + query_str
            auth_headers = {"Authorization": "Bearer " + account.api_token}
            r = requests.get(url, headers=auth_headers)
            print(r)
            r.raise_for_status()

            analysisList = []

            for item in r.json()['analyses']:
                
                start_date = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(float(item['startdate'])/1000.0))

                end_date = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(float(item['enddate'])/1000.0))
                
                analysisList.append({
                    "name": item['name'],
                    "app_name": item['app_name'],
                    "results_folder": item['resultfolderid'],
                    "start_date": start_date,
                    "end_date": end_date,
                    "status": item['status']
                })

            return JsonResponse(analysisList, safe=False)

        except Exception as e:
            print (str(e))
            pass

    return HttpResponse(status=400)


def bowtie2_analysis(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST" and request.user.is_authenticated:
        
        # DNAseq pipeline app ID
        app_id = '10cabb5a-0757-11eb-8b4c-008cfa5ae621'

        #bowtie2 app ID
        # app_id = '4f9b03f0-f2d3-11ea-9df7-008cfa5ae621'
        system_id = 'de'

        username = request.user.username
        home_directory = '/iplant/home/' + username + '/'

        form_data = json.loads(request.body.decode())
        groups = form_data['groups']

        for group in groups:

            if group['files']:
                fastq = group['files']
            else:
                continue

            genome = group['genome']
            file_name = fastq[0].split(home_directory)[1].split('.')[0]

            # bowtie2config contains app parameters
            human_config = {
               # index folder
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/michellito/genomes/hg38/Sequence/Bowtie2Index",
               # index name
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "genome",
               # fastq file
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            }

            mouse_config = {
               # index folder
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/michellito/genomes/bowtie2_mm10",
               # index name
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "mm10",
               # fastq file
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            }

            time = timezone.now()

            request_body = {
                "name": file_name + "_DNAseq_" + str(time),
                "app_id": app_id,
                "system_id": system_id,
                "debug": False,
                "output_dir": "/iplant/home/" + username + "/analyses",
                "notify": True
            }

            if genome == 'mouse':
                request_body['config'] = mouse_config
            elif genome == 'human':
                request_body['config'] = human_config

            try:
                print('submitting to cyverse!')
                acc = CyVerseAccount.objects.get(user__username=username)
                auth_headers = {"Authorization": "Bearer " + acc.api_token}
                r = requests.post("https://de.cyverse.org/terrain/analyses", headers=auth_headers, json=request_body)
                print (r.content)
                r.raise_for_status()
                # return JsonResponse(r.json())

            except:
                print ("testing here")
                pass

    return HttpResponse(status=200)


def bowtie2_paired(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST" and request.user.is_authenticated:
        
        # DNAseq pipeline app ID
        app_id = '10cabb5a-0757-11eb-8b4c-008cfa5ae621'

        #bowtie2 app ID
        # app_id = '4f9b03f0-f2d3-11ea-9df7-008cfa5ae621'
        system_id = 'de'

        username = request.user.username
        home_directory = '/iplant/home/' + username + '/'

        form_data = json.loads(request.body.decode())
        selected_files = form_data['selectedFiles']

        
        group1 = [x for x in selected_files if x['pair'] == 1]
        group2 = [x for x in selected_files if x['pair'] == 2]
        # print(group1)
        # print(group2)
        
        sorted_group1 = sorted(group1, key=lambda k: k['position']) 
        sorted_group2 = sorted(group2, key=lambda k: k['position']) 
        print(sorted_group1)
        print(sorted_group2)

        fastq = []
        paired = []

        for item in sorted_group1:
            fastq.append(item['path'])
        
        for item in sorted_group2:
            paired.append(item['path'])


        genome = sorted_group1[0]['genome']
        file_name = sorted_group1[0]['path'].split(home_directory)[1].split('.')[0]
        print(file_name)

        # bowtie2config contains app parameters
        human_config = {
            # index folder
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/michellito/genomes/hg38/Sequence/Bowtie2Index",
            # index name
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "genome",
            # fastq file
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644c61c2-251e-11eb-8a8f-008cfa5ae621": paired,
        }

        # paired arg id:  d743b2be-0842-11eb-9cbd-008cfa5ae621_644c61c2-251e-11eb-8a8f-008cfa5ae621

        mouse_config = {
            # index folder
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/michellito/genomes/bowtie2_mm10",
            # index name
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "mm10",
            # fastq file
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644c61c2-251e-11eb-8a8f-008cfa5ae621": paired,
        }

        time = timezone.now()

        request_body = {
            "name": file_name + "_DNAseq_" + str(time),
            "app_id": app_id,
            "system_id": system_id,
            "debug": False,
            "output_dir": "/iplant/home/" + username + "/analyses",
            "notify": True
        }

        if genome == 'mouse':
            request_body['config'] = mouse_config
        elif genome == 'human':
            request_body['config'] = human_config

        try:
            print('submitting to cyverse!')
            acc = CyVerseAccount.objects.get(user__username=username)
            auth_headers = {"Authorization": "Bearer " + acc.api_token}
            r = requests.post("https://de.cyverse.org/terrain/analyses", headers=auth_headers, json=request_body)
            print (r.content)
            r.raise_for_status()
            # return JsonResponse(r.json())

        except:
            print ("testing here")
            pass

    return HttpResponse(status=200)


def star_paired(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST" and request.user.is_authenticated:
        
        # RNAseq pipeline app ID
        app_id = 'd6dc40a8-0837-11eb-9cfa-008cfa5ae621'
        system_id = 'de'

        username = request.user.username
        home_directory = '/iplant/home/' + username + '/'

        form_data = json.loads(request.body.decode())
        selected_files = form_data['selectedFiles']

        group1 = [x for x in selected_files if x['pair'] == 1]
        group2 = [x for x in selected_files if x['pair'] == 2]
        # print(group1)
        # print(group2)
        
        sorted_group1 = sorted(group1, key=lambda k: k['position']) 
        sorted_group2 = sorted(group2, key=lambda k: k['position']) 
        print(sorted_group1)
        print(sorted_group2)

        fastq = []
        paired = []

        for item in sorted_group1:
            fastq.append(item['path'])
        
        for item in sorted_group2:
            paired.append(item['path'])


        genome = sorted_group1[0]['genome']
        sjdbOverhang = sorted_group1[0]['sjdbOverhang']
        file_name = sorted_group1[0]['path'].split(home_directory)[1].split('.')[0]

        # app parameters
        human_config = {
            # fastq files
            "286b30e0-1df1-11eb-b141-008cfa5ae621_90bb0c4a-1493-11eb-82d6-008cfa5ae621": fastq,
            # sjdbOverhang
            "286b30e0-1df1-11eb-b141-008cfa5ae621_90bc2558-1493-11eb-82d6-008cfa5ae621": sjdbOverhang,
            "286b30e0-1df1-11eb-b141-008cfa5ae621_1c79dae0-1494-11eb-9c84-008cfa5ae621": paired
        }

        # paired files: 286b30e0-1df1-11eb-b141-008cfa5ae621_1c79dae0-1494-11eb-9c84-008cfa5ae621

        index_folder = None

        if sjdbOverhang == '49':
            index_folder = "/iplant/home/michellito/genomes/hg38/Sequence/STAR"
        elif sjdbOverhang == '74':
                index_folder = "/iplant/home/shared/srp_dmac/STAR75"
        elif sjdbOverhang == '99':
            index_folder = "/iplant/home/shared/srp_dmac/STAR100"
        elif sjdbOverhang == '149':
            index_folder = "/iplant/home/shared/srp_dmac/STAR150"

        human_config["286b30e0-1df1-11eb-b141-008cfa5ae621_90b9c7fe-1493-11eb-82d6-008cfa5ae621"] = index_folder

        if 'fastq.gz' in fastq[0]:
            human_config["286b30e0-1df1-11eb-b141-008cfa5ae621_90bf01a6-1493-11eb-82d6-008cfa5ae621"] = 'gunzip -c'

        # mouse_config = {
        #    # index folder
        #    "286b30e0-1df1-11eb-b141-008cfa5ae621_90b9c7fe-1493-11eb-82d6-008cfa5ae621": "/iplant/home/michellito/genomes/bowtie2_mm10",
        #    # fastq files
        #    "286b30e0-1df1-11eb-b141-008cfa5ae621_90bb0c4a-1493-11eb-82d6-008cfa5ae621": fastq,
            # sjdbOverhang
        #    "286b30e0-1df1-11eb-b141-008cfa5ae621_90bc2558-1493-11eb-82d6-008cfa5ae621": sjdbOverhang,
        # "286b30e0-1df1-11eb-b141-008cfa5ae621_1c79dae0-1494-11eb-9c84-008cfa5ae621": paired
        # }

        time = timezone.now()

        request_body = {
            "name": file_name + "_RNAseq_" + str(time),
            "app_id": app_id,
            "system_id": system_id,
            "debug": False,
            "output_dir": "/iplant/home/" + username + "/analyses",
            "notify": True
        }

        # if genome == 'mouse':
        #     request_body['config'] = mouse_config
        # elif genome == 'human':
        #     request_body['config'] = human_config
        request_body['config'] = human_config

        print(request_body)

        try:
            print('submitting to cyverse!')
            acc = CyVerseAccount.objects.get(user__username=username)
            auth_headers = {"Authorization": "Bearer " + acc.api_token}
            r = requests.post("https://de.cyverse.org/terrain/analyses", headers=auth_headers, json=request_body)
            print (r.content)
            r.raise_for_status()
            # return JsonResponse(r.json())

        except:
            return HttpResponse(status=400)

    return HttpResponse(status=200)

def star_analysis(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST" and request.user.is_authenticated:
        
        # RNAseq pipeline app ID
        app_id = 'd6dc40a8-0837-11eb-9cfa-008cfa5ae621'
        system_id = 'de'

        username = request.user.username
        home_directory = '/iplant/home/' + username + '/'

        form_data = json.loads(request.body.decode())
        selected_files = form_data['selectedFiles']

        for group in range(1,10):

            group_files = [x for x in selected_files if x['group'] == group]
            if not group_files:
                continue

            fastq = []

            for item in group_files:
                fastq.append(item['path'])

            genome = group_files[0]['genome']
            sjdbOverhang = group_files[0]['sjdbOverhang']
            file_name = group_files[0]['path'].split(home_directory)[1].split('.')[0]
        
            # app parameters
            human_config = {
               # fastq files
               "286b30e0-1df1-11eb-b141-008cfa5ae621_90bb0c4a-1493-11eb-82d6-008cfa5ae621": fastq,
               # sjdbOverhang
               "286b30e0-1df1-11eb-b141-008cfa5ae621_90bc2558-1493-11eb-82d6-008cfa5ae621": sjdbOverhang,
            }

            index_folder = None

            if sjdbOverhang == '49':
                index_folder = "/iplant/home/michellito/genomes/hg38/Sequence/STAR"
            elif sjdbOverhang == '74':
                index_folder = "/iplant/home/shared/srp_dmac/STAR75"
            elif sjdbOverhang == '99':
                index_folder = "/iplant/home/shared/srp_dmac/STAR100"
            elif sjdbOverhang == '149':
                index_folder = "/iplant/home/shared/srp_dmac/STAR150"

            human_config['286b30e0-1df1-11eb-b141-008cfa5ae621_90b9c7fe-1493-11eb-82d6-008cfa5ae621'] = index_folder

            if 'fastq.gz' in fastq[0]:
                human_config['286b30e0-1df1-11eb-b141-008cfa5ae621_90bf01a6-1493-11eb-82d6-008cfa5ae621'] = 'gunzip -c'

            # mouse_config = {
            #    # index folder
            #    "286b30e0-1df1-11eb-b141-008cfa5ae621_90b9c7fe-1493-11eb-82d6-008cfa5ae621": "/iplant/home/michellito/genomes/bowtie2_mm10",
            #    # fastq files
            #    "286b30e0-1df1-11eb-b141-008cfa5ae621_90bb0c4a-1493-11eb-82d6-008cfa5ae621": fastq,
                # sjdbOverhang
            #    "286b30e0-1df1-11eb-b141-008cfa5ae621_90bc2558-1493-11eb-82d6-008cfa5ae621": sjdbOverhang
            # }

            time = timezone.now()

            request_body = {
                "name": file_name + "_RNAseq_" + str(time),
                "app_id": app_id,
                "system_id": system_id,
                "debug": False,
                "output_dir": "/iplant/home/" + username + "/analyses",
                "notify": True
            }

            # if genome == 'mouse':
            #     request_body['config'] = mouse_config
            # elif genome == 'human':
            #     request_body['config'] = human_config
            request_body['config'] = human_config

            print(request_body)

            try:
                print('submitting to cyverse!')
                acc = CyVerseAccount.objects.get(user__username=username)
                auth_headers = {"Authorization": "Bearer " + acc.api_token}
                r = requests.post("https://de.cyverse.org/terrain/analyses", headers=auth_headers, json=request_body)
                print (r.content)
                r.raise_for_status()
                # return JsonResponse(r.json())

            except:
                return HttpResponse(status=400)

    return HttpResponse(status=200)

# POST /terrain/secured/filesystem/{data-id}/metadata



