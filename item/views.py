from datetime import timedelta
from itertools import groupby

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.generic import View

from item.forms import ItemForm
from item.models import Item


class ItemList(View):
    def _serialize_item(self, item):
        return {
            'price': item.price,
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

    def get_queryset(self, from_):
        to = from_ - timedelta(days=settings.ITEM_LIST_DAYS)
        return Item.objects.filter(date__lte=from_, date__gt=to)

    def dispatch(self, request, *args, **kwargs):
        self.form = ItemForm(request.POST or None, initial={'date': timezone.now().date()})
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        if request.is_ajax():
            from_ = request.GET.get('from', timezone.now().date())
            qs = self.get_queryset(from_)
            return JsonResponse(self.serialize(qs), safe=False)
        else:
            return render(request, 'item/list.html', {
                'form': self.form
            })

    def post(self, request):
        form = self.form

        if form.is_valid():
            item = self.form.save()
            return JsonResponse({
                'date': item.date,
                'items': [self._serialize_item(item)]
            })
        else:
            raise NotImplementedError(form.errors)
