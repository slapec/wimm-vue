# coding: utf-8

import datetime
import json
from typing import List
from itertools import groupby

from django.core.urlresolvers import reverse
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import View

from item.forms import ItemForm, ItemDeleteForm, ItemMetaAutoForm
from item.models import Item


class ItemApi(View):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.date = None

    def get_queryset(self, date: datetime.date):
        return Item.objects.filter(date__year=date.year, date__month=date.month)

    def dispatch(self, request, *args, year: str, month: str, **kwargs):
        self.date = datetime.date(int(year), int(month), 1)

        return super().dispatch(request, *args, year, month, **kwargs)

    def get(self, *args, **kwargs):
        qs = self.get_queryset(self.date)

        date_item_list = []

        for date, items in groupby(qs, lambda x: x.date):  # type: datetime.date, List[Item]
            item_list = []
            date_item_list.append({
                'date': date.strftime('%Y-%m-%d'),
                'items': item_list
            })

            for item in items:
                item_list.append({
                    'price': '{0:.2f}'.format(item.price),
                    'tags': list(item.tags.names()),
                    'id': item.id
                })

        return JsonResponse(date_item_list, safe=False)

    def post(self, request, year, month):
        form = ItemForm(request.POST or None, initial={'date': self.initial_date})

        if form.is_valid():
            item = form.save()
            if item.date.year == self.date.year and item.date.month == self.date.month:
                result = {
                    'date': item.date,
                    'items': [self._serialize_item(item)]
                }
            else:
                result = {}
            return JsonResponse(result, safe=False)
        else:
            raise NotImplementedError(form.errors)

    def delete(self, request, year, month):
        date = datetime.date(int(year), int(month), 1)

        form = ItemDeleteForm(json.loads(request.body.decode()), date=date)
        if form.is_valid():
            with transaction.atomic():
                form.cleaned_data['items'].delete()
                return JsonResponse(reverse('item-api', args=(year, month)), safe=False)
        else:
            raise NotImplementedError(form.errors)


class ItemList(View):
    def get(self, request, year, month):
        date = datetime.date(int(year), int(month), 1)

        return render(request, 'item/list.html', {
            'date': date,
            'form': ItemForm()
        })


class ItemTagsAuto(View):
    def get(self, request):
        form = ItemMetaAutoForm(request.GET)
        if form.is_valid():
            return JsonResponse(form.cleaned_data['term'], safe=False)
        else:
            raise NotImplementedError(form.errors)


class Index(View):
    def get(self, request):
        return render(request, 'index.html')
