import Vue from 'vue';
import Router from 'vue-router';

import TotalSum from '@/components/total-sum/component';
import TotalSumHeader from '@/components/total-sum/header';
import ItemList from '@/components/item-list/component';
import ItemListHeader from '@/components/item-list/header';
import store from '@/store';
import TagSum from '@/components/tag-sum/component';
import TagSumHeader from '@/components/tag-sum/header';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  routes: [
    {
      name: 'index',
      path: '/',
      redirect(){
        const now = store.state.itemList.currentDate;

        return {
          name: 'item:list:year-month',
          params: {
            year: now.format('YYYY'),
            month: now.format('MM')
          }
        }
      }
    },
    {
      name: 'item:list:year-month',
      path: '/:year(\\d+)/:month(\\d+)/',
      components: {
        default: ItemList,
        header: ItemListHeader
      }
    },
    {
      name: 'graph:sum',
      path: '/graph/total/',
      components: {
        default: TotalSum,
        header: TotalSumHeader
      }
    },
    {
      name: 'grap:tags',
      path: '/graph/tags/',
      components: {
        default: TagSum,
        header: TagSumHeader
      }
    }
  ]
});
