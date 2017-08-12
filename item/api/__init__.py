# coding: utf-8

from django.conf.urls import url

from wimm.api import api

from item.api.views import Items, ItemsUpload, Autocomplete, TotalSum, TagSum

api.register(r'items', Items, 'items')
api.register(r'autocomplete', Autocomplete, 'autocomplete')
api.register(r'total_sum', TotalSum, 'total_sum')
api.register(r'tag_sum', TagSum, 'tag_sum')


urlpatterns = [
    url(r'^upload/$', ItemsUpload.as_view())
]