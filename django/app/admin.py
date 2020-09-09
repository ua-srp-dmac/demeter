from django.contrib import admin
from .models import *

class CyVerseAccountAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'api_token_expiration'
    )
    search_fields = (
        'user', 
    )

admin.site.register(CyVerseAccount, CyVerseAccountAdmin)
