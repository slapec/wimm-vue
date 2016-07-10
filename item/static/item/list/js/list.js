(function(){
    function DateService(target){
        this.target = target;
        this.dates = {};
    }

    DateService.prototype.createItem = function(dateItemsElem, details){
        var itemElem = document.createElement('li');
        dateItemsElem.insertBefore(itemElem, dateItemsElem.firstChild);

        // select checkbox
        var selectElem = document.createElement('input');
        selectElem.type = 'checkbox';
        selectElem.className = 'item-select';
        itemElem.appendChild(selectElem);
        var jSelectElem = $(selectElem);
        jSelectElem.on('change', function(){
            if(this.checked){
                $(itemElem).addClass('item-checked');
            }
            else {
                $(itemElem).removeClass('item-checked');
            }
        });
        jSelectElem.data('id', details.id);

        // Price
        var priceElem = document.createElement('span');
        priceElem.className = 'numeric price';

        var price = details.price;
        var sign = '+';
        if(price[0] === '-'){
            sign = '-';
            price = price.slice(1);
        }

        if(sign === '+'){
            priceElem.classList.add('positive');
        }
        else {
            priceElem.classList.add('negative');
        }
        priceElem.innerHTML = sign + price;

        itemElem.appendChild(priceElem);

        // Name
        var nameElem = document.createElement('span');
        nameElem.className = 'name';
        nameElem.innerHTML = details.name;
        itemElem.appendChild(nameElem);

        // meta
        var metaElem = document.createElement('span');
        metaElem.className = 'meta';
        metaElem.innerHTML = details.meta;
        itemElem.appendChild(metaElem);
    };

    DateService.prototype.createDate = function(dateItems){
        var self = this;
        var target = self.target[0];
        var date = dateItems.date;

        if(date !== undefined){
            var dateObject = self.dates[date];
            if(dateObject === undefined){
                var dateElem = document.createElement('div');
                dateElem.className = 'date';
                dateElem.dataset.date = date;

                var dateBefore = self.dateBefore(date);
                target.insertBefore(dateElem, dateBefore);

                var left = document.createElement('div');
                left.className = 'numeric date-head';
                left.innerHTML = date;
                dateElem.appendChild(left);

                var dateItemsElem = document.createElement('ul');
                dateItems.className = 'date-items';
                dateElem.appendChild(dateItemsElem);

                dateObject = {
                    dateElem: dateElem,
                    dateItemsElem: dateItemsElem
                };

                self.dates[date] = dateObject;
            }

            dateItems.items.forEach(function(details){
                self.createItem(dateObject.dateItemsElem, details);
            });
        }
    };

    DateService.prototype.loadPage = function(url){
        var self = this;
        self.target.trigger('loadPage.start', url);

        $.get(url)
        .success(function(reply){
            self.target.empty();
            self.dates = {};

            reply.dates.forEach(function(dateItems){
                self.createDate(dateItems);
            });
            self.target.trigger('loadPage.end', reply);
        })
    };

    DateService.prototype.dateBefore = function(date){
        var keys = Object.keys(this.dates).sort();
        var dateBefore = null;
        for(var i=0; i<keys.length; i++){
            var dateKey = keys[i];
            if(dateKey < date){
                dateBefore = dateKey;
            }
            else {
                break
            }
        }

        if(dateBefore === null){
            return null
        }
        else {
            return this.dates[dateBefore].dateElem;
        }
    };

    // ------------------------------------------------------------------------
    var titleButtons, sidebarState, loadingOverlay, media, form, price, date, items, dateService,
        previousMonth, nextMonth, titleContent, selectDelete, selectDeleteToolbar, selectedCancel,
        selectedDelete;

    function resetForm(){
        var lastDate = date.val();

        form[0].reset();

        date.val(lastDate);
        price.focus();
    }

    function enableInputs(state){
        if(state === undefined){
            state = false;
        }
        else {
            state = !state;
        }

        form.find('input').attr('disabled', state);
    }

    function getRawPrice(){
        price.select();
        var value = window.getSelection().toString();
        price.blur();

        var sign = value[0];

        if(!(sign === '+') && !(sign == '-')){
            value = -1 * parseFloat(value);
        }

        return value;
    }

    $(function(){
        var options = JSON.parse($('#options').html());

        function csrfSafeMethod(method) {
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", options.csrftoken);
                }
            }
        });

        // Setting up the UI ---------------------------------------------------
        media = window.matchMedia('(min-width: 1280px)');

        titleButtons = $('.title-button');
        sidebarState = $('#sidebar-state');
        loadingOverlay = $('#loading-overlay');
        form = $('#item-form');
        price = $('#id_price');
        date = $('#id_date');
        items = $('#items');
        previousMonth = $('#previous-month');
        nextMonth = $('#next-month');
        titleContent = $('#title-content');
        selectDelete = $('#select-delete');
        selectDeleteToolbar = $('#select-delete-toolbar');
        selectedCancel = $('#selected-cancel');
        selectedDelete = $('#selected-delete');

        price.focus();

        // Attaching handlers --------------------------------------------------
        var scrollBefore = null;
        function resetBody(){
            var body = $(document.body);
            body.css({top: ''});
            body.removeClass('overflow');
            if(scrollBefore){
                $(window).scrollTop(scrollBefore);
            }
        }

        media.addListener(function(){
            if(sidebarState.prop('checked')){
                resetBody();
                sidebarState.prop('checked', false);
            }
        });

        sidebarState.on('change', function(){
            var body = $(document.body);

            if(this.checked){
                scrollBefore = $(window).scrollTop();
                body.css({top: -1 * scrollBefore + 'px'});
                body.addClass('overflow');
            }
            else {
                body.css({top: ''});
                body.removeClass('overflow');
                $(window).scrollTop(scrollBefore);
            }
        });

        form.on('submit', function(e){
            e.preventDefault();
            var data = form.serializeArray().reduce(function(result, obj){
                result[obj.name] = obj.value;
                return result;
            }, {});

            data.price = getRawPrice();

            enableInputs(false);

            $.post('', data)
            .success(function(details){
                resetForm();
                dateService.createDate(details);
                enableInputs();
                price.focus();
            })
            .error(function(){
               enableInputs();
            });
        });

        items.on('loadPage.start', function(){
            loadingOverlay.show();
        });

        items.on('loadPage.end', function(e, reply){
            date.val(reply.initial);
            previousMonth.data('url', reply.pages.previous.api);
            nextMonth.data('url', reply.pages.next.api);
            titleContent.html(reply.title);
            loadingOverlay.hide();
        });

        items.one('loadPage.end', function(e, reply){
            document.title = 'WIMM - ' + reply.title;
        });
        
        nextMonth.on('click', function(){
            dateService.loadPage(nextMonth.data('url'));

            items.one('loadPage.end', function(e, reply){
                var current = reply.pages.current.history;
                history.pushState(current, '', current);
                document.title = 'WIMM - ' + reply.title;
            });
        });

        previousMonth.on('click', function(){
            dateService.loadPage(previousMonth.data('url'));

            items.one('loadPage.end', function(e, reply){
                var current = reply.pages.current.history;
                history.pushState(current, '', current);
                document.title = 'WIMM - ' + reply.title;
            });
        });

        selectDelete.on('click', function(e){
            if(!selectDelete.hasClass('toggled')){
                selectDelete.addClass('toggled');
                resetBody();
                sidebarState.prop('checked', false);
                titleButtons.hide();
                $('.item-select').show();
            }
            else {
                return false;
            }
        });

        selectedCancel.on('click', function(){
            titleButtons.removeAttr('style');
            $('.item-select').prop('checked', false).hide();
            $('.item-checked').removeClass('item-checked');
            selectDelete.removeClass('toggled');
        });

        selectedDelete.on('click', function(){
            var selected = [];
            $('.item-select:checked').each(function(i, o){
                selected.push($(o).data('id'));
            });

            $.ajax({
                method: 'DELETE',
                url: options.urls.itemApi,
                data: $.param({items: selected})
            })
            .success(function(reply){
                dateService.loadPage(reply.url);
            });

            titleButtons.removeAttr('style');
            $('.item-select').prop('checked', false).hide();
            $('.item-checked').removeClass('item-checked');
            loadingOverlay.show();
            selectDelete.removeClass('toggled');
        });

        window.onpopstate = function(event){
            dateService.loadPage(event.state);
        };

        // ---------------------------------------------------------------------
        dateService = new DateService(items);
        dateService.loadPage(options.urls.itemApi);
    });
})();
