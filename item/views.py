# coding: utf-8

from django.conf import settings
from django.shortcuts import render
from django.views.generic import View


class Index(View):
    def get(self, request):
        context = {
            'root': settings.FORCE_SCRIPT_NAME or ''
        }

        return render(request, 'index.html', context)
