from django.db import models
from django.utils.translation import ugettext_lazy as _


class Item(models.Model):
    created_at = models.DateField(verbose_name=_('created at'))
    name = models.CharField(max_length=64, verbose_name=_('name'), blank=False, null=False)
    price = models.DecimalField(max_digits=11, decimal_places=2)
    meta = models.CharField(max_length=65, verbose_name=_('meta'), blank=False, null=True)

    def __str__(self):
        return '#{id} {created_at}: {name!r} {price}{meta}'.format(**{
            **self.__dict__,
            'meta': ' (' + repr(self.meta) + ')' if self.meta else ''
        })
