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
    loadMonth: function({year, month}){
        return fetch(`/${year}/${month}/items/`)
            .then(v => v.json());
    }
};