from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _

from item.models import Item


class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ('date', 'price', 'name', 'meta')
        widgets = {
            'date': forms.TextInput(attrs={'placeholder': _('Date'), 'tabindex': 1}),
            'price': forms.NumberInput(attrs={'placeholder': _('Price'), 'tabindex': 2}),
            'name': forms.TextInput(attrs={'placeholder': _('Item name'), 'tabindex': 3}),
            'meta': forms.TextInput(attrs={'placeholder': _('Meta'), 'tabindex': 4})
        }

    def clean_date(self):
        date = self.cleaned_data['date']

        if date > self.initial['date']:
            raise ValidationError(_('Entered date cannot be in the future.'))

        return date

    def clean_price(self):
        price = self.cleaned_data['price']

        return price
