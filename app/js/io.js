// Credit goes to http://stackoverflow.com/a/5639455

function getCsrfToken(){
    return (document.cookie.match(/(^|; )csrftoken=([^;]*)/)||0)[2]
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
            .then(v => v.json());
    },
    add(formData){
        return fetch('/items/', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
            headers: new Headers({
                'X-CSRFToken': getCsrfToken()
            })
        })
        .then(v => v.json());
    },
    remove(items){
        if(!items.length){
            return Promise.resolve();
        }

        let body = new Blob([JSON.stringify({
            'items': items
        })], {type: 'application/json'});

        return fetch('/items/', {
            method: 'DELETE',
            body: body,
            credentials: 'same-origin',
            headers: new Headers({
                'X-CSRFToken': getCsrfToken()
            })
        })
        .then(v => v.json());
    }
};