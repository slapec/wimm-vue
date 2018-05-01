# coding: utf-8

import json


class JsonRequestBody:
    def process_request(self, request):
        if 'json' in request.META['CONTENT_TYPE'] and \
                len(request.body) > 0:
            setattr(request, request.method, json.loads(request.body.decode()))
