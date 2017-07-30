# coding: utf-8

from wimm.api import api

from item.api.views import Items, Autocomplete

api.register(r'items', Items, 'items')
api.register(r'autocomplete', Autocomplete, 'autocomplete')
