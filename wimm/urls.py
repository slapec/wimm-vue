# coding: utf-8

from django.conf.urls import url, include

from wimm.api import api


urlpatterns = [
    url(r'api/', include(api.urls, namespace='api'))
]
