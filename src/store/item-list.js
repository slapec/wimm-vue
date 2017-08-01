import moment from 'moment';

import io from '@/services/io';


export default {
  namespaced: true,
  state: {
    currentDate: moment(),
    today: moment().format('YYYY-MM-DD'),

    isEditing: false,
    isDeleting: false,
    isLoading: false,
    dates: [],
    selected: new Set()
  },
  getters: {
    isEditingDisabled: state => state.isDeleting,
    isDeletingDisabled: state => state.isEditing,
    canNavigate: state => !(state.isEditing || state.isDeleting),
    currentDateFormatted: state => state.currentDate ? state.currentDate.format('YYYY / MMMM') : ''
  },
  mutations: {
    toggle: (state, property) => state[property] = !state[property],
    setCurrentDate: (state, nextDate) => {
      state.currentDate = nextDate;
      state.isEditing = false;
      state.isDeleting = false;
      state.isLoading = false;
      state.selected = new Set();

      const today = moment().format('YYYY-MM-DD');
      if(nextDate.format('YYYY-MM-DD') === today){
        this.today = today
      }
      else {
        this.today = nextDate.date(1).format('YYYY-MM-DD');
      }
    },
    setDates: (state, dates) => state.dates = dates,
    fetchStarted: state => state.isLoading = true
  },
  actions: {
    toggleEditing: ({commit}) => commit('toggle', 'isEditing'),
    toggleDeleting: ({commit}) => commit('toggle', 'isDeleting'),
    // .then(() =>{
    //   let lastItem = document.querySelector('.date-items:last-child li:last-child');
    //   if(lastItem){
    //     lastItem.scrollIntoView()
    //   }
    // })
    setCurrentDate: ({commit}, {year, month}) =>{
      const yearMonth = moment().year(year).month(month).subtract(1, 'month');

      commit('fetchStarted');

      return io.items.fetchMonth({year, month})
        .then(dates =>{
          dates.sort((left, right) => (left.date > right.date) - (left.date < right.date))
            .forEach(date => date.items.forEach(item =>{
              item.price = Number(item.price)
            }));

          commit('setDates', dates);
          commit('setCurrentDate', yearMonth)
        })
    }
  }
}

/**
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
        */
