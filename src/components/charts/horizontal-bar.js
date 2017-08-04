import {HorizontalBar, mixins} from 'vue-chartjs';


export default HorizontalBar.extend({
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  data(){
    return {
      defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        height: '100%',
      }
    }
  },
  mounted(){
    this.renderChart(this.chartData, this.options)
  }
});
