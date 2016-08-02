# coding: utf-8

from django.conf.urls import url
from django.contrib import admin

from item.views import RedirectToMonth, ItemApi, ItemList, ItemTagsAuto

urlpatterns = [
    url(r'^$', RedirectToMonth.as_view(), name='index'),
    url(r'^(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/$', ItemList.as_view(), name='item-list'),
    url(r'^(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/items/', ItemApi.as_view(), name='item-api'),
    url(r'^autocomplete/tags/$', ItemTagsAuto.as_view(), name='item-tags-auto'),

    url(r'^admin/', admin.site.urls),
]
