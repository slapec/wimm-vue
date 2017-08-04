<template>
  <div>
    <div id="tag-sum">
      <div class="content">
        <horizontal-bar-chart :chartData="chart" :styles="{height: '100%'}"></horizontal-bar-chart>
      </div>
      <settings-bar :visible="isCalendarVisible" @hide="hideUi">
        <calendar :dateFrom="dateFrom" :dateTo="dateTo"
                  @change="onChanged"></calendar>

        <label for="tag-sum-tag-count">Top tags</label>
        <input id="tag-sum-tag-count" type="number" min="0" step="1" :value="tagCount" @input="onChanged('tagCount', $event.target.value)">

        <label for="tag-sum-negative-first">Negative first</label>
        <input id="tag-sum-negative-first" type="checkbox" :checked="negativeFirst" @change="onChanged('negativeFirst', $event.target.checked)">

        <button class="do-query" @click="doQuery">Query</button>
      </settings-bar>
    </div>
  </div>
</template>

<script>
  import {mapActions, mapGetters, mapState} from "vuex";
  import HorizontalBarChart from '@/components/charts/horizontal-bar';

  import SettingsBar from '@/components/settings-bar';
  import Calendar from '@/components/calendar';

  export default {
    components: {
      HorizontalBarChart, SettingsBar, Calendar
    },
    data(){
      return {
        chart: {}
      }
    },
    computed: {
      ...mapState('tagSum', [
        'isCalendarVisible', 'dateFrom', 'dateTo', 'tagCount', 'negativeFirst'
      ]),
      ...mapGetters('tagSum', ['chartData'])
    },
    methods: {
      ...mapActions('tagSum', ['hideUi', 'setProperty', 'query']),
      onChanged(key, value){
        this.setProperty({key, value});
      },
      async doQuery(){
        await this.query();
        this.chart = this.chartData;
      }
    },
    async mounted(){
      await this.query();
      this.chart = this.chartData;
    },
    beforeRouteLeave(to, from, next){
      this.hideUi();
      next();
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import '../../scss/consts';

  #tag-sum {
    height: 100%;

    .content {
      height: 100%;
    }

    .do-query {
      margin-top: 6px;
    }
  }
</style>
