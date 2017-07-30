# coding: utf-8

from django.conf.urls import url, include

from wimm.api import api
from item.views import Index

urlpatterns = [
    url(r'^$', Index.as_view(), name='index'),
    url(r'api/', include(api.urls, namespace='api'))
]
