<template>
  <div id="app">
    <sidebar :visible="ui.sidebarVisible" @toggle="toggleSidebar()"></sidebar>
    <div id="overlay" :class="{visible: overlayVisible}"></div>
    <header-bar @toggleSidebar="toggleSidebar()"></header-bar>
    <router-view id="default-router-view"></router-view>
  </div>
</template>

<script>
  import Sidebar from './components/sidebar'
  import HeaderBar from './containers/header-bar'

  export default {
    name: 'app',
    components: {
      Sidebar,
      HeaderBar
    },
    data(){
      return {
        ui: {
          sidebarVisible: false
        }
      }
    },
    methods: {
      toggleSidebar(){
        this.ui.sidebarVisible = !this.ui.sidebarVisible;
      }
    },
    computed: {
      overlayVisible(){
        return this.ui.sidebarVisible;
      }
    },
    watch: {
      $route(route){
        this.ui.sidebarVisible = false
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import './scss/consts';
  @import './assets/icomoon.css';

  html {
    touch-action: manipulation;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: $font-family;
    font-size: $font-size;
    background: $bg;
  }

  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  #default-router-view {
    overflow: auto;
  }

  #overlay {
    background: $overlay-bg;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: $layer-40;
    visibility: hidden;
    opacity: 0;
    transition: $overlay-transition;

    &.visible {
      visibility: visible;
      opacity: $overlay-opacity;
    }
  }

  .overlay-close {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      z-index: $layer-50;
    }
</style>
