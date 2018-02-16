# coding: utf-8

import csv
import io
from collections import defaultdict
from itertools import groupby

from dateutil.parser import parse
from django.db import transaction
from django.db.models import Count, Sum
from qsstats import QuerySetStats
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ViewSet
from taggit.models import Tag

from item.api.serializers import ItemSerializer
from item.models import Item, TaggedItem


class Items(ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def filter_queryset(self, qs):
        GET = self.request.GET

        if 'year' in GET and 'month' in GET:
            qs = qs.filter(date__year=GET['year'], date__month=GET['month'])
        elif 'from' in GET and 'to' in GET:
            qs = qs.filter(date__gte=GET['from'], date__lt=GET['to'])

        return qs

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
        pks_to_delete = set(int(_) for _ in request.DELETE['items'])

        qs = self.filter_queryset(self.get_queryset()).filter(pk__in=pks_to_delete)

        qs_pks = set(_.pk for _ in qs)

        missing_pks = pks_to_delete - qs_pks
        if missing_pks:
            raise ValidationError({'items': 'Missing pks: {0!r}'.format(missing_pks)})
        else:
            qs.delete()

        return Response({})


class ItemsUpload(APIView):
    def post(self, request, format=None):
        text = request.data['file'].read().decode()

        reader = csv.DictReader(io.StringIO(text), delimiter=',')
        counter = 0

        try:
            with transaction.atomic():
                for item in reader:
                    tags = item['tags'].split(',')

                    model = Item.objects.create(
                        date=item['date'],
                        price=float(item['price']),
                    )

                    model.tags.add(*tags)

                    counter += 1
        except Exception as e:
            return Response({'error': str(e)})
        else:
            return Response({'imported': counter})


class Autocomplete(ViewSet):
    def list(self, request):
        term = request.GET['term']

        tags = [_[0] for _ in
                TaggedItem.objects.filter(tag__name__icontains=term).values_list('tag__name')
                                  .annotate(n=Count('tag__name')).order_by('-n', 'tag__name')
                ]

        return Response(tags)


class TotalSum(ViewSet):
    def list(self, request):
        date_from = parse(request.GET['from']).date()
        date_to = parse(request.GET['to']).date()
        interval = request.GET['interval']

        assert interval in {'years', 'months', 'weeks', 'days'}

        qs = Item.objects.all()
        qss = QuerySetStats(qs, date_field='date', aggregate=Sum('price')). \
                time_series(date_from, date_to, interval=interval)

        return Response((_[0].date(), _[1]) for _ in qss)


class TagSum(ViewSet):
    def list(self, request):
        date_from = parse(request.GET['from']).date()
        date_to = parse(request.GET['to']).date()
        tagCount = int(request.GET['tagCount'])
        negativeFirst = 'sum_price' if request.GET['negativeFirst'] == '1' else '-sum_price'
        tags = request.GET.getlist('tags')

        qs = Tag.objects.filter(item__date__gte=date_from, item__date__lte=date_to)
        if tags:
            qs = qs.filter(name__in=tags)

        qs = qs.annotate(sum_price=Sum('item__price')).order_by(negativeFirst)[:tagCount]

        return Response((_.name, _.sum_price) for _ in qs)


class TagSumOverTime(ViewSet):
    def list(self, request):
        date_from = parse(request.GET['from']).date()
        date_to = parse(request.GET['to']).date()
        interval = request.GET['interval']
        tags = request.GET.getlist('tags')
        base_tag = request.GET['base_tag']
        no_base = request.GET['no_base']

        assert interval in {'years', 'months', 'weeks', 'days'}

        base_tag_aggregate = {}
        has_positive = False
        dates = set()

        if no_base == 'false':
            qs = Item.objects.all()
            if base_tag:
                qs = qs.filter(tags__name=base_tag)

            qss = QuerySetStats(qs, date_field='date', aggregate=Sum('price')). \
                time_series(date_from, date_to, interval=interval)

            for datetime, value in qss:
                dates.add(datetime.date())
                base_tag_aggregate[datetime.date()] = value

                has_positive |= value > 0

        tag_aggregates = {}
        for tag in tags:
            qs = Item.objects.filter(tags__name=tag)
            qss = QuerySetStats(qs, date_field='date', aggregate=Sum('price')). \
                time_series(date_from, date_to, interval=interval)

            tag_aggregate = {}
            for datetime, value in qss:
                dates.add(datetime.date())
                tag_aggregate[datetime.date()] = value

                has_positive |= value > 0
            tag_aggregates[tag] = tag_aggregate

        retval = {
            'base': [],
            'tags': defaultdict(list)
        }

        has_positive = 1 if has_positive else -1

        for date in sorted(dates):
            value = base_tag_aggregate.get(date, 0)
            retval['base'].append((date, has_positive * value))

            for tag, tag_aggregate in tag_aggregates.items():
                value = tag_aggregate.get(date, 0)

                retval['tags'][tag].append(has_positive * value)

        return Response(retval)
