import Vue from 'vue';
import Vuex from 'vuex';

import app from './app';
import totalSum from './total-sum';
import tagSum from './tag-sum';
import itemList from './item-list';
import tags from './tags';
import ui from './ui';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    itemList,
    tags,
    tagSum,
    totalSum,
    ui
  }
});
