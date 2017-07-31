<template>
  <div id="item-list-header">
    <div class="current-date">{{ currentDateFormatted }}</div>

    <button class="i"
            :class="{'i-mode_edit': !isEditing, 'i-close': isEditing}"
            :disabled="isEditingDisabled"
            @click="isEditing = !isEditing">
    </button>
    <button class="i"
            :class="{'i-delete': !isDeleting, 'i-close': isDeleting}"
            :disabled="isDeletingDisabled"
            @click="isDeleting = !isDeleting">
    </button>

    <div class="fill"></div>

    <button class="i i-keyboard_arrow_left"
            v-if="canNavigate"
            @click="seekMonth(-1)">
    </button>
    <button class="i i-navigate_next"
            v-if="canNavigate"
            @click="seekMonth(1)">
    </button>
  </div>
</template>

<script>
  import moment from 'moment';

  import io from '../../services/io';
  import bus from './bus';

  export default {
    data(){
      return {
        currentDateFormatted: '',
        currentDate: null,
        selected: new Set(),

        isEditing: false,
        isDeleting: false
      }
    },
    computed: {
      isEditingDisabled(){
        return this.isDeleting;
      },
      isDeletingDisabled(){
        return this.isEditing;
      },
      canNavigate(){
        return !(this.isEditing || this.isDeleting);
      }
    },
    mounted(){
      bus.$on('setCurrentDate', currentDate =>{
        this.currentDate = currentDate;
        this.currentDateFormatted = currentDate.format('YYYY / MMMM');
      })
    },
    methods: {
      seekMonth(direction){
        let nextMonth;

        if(direction > 0){
          nextMonth = this.currentDate.add(1, 'month');
        }
        else if(direction < 0){
          nextMonth = this.currentDate.subtract(1, 'month');
        }
        else {
          throw new Error('direction must be +1 or -1');
        }

        this.$router.push({
          name: 'item:list:year-month', params: {
            year: nextMonth.format('YYYY'),
            month: nextMonth.format('MM')
          }
        });
      }
    }
  }
</script>


<style lang="scss" rel="stylesheet/scss">
  @import '../../scss/consts';

  .current-date {
    left: 50%;
    position: absolute;
    text-align: center;
    top: 50%;
    transform: translate(-50%, -50%);
  }
</style>
