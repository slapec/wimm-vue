import Vue from 'vue';
import Vuex from 'vuex';

import app from './app';
import dateItems from './date-items';
import itemList from './item-list';
import ui from './ui';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    dateItems,
    itemList,
    ui
  }
});
