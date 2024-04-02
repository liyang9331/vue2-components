<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts';
require('echarts/theme/macarons') // echarts theme
import resize from '@/views/dashboard/mixins/resize.js'

export default {
  name: 'HandlePie',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'pie'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    pieData: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    pieData(val) {
      this.notCompleteNum = val.notCompleteNum
      this.completeNum = val.completeNum
      this.initChart()
    }
  },
  data() {
    return {
      notCompleteNum: '',
      completeNum: '',
      chart: null
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
      const color = ['#0061CB', '#FFAA01']
      this.chart = echarts.init(this.$el)
      this.chart.setOption({
        color,
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: '60%',
            data: [
              { value: this.notCompleteNum, name: '未完成人数' },
              { value: this.completeNum, name: '完成人数' }, 
            ],
            label: {
              normal: {
                show: true,
                formatter: '{b}\n\n{c} 人',
                fontSize: 16,
                color: 'rgba(16, 39, 65, 0.50)',
                // position: 'left',
                rich: {
                  hr: {
                    height: 5,
                    width: 5,
                    backgroundColor: 't',
                    lineHeight: 5,
                    padding: [0, 0],
                    borderRadius: 5,
                    // backgroundColor: color[i], // 圆点颜色和饼图块状颜色一致
                  },
                  b: {
                    color: 'rgba(16, 39, 65, 0.50)',
                  },
                  c: {
                    color: 'red',
                  }
                }
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
  }
}
</script>
