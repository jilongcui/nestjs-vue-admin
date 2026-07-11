<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    },
    names: {
      type: Array,
      default: () => ['新增会员', '新增订单', '收入(元)'],
    },
    dualAxis: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({ expectedData, actualData, revenueData, date } = {}) {
      const [name1, name2, name3] = this.names;
      const legend = [];
      const series = [];
      if (expectedData && expectedData.length) {
        legend.push(name1);
        series.push({
          name: name1, smooth: true, type: 'line', yAxisIndex: 0,
          itemStyle: {
            normal: {
              color: '#f4516c',
              lineStyle: { color: '#f4516c', width: 2, type: this.dualAxis ? 'dashed' : 'solid' },
            },
          },
          data: expectedData, animationDuration: 2800, animationEasing: 'cubicInOut'
        });
      }
      if (actualData && actualData.length) {
        legend.push(name2);
        series.push({
          name: name2, smooth: true, type: 'line', yAxisIndex: 0,
          itemStyle: { normal: { color: '#3888fa', lineStyle: { color: '#3888fa', width: 2 } } },
          data: actualData, animationDuration: 2800, animationEasing: 'quadraticOut'
        });
      }
      if (revenueData && revenueData.length) {
        legend.push(name3);
        series.push({
          name: name3, smooth: true, type: 'line', yAxisIndex: this.dualAxis ? 1 : 0,
          itemStyle: { normal: { color: '#3888fa', lineStyle: { color: '#3888fa', width: 2 } } },
          data: revenueData, animationDuration: 2800, animationEasing: 'linear'
        });
      }
      const yAxis = this.dualAxis
        ? [
            { type: 'value', min: 0, max: 50, axisTick: { show: false }, splitLine: { show: true } },
            { type: 'value', min: 0, max: 500, axisTick: { show: false }, splitLine: { show: false } },
          ]
        : { type: 'value', axisTick: { show: false } };
      this.chart.setOption({
        xAxis: {
          data: date || [],
          boundaryGap: false, axisTick: { show: false }
        },
        grid: { left: 10, right: 30, bottom: 20, top: 30, containLabel: true },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, padding: [5, 10] },
        yAxis,
        legend: { data: legend },
        series,
      })
    }
  }
}
</script>
