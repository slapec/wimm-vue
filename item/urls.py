from django.conf.urls import url

from item.views import ItemList

urlpatterns = [
    url(r'^$', ItemList.as_view(), name='list'),
]
