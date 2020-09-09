from django.conf import settings
from django.db import models

class CyVerseAccount(models.Model):

    # Fields
    api_token = models.TextField(max_length=100, blank=True)
    api_token_expiration = models.DateTimeField(null=True, blank=True)

    # Relationship Fields
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, related_name="cyverse_accounts", 
    )

    class Meta:
        ordering = ('-pk',)
        verbose_name = 'CyVerse Account'

    def __unicode__(self):
        return u'%s' % self.pk