# coding: utf-8

from rest_framework.serializers import ModelSerializer
from taggit_serializer.serializers import TagListSerializerField, TaggitSerializer

from item.models import Item


class ItemSerializer(TaggitSerializer, ModelSerializer):
    tags = TagListSerializerField()

    class Meta:
        model = Item
        fields = ('id', 'date', 'price', 'tags')
