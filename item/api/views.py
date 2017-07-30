# coding: utf-8

from itertools import groupby

from django.db.models import Count
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ViewSet

from item.api.serializers import ItemSerializer
from item.models import Item, TaggedItem


class Items(ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def filter_queryset(self, queryset):
        GET = self.request.GET

        if 'year' in GET and 'month' in GET:
            queryset = queryset.filter(date__year=GET['year'], date__month=GET['month'])

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        serializer = self.get_serializer(queryset, many=True)

        date_item_list = []

        for date, items in groupby(serializer.data, lambda x: x['date']):
            item_list = []
            date_item_list.append({
                'date': date,
                'items': item_list
            })

            for item in items:
                item_list.append({
                    'price': item['price'],
                    'tags': item['tags'],
                    'id': item['id']
                })

        return Response(date_item_list)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        item = serializer.data

        response = {
            'date':  item['date'],
            'item': {
                'price': item['price'],
                'tags': item['tags'],
                'id': item['id']
            }
        }

        return Response(response, status=status.HTTP_201_CREATED, headers=headers)

    def delete(self, request, *args, **kwargs):
        pks_to_delete = set(request.DELETE['items'])

        qs = self.filter_queryset(self.get_queryset()).filter(pk__in=pks_to_delete)

        qs_pks = set(_.pk for _ in qs)

        missing_pks = pks_to_delete - qs_pks
        if missing_pks:
            raise ValidationError({'items': 'Missing pks: {0!r}'.format(missing_pks)})
        else:
            qs.delete()

        return Response({})


class Autocomplete(ViewSet):
    def list(self, request):
        term = request.GET['term']

        tags = [_[0] for _ in
                TaggedItem.objects.filter(tag__name__icontains=term).values_list('tag__name')
                                  .annotate(n=Count('tag__name')).order_by('-n', 'tag__name')
                ]

        return Response(tags)
