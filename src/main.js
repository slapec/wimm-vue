import Vue from 'vue';
import App from './app';
import router from './router';

import io from './services/io'

Vue.config.productionTip = false;

io.initialized.then(() => new Vue({
  el: '#app',
  router, render: h => h(App)
}));
