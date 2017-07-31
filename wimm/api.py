# coding: utf-8

from django.conf import settings
from django.middleware import csrf

from rest_framework import routers
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

api = routers.DefaultRouter()


class SettingsView(ViewSet):
    def list(self, request):
        return Response({
            'csrftoken': csrf.get_token(request),
            'root': settings.FORCE_SCRIPT_NAME or ''
        })

api.register(r'settings', SettingsView, 'settings')
