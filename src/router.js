import Vue from 'vue'
import Router from 'vue-router'

import moment from 'moment'

import GraphSum from '@/components/graph-sum/component'
import GraphSumHeader from '@/components/graph-sum/header'
import ItemList from '@/components/item-list/component'
import ItemListHeader from '@/components/item-list/header'


Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      name: 'index',
      path: '/',
      redirect () {
        const now = moment()
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
      path: '/graph/sum/',
      components: {
        default: GraphSum,
        header: GraphSumHeader
      }
    }
  ]
})
