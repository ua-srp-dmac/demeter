import json
import requests
import time

from django.http import HttpResponse
from django.contrib.auth.models import User
from django.utils import timezone

from app.models import CyVerseAccount

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
        cyverse_account = CyVerseAccount.objects.get(user__username=username)
        current_folder = cyverse_account.default_folder

        form_data = json.loads(request.body.decode())
        groups = form_data['groups']

        for group in groups:

            if group['files']:
                fastq = group['files']
            else:
                continue

            genome = group['genome']

            split_path = fastq[0].split('/')
            file_name = split_path[-1].split('.')[0]

            # bowtie2config contains app parameters
            human_config = {
               # index folder
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/shared/srp_dmac/dmac/demeter/ucsc_genomes/hg38/Sequence/Bowtie2Index",
               # index name
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "genome",
               # fastq file
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            }

            mouse_config = {
               # index folder
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/shared/srp_dmac/dmac/demeter/ucsc_genomes/mm10/Sequence/Bowtie2Index",
               # index name
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "mm10",
               # fastq file
               "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            }

            time = timezone.now()

            request_body = {
                "name": file_name + "_DNAseq_" + str(time.strftime("%m-%d-%y")),
                "app_id": app_id,
                "system_id": system_id,
                "debug": False,
                "output_dir": current_folder.results_path,
                "notify": True,
            }

            if genome == 'mouse':
                request_body['config'] = mouse_config
            elif genome == 'human':
                request_body['config'] = human_config

            try:
                auth_headers = {"Authorization": "Bearer " + cyverse_account.api_token}
                r = requests.post(
                    "https://de.cyverse.org/terrain/analyses",
                    headers=auth_headers,
                    json=request_body
                )
                r.raise_for_status()
                # return JsonResponse(r.json())

            except:
                pass

    return HttpResponse(status=200)


def bowtie2_paired(request):
    """ Submits an analysis to the DE.
    """

    if request.method == "POST" and request.user.is_authenticated:
        
        # DNAseq pipeline app ID
        app_id = '10cabb5a-0757-11eb-8b4c-008cfa5ae621'
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
        split_path = fastq[0].split('/')
        file_name = split_path[-1].split('.')[0]

        # bowtie2config contains app parameters
        human_config = {
            # index folder
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/shared/srp_dmac/dmac/demeter/ucsc_genomes/hg38/Sequence/Bowtie2Index",
            # index name
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "genome",
            # fastq file
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644c61c2-251e-11eb-8a8f-008cfa5ae621": paired,
        }

        mouse_config = {
            # index folder
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9ce63e-f2d3-11ea-9df7-008cfa5ae621": "/iplant/home/shared/srp_dmac/dmac/demeter/ucsc_genomes/mm10/Sequence/Bowtie2Index",
            # index name
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_4f9d9660-f2d3-11ea-9df7-008cfa5ae621": "mm10",
            # fastq file
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644b7b2c-251e-11eb-8a8f-008cfa5ae621": fastq,
            "d743b2be-0842-11eb-9cbd-008cfa5ae621_644c61c2-251e-11eb-8a8f-008cfa5ae621": paired,
        }

        time = timezone.now()

        request_body = {
            "name": file_name + "_DNAseq_" + str(time.strftime("%m-%d-%y")),
            "app_id": app_id,
            "system_id": system_id,
            "debug": False,
            "output_dir": current_folder.results_path,
            "notify": True
        }

        if genome == 'mouse':
            request_body['config'] = mouse_config
        elif genome == 'human':
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
            pass

    return HttpResponse(status=200)
