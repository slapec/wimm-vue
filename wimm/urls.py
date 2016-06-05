from django.conf.urls import url, include
from django.contrib import admin
from django.core.urlresolvers import reverse_lazy
from django.views.generic import RedirectView

urlpatterns = [
    url(r'^$', RedirectView.as_view(url=reverse_lazy('item:list'))),

    url(r'^items/', include('item.urls', namespace='item')),

    url(r'^admin/', admin.site.urls),
]
