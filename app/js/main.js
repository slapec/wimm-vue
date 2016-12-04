let Vue = require('vue');
let Tag = require('./tags.vue');


let app = new Vue({
    delimiters: ['[[', ']]'],
    el: '#wimm',
    components: {
        tags: Tag
    },
    data: {
        tagList: [1,2,3],
    },
    methods: {
        autocomplete: function(term){
            return fetch(`/autocomplete/tags?term=${term}`)
                .then(v => v.json());
        }
    }
});
