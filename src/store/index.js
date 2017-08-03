import Vue from 'vue';
import Vuex from 'vuex';

import app from './app';
import itemList from './item-list';
import ui from './ui';
import tags from './tags';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    itemList,
    tags,
    ui
  }
});
