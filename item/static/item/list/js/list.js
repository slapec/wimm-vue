(function(){
    function StickyService(){
        var self = this;

        this.dateElems = [];
        this.sticked = null;

        this.media = window.matchMedia('(max-width: 800px)');

        window.addEventListener('resize', function(){
            self.cache();
        })
    }

    StickyService.prototype.cache = function(){
        console.log('cache');

        var sticked = this.sticked;
        if(sticked){
            sticked.date.classList.remove('sticked');
            this.sticked = null;
        }

        this.dateElems = [];

        var dateElems = document.getElementsByClassName('date');
        for(var i=0; i<dateElems.length; i++){
            var elem = dateElems[i];

            var items = elem.getElementsByTagName('li');
            var dateHead = elem.getElementsByClassName('date-head')[0];

            this.dateElems.push({
                date: elem,
                left: left,
                leftHeight: left.getBoundingClientRect().height,
                absolute: items[items.length - 1]
            });
        }
        this.stick();
    };

    StickyService.prototype.stick = function(){
        var media = this.media;
        var elems = this.dateElems;
        var sticked = this.sticked;

        var lastInvisible = null;

        for(var i=0; i<elems.length; i++){
            var elem =  elems[i];

            // var bounds = elem.date.getBoundingClientRect();
            var bounds = elem.date.offsetTop - document.body.scrollTop;
            if(bounds <= 0){
                lastInvisible = elem;
            }
            else {
                break;
            }
        }

        if(lastInvisible){
            var absoluteBounds = lastInvisible.absolute.getBoundingClientRect();
            if(absoluteBounds.bottom <= lastInvisible.leftHeight){
                lastInvisible.date.classList.add('absolute');
                lastInvisible.left.style.top = lastInvisible.absolute.offsetTop + 'px';
            }
            else {
                lastInvisible.date.classList.remove('absolute');
                lastInvisible.left.style.removeProperty('top');
            }
        }

        if(lastInvisible !== sticked){
            if(sticked !== null){
                sticked.date.classList.remove('sticked', 'absolute');
                sticked.left.style.removeProperty('top');
                sticked.date.style.paddingTop = '0px';
                this.sticked = null;
            }
            if(lastInvisible){
                if(media.matches){
                    lastInvisible.date.style.paddingTop = lastInvisible.left.getBoundingClientRect().height + 'px';
                }
                lastInvisible.date.classList.add('sticked');
                this.sticked = lastInvisible;
            }
        }
    };

    function DateService(target){
        this.target = target;
        this.dates = {};
    }

    DateService.prototype.createItem = function(dateItemsElem, details){
        var itemElem = document.createElement('li');
        dateItemsElem.insertBefore(itemElem, dateItemsElem.firstChild);

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
    var overlay, form, price, date, items, dateService, stickyService;

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
        // Setting up the UI ---------------------------------------------------
        stickyService = new StickyService();

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
                stickyService.cache();
            })
            .error(function(){
               enableInputs();
            });
        });

        items.on('loadPage.start', function(){
            overlay.show();
        });

        items.on('loadPage.end', function(){
            // stickyService.cache();
            overlay.hide();
        });

        window.addEventListener('scroll', function(){
            // stickyService.stick();
        });

        // ---------------------------------------------------------------------
        dateService = new DateService(items);
        dateService.loadPage();
    });
})();

