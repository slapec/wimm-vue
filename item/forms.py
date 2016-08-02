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
        widgets = {
            'date': forms.TextInput(attrs={
                'placeholder': _('Date'),
                'class': 'numeric'
            }),
            'price': forms.NumberInput(attrs={
                'placeholder': _('Price'),
                'tabindex': 2,
                'class': 'numeric',
                'autocomplete': 'off'
            }),
            'tags': forms.TextInput(attrs={'placeholder': _('Tags'), 'tabindex': 1})
        }

    def clean_price(self):
        price = self.cleaned_data['price']

        if price == 0:
            raise ValidationError(_('Zero is not allowed.'))

        return price


class ItemDeleteForm(forms.Form):
    items = forms.ModelMultipleChoiceField(queryset=Item.objects.none())

    def __init__(self, *args, date, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['items'].queryset = Item.objects.filter(date__year=date.year,
                                                            date__month=date.month)


class ItemMetaAutoForm(forms.Form):
    term = forms.CharField()

    def clean_term(self):
        data = self.cleaned_data['term']
        return [_[0] for _ in
                TaggedItem.objects.filter(tag__name__icontains=data).values_list('tag__name')
                                  .annotate(n=Count('tag__name')).order_by('-n', 'tag__name')
                ]
