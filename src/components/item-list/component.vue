<template>
  <div id="item-list">
    <h1>ItemList</h1>
    <div id="date-items-list">
      <date-items v-for="dateItems of dates"
                  :key="dateItems.date"
                  :date="dateItems.date"
                  :items="dateItems.items"
                  :deleting="deleting"
                  :editing="editing"
                  @select="itemSelected"
                  @itemChanged="itemChanged(dateItems, $event)">
      </date-items>
    </div>

    <div id="main-item-form"
         v-show="canNavigate">
      <item-form id="item-form-0" @submit="submit" :date="today" @dateChanged="dateChanged"
                 :disabled="submitting"></item-form>
      <button type="submit" form="item-form-0" class="i i-add"
              v-bind:disabled="submitting"></button>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';

  import ItemForm from '../item-form';
  import DateItems from './components/date-items';
  import io from '@/services/io';
  import bus from './bus';

  export default {
    components: {
      ItemForm, DateItems
    },
    data(){
      return {
        today: null,
        canNavigate: true,
        submitting: false,
        dates: []
      }
    },
    mounted(){
      bus.$emit('setCurrentDate', moment());
    },
    methods: {
      loadMonth({year, month}){
        this.loading = true

        io.items.fetchMonth({year, month})
          .then(dates =>{
            dates.sort((left, right) => (left.date > right.date) - (left.date < right.date))
              .forEach(date => date.items.forEach(item =>{
                item.price = Number(item.price)
              }))
            this.dates = dates
          })
          .then(() =>{
            let yearMonth = moment().year(year).month(month).subtract(1, 'month')
            this._yearMonth = yearMonth
            this.yearMonth = yearMonth.format('YYYY / MMMM')

            let today = moment().format('YYYY-MM-DD')

            if(yearMonth.format('YYYY-MM-DD') === today){
              this.today = today
            }
            else {
              this.today = yearMonth.date(1).format('YYYY-MM-DD')
            }
          })
          .then(() =>{
            let lastItem = document.querySelector('.date-items:last-child li:last-child')
            if(lastItem){
              lastItem.scrollIntoView()
            }

            this.loading = false
            this.deleting = false
            this.editing = false
            this.selected = new Set()
          })
      },
      submit({item, callback}){
        let scrollRequired = false
        this.submitting = true

        io.items.add(item)
          .then(item =>{
            let [date] = this.dates.filter(d => d.date === item.date)
            item.item.price = Number(item.item.price)

            if(date){
              date.items.push(item.item)
              scrollRequired = true
            }
            else {
              if(moment(item.date, 'YYYY-MM-DD').format('YYYY-MM') === this._yearMonth.format('YYYY-MM')){
                this.dates.push({
                  date: item.date,
                  items: [item.item]
                })
                this.dates.sort((left, right) => (left.date > right.date) - (left.date < right.date))

                scrollRequired = true
              }
            }

            if(scrollRequired){
              this.$nextTick(() => document.getElementById(`item-${item.item.id}`).scrollIntoView(false))
            }
          })
          .then(() =>{
            callback()
            this.submitting = false
          })
      },
      dateChanged (date) {
        this.today = date
      },
    },
    itemSelected(id, isSelected){
      let selected = this.selected

      if(isSelected){
        selected.add(id)
      }
      else {
        selected.delete(id)
      }
    },
    itemChanged(dateItems, {item, index}){
      if(item.date === dateItems.date){
        dateItems.items[index] = item
      }
      else {
        dateItems.items.splice(index, 1)
        if(!dateItems.items.length){
          this.dates.splice(this.dates.indexOf(dateItems), 1)
        }

        [dateItems] = this.dates.filter(d => d.date === item.date)

        if(dateItems){
          dateItems.items.push(item)
        }
        else {
          this.dates.push({
            date: item.date,
            items: [item]
          })
        }

        this.dates.sort((left, right) => (left.date > right.date) - (left.date < right.date))
      }
    },
    deleteSelected(){
      let toDelete = Array.from(this.selected)

      this.loading = true
      io.items.remove(toDelete)
        .then(() =>{
          for(let date of this.dates){
            date.items = date.items.filter(d => !this.selected.has(d.id))
          }

          this.dates = this.dates.filter(d => d.items.length > 0)

          this.selected = new Set()
          this.loading = false
        })
    },
    watch: {
      $route (route) {
        this.loadMonth(route.params)
      }
      ,
      deleting (value) {
        if (!value) {
          this.selected = new Set()
        }
      }
    }
  };
</script>
