# coding: utf-8

from django.db import models
from django.utils.translation import ugettext_lazy as _
from taggit.managers import TaggableManager
from taggit.models import TaggedItemBase


class TaggedItem(TaggedItemBase):
    content_object = models.ForeignKey('Item')


class Item(models.Model):
    date = models.DateField(verbose_name=_('date'), db_index=True)
    price = models.DecimalField(max_digits=11, decimal_places=2)
    tags = TaggableManager(blank=True, through=TaggedItem)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ('date', 'created_at')

    def __str__(self):
        return '#{id} {date}: {price}{tags}'.format(
            id=self.id, date=self.date, price=self.price,
            tags=' (' + repr(self.tags) + ')' if self.tags else ''
        )
