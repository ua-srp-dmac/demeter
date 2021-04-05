from django.conf import settings
from django.db import models

class CyVerseFolder(models.Model):

    # full path to data folder in CyVerse
    path = models.TextField(blank=True)

    # full path to folder where analysis results should be deposited
    results_path = models.TextField(blank=True)

    # friendly name for folder
    friendly_name = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'CyVerse Folder'

    def __unicode__(self):
        return u'%s' % self.friendly_name

    def __str__(self):
        return self.friendly_name

class CyVerseAccount(models.Model):

    # Fields
    api_token = models.TextField(max_length=100, blank=True)
    api_token_expiration = models.DateTimeField(null=True, blank=True)

    # Relationship Fields
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, related_name="cyverse_account", 
    )

    folders = models.ManyToManyField(CyVerseFolder, blank=True)

    class Meta:
        ordering = ('-pk',)
        verbose_name = 'CyVerse Account'

    def __unicode__(self):
        return u'%s' % self.pk
    
    def __str__(self):
        return self.user.username

