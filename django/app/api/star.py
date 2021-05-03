import json
import requests
import time
import jwt
import datetime

from django.http import HttpResponse
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings

from app.models import CyVerseAccount


def star_analysis(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST" and request.user.is_authenticated:
        
        # RNAseq pipeline app ID
        app_id = 'd6dc40a8-0837-11eb-9cfa-008cfa5ae621'
        system_id = 'de'

        username = request.META.get('OIDC_preferred_username', None)
        
        token = None
        account = None

        # set account and token
        if username:
            account = CyVerseAccount.objects.get(user__username=username)
            token = request.META.get('OIDC_access_token', None)
        elif request.user.is_authenticated:
            username = request.user.username
            account = CyVerseAccount.objects.get(user__username=username)
            token = account.api_token
        else:
            return HttpResponse(status=403)

        current_folder = account.default_folder

        form_data = json.loads(request.body.decode())
        groups = form_data['groups']

        for group in groups:

            if group['files']:
                fastq = group['files']
            else:
                continue

            genome = group['genome']
            sjdbOverhang = group['sjdbOverhang']
            split_path = fastq[0].split('/')
            file_name = split_path[-1].split('.')[0]

            jwt_key = jwt.encode({
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
                'username': username,
                'cyverse_account_id': account.id, 
            }, settings.JWT_SECRET)
        
            # app parameters
            human_config = {
               # fastq files
               "42841516-90cc-11eb-87c2-008cfa5ae621_90bb0c4a-1493-11eb-82d6-008cfa5ae621": fastq,
               # sjdbOverhang
               "42841516-90cc-11eb-87c2-008cfa5ae621_90bc2558-1493-11eb-82d6-008cfa5ae621": sjdbOverhang,
               "4284e77a-90cc-11eb-87c2-008cfa5ae621_faf2ed12-90cb-11eb-ba25-008cfa5ae621": current_folder.friendly_name,
               "4284e77a-90cc-11eb-87c2-008cfa5ae621_faf33c5e-90cb-11eb-ba25-008cfa5ae621": file_name + '_ReadsPerGene.tab',
               "4284e77a-90cc-11eb-87c2-008cfa5ae621_21f3d1be-a144-11eb-8a1d-008cfa5ae621": jwt_key,
            }

            index_folder = None

            if sjdbOverhang == '49':
                index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR50"
            elif sjdbOverhang == '74':
                    index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR75"
            elif sjdbOverhang == '99':
                index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR100"
            elif sjdbOverhang == '149':
                index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR150"

            # GenomeDir
            human_config['42841516-90cc-11eb-87c2-008cfa5ae621_90b9c7fe-1493-11eb-82d6-008cfa5ae621'] = index_folder

            if 'fastq.gz' in fastq[0]:
                human_config['42841516-90cc-11eb-87c2-008cfa5ae621_90bf01a6-1493-11eb-82d6-008cfa5ae621'] = 'gunzip -c'

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
                "name": file_name + "_RNAseq_" + str(time.strftime("%m-%d-%y")),
                "app_id": app_id,
                "system_id": system_id,
                "debug": False,
                "output_dir": current_folder.results_path,
                "notify": True,
            }

            # if genome == 'mouse':
            #     request_body['config'] = mouse_config
            # elif genome == 'human':
            #     request_body['config'] = human_config
            request_body['config'] = human_config

            try:
                auth_headers = {"Authorization": "Bearer " + token}
                r = requests.post(
                    "https://de.cyverse.org/terrain/analyses",
                    headers=auth_headers,
                    json=request_body
                )
                r.raise_for_status()
                # return JsonResponse(r.json())

            except:
                return HttpResponse(status=400)

    return HttpResponse(status=200)


def star_paired(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST" and request.user.is_authenticated:
        
        # RNAseq pipeline app ID
        app_id = 'd6dc40a8-0837-11eb-9cfa-008cfa5ae621'
        system_id = 'de'

        username = request.user.username
        cyverse_account = CyVerseAccount.objects.get(user__username=username)
        current_folder = cyverse_account.default_folder

        form_data = json.loads(request.body.decode())

        group1 = form_data['pair_1']
        group2 = form_data['pair_2']
        
        sorted_group1 = sorted(group1, key=lambda k: k['position']) 
        sorted_group2 = sorted(group2, key=lambda k: k['position']) 

        fastq = []
        paired = []

        for item in sorted_group1:
            fastq.append(item['file'])
        
        for item in sorted_group2:
            paired.append(item['file'])

        genome = form_data['genome']
        sjdbOverhang = form_data['read_length']
        split_path = fastq[0].split('/')
        file_name = split_path[-1].split('.')[0]

        # app parameters
        human_config = {
            # fastq files
            "42841516-90cc-11eb-87c2-008cfa5ae621_90bb0c4a-1493-11eb-82d6-008cfa5ae621": fastq,
            # sjdbOverhang
            "42841516-90cc-11eb-87c2-008cfa5ae621_90bc2558-1493-11eb-82d6-008cfa5ae621": sjdbOverhang,
            "42841516-90cc-11eb-87c2-008cfa5ae621_1c79dae0-1494-11eb-9c84-008cfa5ae621": paired,
            "4284e77a-90cc-11eb-87c2-008cfa5ae621_faf2ed12-90cb-11eb-ba25-008cfa5ae621": current_folder.friendly_name,
            "4284e77a-90cc-11eb-87c2-008cfa5ae621_faf33c5e-90cb-11eb-ba25-008cfa5ae621": file_name + '_ReadsPerGene.tab'
        }

        # paired files: 286b30e0-1df1-11eb-b141-008cfa5ae621_1c79dae0-1494-11eb-9c84-008cfa5ae621

        index_folder = None

        if sjdbOverhang == '49':
            index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR50"
        elif sjdbOverhang == '74':
                index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR75"
        elif sjdbOverhang == '99':
            index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR100"
        elif sjdbOverhang == '149':
            index_folder = "/iplant/home/shared/srp_dmac/dmac/demeter/star_indexes/STAR150"

        human_config["42841516-90cc-11eb-87c2-008cfa5ae621_90b9c7fe-1493-11eb-82d6-008cfa5ae621"] = index_folder

        if 'fastq.gz' in fastq[0]:
            human_config["42841516-90cc-11eb-87c2-008cfa5ae621_90bf01a6-1493-11eb-82d6-008cfa5ae621"] = 'gunzip -c'

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
            "name": file_name + "_RNAseq_" + str(time.strftime("%m-%d-%y")),
            "app_id": app_id,
            "system_id": system_id,
            "debug": False,
            "output_dir": current_folder.results_path,
            "notify": True
        }

        # if genome == 'mouse':
        #     request_body['config'] = mouse_config
        # elif genome == 'human':
        #     request_body['config'] = human_config
        request_body['config'] = human_config

        try:
            acc = CyVerseAccount.objects.get(user__username=username)
            auth_headers = {"Authorization": "Bearer " + acc.api_token}
            r = requests.post(
                "https://de.cyverse.org/terrain/analyses",
                headers=auth_headers,
                json=request_body
            )
            r.raise_for_status()
            # return JsonResponse(r.json())

        except:
            return HttpResponse(status=400)

    return HttpResponse(status=200)

