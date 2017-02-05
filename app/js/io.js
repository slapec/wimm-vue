// Credit goes to http://stackoverflow.com/a/5639455

function getCsrfToken(){
    return (document.cookie.match(/(^|; )csrftoken=([^;]*)/)||0)[2]
}

function getHeaders(){
    return new Headers({'X-CSRFToken': getCsrfToken()});
}

function toJson(data){
    return {
        body: new Blob([JSON.stringify(data)], {type: 'application/json'}),
        headers: getHeaders(),
    }
}

function prepareItem(item){
    item = Object.assign({}, item);
    item.tags = item.tags.join(',');
    return item;
}

module.exports.autocomplete = function(term){
    if(term){
        return fetch(`/autocomplete/tags?term=${term}`)
            .then(v => v.json());
    }
    else {
        return [];
    }
};

module.exports.items = {
    loadMonth({year, month}){
        return fetch(`/items/${year}/${month}/`)
            .then(v => v.json())
            .then(data => {
                data.forEach(date => {
                    date.items.forEach(item => {
                        item.date = date.date
                    })
                });

                return data;
            });
    },
    add(item){
        if(item){
            item = prepareItem(item);

            return fetch('/items/', Object.assign({
                method: 'POST',
                credentials: 'same-origin',
            }, toJson(item)))
            .then(v => v.json())
            .then(data => {
                data.item.date = data.date;

                return data;
            })
        }
        else {
            return Promise.resolve();
        }
    },
    remove(items){
        if(items.length){
            return fetch('/items/', Object.assign({
                method: 'DELETE',
                credentials: 'same-origin',
            }, toJson({'items': items})))
            .then(v => v.json());
        }
        else {
            return Promise.resolve();
        }
    },
    edit(id, item){
        item = prepareItem(item);

        return fetch(`/items/${id}/`, Object.assign({
            method: 'PATCH',
            credentials: 'same-origin',
        }, toJson(item)))
        .then(v => v.json());
    }
};