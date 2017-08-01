<template>
  <div id="sidebar">
    <ol :class="{visible}">
      <router-link tag="li" :to="{name: 'index'}">Item overview</router-link>
      <router-link tag="li" :to="{name: 'graph:sum'}">Sum graph</router-link>
    </ol>
    <div class="overlay-close" v-if="visible" @click="toggle()"></div>
  </div>
</template>

<script>
  import {mapActions, mapState} from "vuex";

  export default {
    computed: {
      ...mapState('ui', {
        visible: 'sidebarVisible'
      })
    },
    methods: {
      ...mapActions('ui', {
        toggle: 'toggleSidebar'
      })
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import '../scss/consts';

  #sidebar {
    ol {
      background: $bg-ui;
      bottom: 0;
      box-sizing: border-box;
      left: 0;
      list-style: none;
      margin: 0;
      padding: 0;
      position: absolute;
      top: 0;
      transform: translateX(-100%);
      transition: $sidebar-transition;
      width: $sidebar-width;
      z-index: $layer-60;

      li {
        border-bottom: $border;
        box-sizing: border-box;
        padding: $sidebar-li-padding;
        cursor: pointer;
        user-select: none;

        &:hover {
          background: $sidebar-li-hover;
        }

        &.router-link-active {
          background: $sidebar-li-link-active;
        }
      }

      &.visible {
        transform: none;
      }
    }
  }
</style>
