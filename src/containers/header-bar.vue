<template>
  <div id="header">
    <button id="menu-btn" class="i i-menu" @click="toggleSidebar()"></button>
    <router-view name="header" id="header-router-view"></router-view>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    methods: {
      ...mapActions('ui', ['toggleSidebar'])
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import '../scss/consts';

  #header {
    position: relative;
    display: flex;
    flex-shrink: 0;
    background: $bg-ui;
    border-bottom: $header-bottom-border;

    #header-router-view {
      display: flex;
      flex-grow: 1;
    }

    button {
      padding: $header-btn-padding;
      background: $header-btn-bg;
      border: none;
      border-left: $header-btn-left-border;
      font-size: $header-btn-size;
      outline: none;
      cursor: pointer;

      -webkit-tap-highlight-color: transparent;

      &:active {
        background: $header-btn-active-bg;
      }
    }

    #menu-btn {
      border-left: none;
    }

    .fill {
      flex: 1;
      border-left: $header-btn-left-border;
    }
  }
</style>
