<template>
  <div>
    <div id="item-list">
      <div id="date-items">
        <date-items v-for="(dateItems, index) of dates" :key="dateItems.date"
                    :index="index"></date-items>
      </div>

      <div id="main-item-form" v-show="canNavigate">
        <item-form id="item-form-0" :date="today" @dateChanged="setToday"
                   :disabled="isSubmitting" @submit="doSubmit"></item-form>
        <button type="submit" form="item-form-0" class="i i-add"
                :disabled="isSubmitting">
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import store from '@/store';

  import ItemForm from '../item-form';
  import DateItems from './components/date-items';
  import io from '@/services/io';
  import {mapActions, mapGetters, mapState} from "vuex";

  export default {
    components: {
      ItemForm, DateItems
    },
    computed: {
      ...mapState('itemList', [
        'isSubmitting', 'dates', 'today'
      ]),
      ...mapGetters('itemList', [
        'canNavigate'
      ]),
      ...mapState('app', ['isInitializing'])
    },
    methods: {
      ...mapActions('itemList', ['setCurrentDate', 'setToday', 'submit']),
      async doSubmit(...args){
        const itemId = await this.submit(...args);
        this.$nextTick(() => {
          const elem = document.getElementById(`item-${itemId}`);
          if(elem !== null){
            elem.scrollIntoView(false);
          }
        })
      }
    },
    created(){
      this.setCurrentDate(this.$route.params);
    },
    watch: {
      $route(route){
        this.setCurrentDate(route.params);
      }
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import '../../scss/consts';

  #item-list {
    display: flex;
    flex-direction: column;
    height: 100%;

    form.item-form {
      display: flex;
      flex-wrap: wrap;
      position: relative;

      .tags {
        width: 100%;
        border: $input-border;

        .tag {
          font-size: $input-font-size;
        }

        .tag-input {
          input {
            font-size: $input-font-size;
          }

          ul {
            border: $item-form-tags-dropdown-border;
          }
        }
      }

      & > input {
        box-sizing: border-box;
        padding: $item-form-input-padding;
        border: $input-border;
        font-size: $input-font-size;

        &.date {
          width: $item-form-date-width;
          margin-right: $item-form-date-right-margin;
        }

        &.price {
          flex-grow: 1;
          text-align: right;
          width: 0;
        }
      }
    }

    #date-items {
      flex-grow: 1;
      padding: $date-item-list-padding;
      overflow: auto;
    }

    #main-item-form {
      display: flex;
      flex-shrink: 0;
      background: $bg;
      border-top: $main-item-form-border;
      padding: $main-item-form-padding;

      .item-form {
        flex-grow: 1;
        margin-right: $main-item-form-margin-right;

        .tags {
          background: $main-item-form-input-background;
          margin-bottom: $main-item-form-input-bottom-margin;
        }
      }

      button[type=submit] {
        width: $main-item-form-submit-width;
        background: $main-item-form-submit-background;
        color: $main-item-form-submit-color;
        border: $main-item-form-submit-border-width solid $main-item-form-submit-color;
        font-size: $main-item-form-submit-font-size;
        font-weight: $main-item-form-submit-font-weight;
        outline: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;

        &:active {
          color: $main-item-form-submit-background;
          background: $main-item-form-submit-color;
        }

        &:disabled {
          $color: lighten(grayscale($main-item-form-submit-color), 30);
          color: $color;
          background: lighten(grayscale($main-item-form-submit-background), 30);
          border: $main-item-form-submit-border-width solid $color;
          cursor: default;
        }
      }
    }

    #date-items {
      flex-grow: 1;
    }
  }
</style>
