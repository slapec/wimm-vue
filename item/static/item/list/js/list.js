(function(){


    function DateService(target){
        this.target = target;
        this.dates = {};
    }

    DateService.prototype.createItem = function(dateItemsElem, details){
        var itemElem = document.createElement('li');
        itemElem.innerHTML = JSON.stringify(details);
        dateItemsElem.insertBefore(itemElem, dateItemsElem.firstChild);
    };

    DateService.prototype.createDate = function(dateItems){
        var self = this;
        var target = self.target[0];
        var date = dateItems.date;

        var dateObject = self.dates[date];
        if(dateObject === undefined){
            var dateElem = document.createElement('div');
            dateElem.className = 'date';
            dateElem.dataset.date = date;

            var dateBefore = self.dateBefore(date);
            target.insertBefore(dateElem, dateBefore);

            var left = document.createElement('div');
            left.className = 'left';
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
    };

    DateService.prototype.loadPage = function(from){
        var self = this;
        self.target.trigger('loadPage.start');

        var query = {};

        if(from !== undefined){
            query.from = from;
        }

        $.get($.param(query))
        .success(function(reply){
            reply.forEach(function(dateItems){
                self.createDate(dateItems);
            });
            self.target.trigger('loadPage.end');
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
    var overlay, form, price, date, items, dateService;

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

        if(value[0] !== '+'){
            value = -1 * parseFloat(value);
        }

        return value;
    }

    $(function(){
        // Setting up the UI ---------------------------------------------------
        overlay = $('#overlay');
        form = $('#item-form');
        price = $('#id_price');
        date = $('#id_date');
        items = $('#items');

        price.focus();

        // Attaching handlers --------------------------------------------------
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
            overlay.show();
        });

        items.on('loadPage.end', function(){
            overlay.hide();
        });

        // ---------------------------------------------------------------------
        dateService = new DateService(items);
        dateService.loadPage();
    });
})();

