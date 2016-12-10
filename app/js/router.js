let VueRouter = require('vue-router');

let ItemList = require('./../vue/itemlist.vue');

module.exports = new VueRouter({
    mode: 'hash',
    routes: [
        {
            name: 'index',
            path: '/', redirect: () => {
                let now = new Date();
                let month = now.getMonth() + 1;

                month = month < 10 ? `0${month}` : month;

                return {name: 'item:list:year-month', params: {year: now.getFullYear(), month: month}}
            }
        },
        {
            name: 'item:list:year-month',
            path: '/:year/:month/',
            component: ItemList
        },
        {
            name: '404',
            path: '*',
            redirect: {name: 'index'}
        }
    ]
});
