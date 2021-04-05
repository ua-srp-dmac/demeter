from django.contrib import admin
from .models import *

class CyVerseAccountAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'api_token_expiration', 'folder_display'
    )
    search_fields = (
        'user', 
    )

    def folder_display(self, obj):
        return ", ".join([
            folder.friendly_name for folder in obj.folders.all()
        ])
        
    folder_display.short_description = "Folders"

class CyVerseFolderAdmin(admin.ModelAdmin):
    list_display = (
        'friendly_name', 'path', 'results_path'
    )
    search_fields = (
        'friendly_name', 
    )

admin.site.register(CyVerseAccount, CyVerseAccountAdmin)
admin.site.register(CyVerseFolder, CyVerseFolderAdmin)
