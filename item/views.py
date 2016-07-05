# coding: utf-8

import datetime
from itertools import groupby

from dateutil.relativedelta import relativedelta
from django.core.urlresolvers import reverse
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone, formats
from django.views.generic import View, RedirectView

from item.forms import ItemForm
from item.models import Item


class RedirectToMonth(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        today = timezone.now().date()

        return reverse('item-list', args=(str(today.year), str(today.month).zfill(2)))


class ItemList(View):
    def _serialize_item(self, item):
        return {
            'price': '{0:.2f}'.format(item.price),
            'name': item.name,
            'meta': item.meta
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

    def dispatch(self, request, *args, **kwargs):
        self.form = ItemForm(request.POST or None, initial={'date': timezone.now().date()})
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, year, month):
        date = datetime.date(int(year), int(month), 1)

        if request.is_ajax():
            next_ = date + relativedelta(months=1)
            previous = date - relativedelta(months=1)

            qs = self.get_queryset(date)

            page = {
                'title': formats.date_format(date, 'Y / F'),
                'items': self.serialize(qs),
                'pages': {
                    'next': reverse('item-list', args=(str(next_.year), str(next_.month).zfill(2))),
                    'current': reverse('item-list', args=(year, month)),
                    'previous': reverse('item-list', args=(str(previous.year), str(previous.month).zfill(2)))
                }
            }

            return JsonResponse(page, safe=False)
        else:
            return render(request, 'item/list.html', {
                'date': date,
                'form': self.form
            })

    def post(self, request, *args, **kwargs):
        form = self.form

        if form.is_valid():
            item = self.form.save()
            return JsonResponse({
                'date': item.date,
                'items': [self._serialize_item(item)]
            })
        else:
            raise NotImplementedError(form.errors)
