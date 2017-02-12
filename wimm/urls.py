# coding: utf-8

from django.conf.urls import url

from item.views import YearMonthItemApi, ItemApi, ItemTagsAuto, Index

urlpatterns = [
    url(r'^$', Index.as_view(), name='index'),
    url(r'^items/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/$', YearMonthItemApi.as_view()),
    url(r'^items/$', ItemApi.as_view()),
    url(r'^items/(?P<item_id>\d+)/$', ItemApi.as_view()),
    url(r'^autocomplete/tags/$', ItemTagsAuto.as_view()),
]
