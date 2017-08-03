<template>
  <div id="app">
    <sidebar></sidebar>
    <div id="spinner" :class="{visible: spinnerVisible}"></div>
    <div id="overlay" :class="{visible: overlayVisible}"></div>
    <header-bar v-if="!isInitializing"></header-bar>
    <router-view id="default-router-view" v-if="!isInitializing"></router-view>
  </div>
</template>

<script>
  import {mapActions, mapGetters, mapState} from 'vuex';

  import HeaderBar from './containers/header-bar';
  import io from './services/io'
  import Sidebar from './components/sidebar';

  export default {
    name: 'app',
    components: {
      Sidebar,
      HeaderBar
    },
    computed: {
      ...mapGetters('ui', [
        'overlayVisible', 'spinnerVisible'
      ]),
      ...mapState('app', [
        'isInitializing'
      ])
    },
    methods: {
      ...mapActions('ui', [
        'hideUi'
      ]),
      ...mapActions('app', [
        'initialized'
      ])
    },
    watch: {
      $route(route){
        this.hideUi();
      }
    },
    created(){
      io.initialized.then(() => {this.initialized()});
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
    height: 100%;
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

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  #spinner {
    position: fixed;
    visibility: hidden;
    z-index: $layer-60;

    &::after {
      content: '';
      position: fixed;
      width: 96px;
      height: 96px;
      top: calc(50% - 48px);
      left: calc(50% - 48px);
      border-radius: 50%;
      border: 8px solid #286d81;
      border-left-color: transparent;
      animation: spin 2s infinite linear;
    }

    &.visible {
      visibility: visible;
    }
  }

  .numeric {
  font-family: monospace;
}

.positive {
  color: #1b9c0b;
}

.loading {
  position: fixed;
  width: 100%;
}

</style>
