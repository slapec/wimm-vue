let Vue = require('vue');
let VueRouter = require('vue-router');

let router = require('./router');

Vue.use(VueRouter);

new Vue({
    router,
    el: '#wimm'
});
