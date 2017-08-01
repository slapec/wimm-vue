<template>
  <div>
    <div id="item-list">
      <date-items></date-items>

      <div id="main-item-form" v-show="canNavigate">
        <item-form id="item-form-0"></item-form>
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
        'isSubmitting'
      ]),
      ...mapGetters('itemList', [
        'canNavigate'
      ]),
      ...mapState('app', ['isInitializing'])
    },
    methods: {
      ...mapActions('itemList', ['setCurrentDate'])
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

    .date-items {
      flex-grow: 1;
    }

    #main-item-form {
      display: flex;
      flex-shrink: 0;
      background: $bg-ui;
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
  }
</style>
