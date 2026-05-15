<script setup lang="ts">
/**
 * 曲线图组件
 * 使用 ECharts 渲染多条函数曲线，支持对数轴
 */
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

// 按需注册 ECharts 组件（统一在此注册，TimeConverter 也可复用）
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

defineProps<{
  option: EChartsOption
}>()
</script>

<template>
  <v-chart
    class="curve-chart"
    :option="option"
    autoresize
  />
</template>

<style scoped>
.curve-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
