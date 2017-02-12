const settings = require('./settings');

function getHeaders(){
    return new Headers({'X-CSRFToken': settings.csrftoken});
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
        return fetch(`${settings.root}/autocomplete/tags/?term=${term}`)
            .then(v => v.json());
    }
    else {
        return [];
    }
};

module.exports.items = {
    loadMonth({year, month}){
        return fetch(`${settings.root}/items/${year}/${month}/`)
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

            return fetch(`${settings.root}/items/`, Object.assign({
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
            return fetch(`${settings.root}/items/`, Object.assign({
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

        return fetch(`${settings.root}/items/${id}/`, Object.assign({
            method: 'PATCH',
            credentials: 'same-origin',
        }, toJson(item)))
        .then(v => v.json());
    }
};