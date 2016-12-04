# coding: utf-8

import datetime
import json
from itertools import groupby

from dateutil.relativedelta import relativedelta
from django.core.urlresolvers import reverse
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone, formats
from django.views.generic import View, RedirectView

from item.forms import ItemForm, ItemDeleteForm, ItemMetaAutoForm
from item.models import Item


class RedirectToMonth(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        today = timezone.now().date()

        return reverse('item-list', args=(str(today.year), str(today.month).zfill(2)))


class ItemApi(View):
    def _serialize_item(self, item):
        return {
            'price': '{0:.2f}'.format(item.price),
            'tags': sorted(item.tags.names()),
            'id': item.id
        }

    def serialize(self, qs):
        items_by_date = []

        for date, items in groupby(qs, lambda item: item.date):
            date_items = {
                'date': date,
                'items': [self._serialize_item(item) for item in items]
            }

            items_by_date.append(date_items)

        return items_by_date

    def get_queryset(self, date):
        return Item.objects.filter(date__year=date.year, date__month=date.month)

    def dispatch(self, request, *args, year, month, **kwargs):
        self.date = datetime.date(int(year), int(month), 1)

        today = timezone.now().date()
        if self.date.year == today.year and self.date.month == today.month:
            self.initial_date = today
        else:
            self.initial_date = self.date

        return super().dispatch(request, *args, year, month, **kwargs)

    def get(self, request, year, month):
        next_ = self.date + relativedelta(months=1)
        next_args = (str(next_.year), str(next_.month).zfill(2))

        current_args = (year, month)

        previous = self.date - relativedelta(months=1)
        previous_args = (str(previous.year), str(previous.month).zfill(2))

        qs = self.get_queryset(self.date)

        page = {
            'initial': self.initial_date,
            'title': formats.date_format(self.date, 'Y / F'),
            'dates': self.serialize(qs),
            'pages': {
                'next': {
                    'api': reverse('item-api', args=next_args),
                    'history': reverse('item-list', args=next_args)
                },
                'current': {
                    'api': reverse('item-api', args=current_args),
                    'history': reverse('item-list', args=current_args)
                },
                'previous': {
                    'api': reverse('item-api', args=previous_args),
                    'history': reverse('item-list', args=previous_args)
                }
            }
        }

        return JsonResponse(page, safe=False)

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
