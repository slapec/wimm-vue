# coding: utf-8

from django import forms
from django.core.exceptions import ValidationError
from django.db.models import Count
from django.utils.translation import ugettext_lazy as _

from item.models import Item, TaggedItem


class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ('date', 'price', 'tags')

    def clean_price(self):
        price = self.cleaned_data['price']

        if price == 0:
            raise ValidationError(_('Zero is not allowed.'))

        return price


class ItemDeleteForm(forms.Form):
    items = forms.ModelMultipleChoiceField(queryset=Item.objects.all())


class ItemMetaAutoForm(forms.Form):
    term = forms.CharField()

    def clean_term(self):
        data = self.cleaned_data['term']
        return [_[0] for _ in
                TaggedItem.objects.filter(tag__name__icontains=data).values_list('tag__name')
                                  .annotate(n=Count('tag__name')).order_by('-n', 'tag__name')
                ]
