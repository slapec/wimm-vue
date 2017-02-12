let moment = require('moment');
let VueRouter = require('vue-router');

let ItemList = require('./../vue/itemlist.vue');

module.exports = new VueRouter({
    mode: 'hash',
    routes: [
        {
            name: 'index',
            path: '/', redirect: () => {
                let now = moment();
                return {name: 'item:list:year-month', params: {year: now.format('YYYY'), month: now.format('MM')}}
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
