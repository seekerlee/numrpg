<script setup lang="ts">
/**
 * 时间换算器视图
 * 左侧：换算条目列表 + 全局参数
 * 右侧：结果展示（总时间、柱状图、饼图）
 */
import { computed } from 'vue'
import {
  NButton,
  NInput,
  NInputNumber,
  NSelect,
  NFormItem,
  NForm,
  NDivider,
  NTag,
} from 'naive-ui'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTimeConverter } from '../composables/useTimeConverter'
import { formatDuration } from '../utils/time'
use([CanvasRenderer, BarChart, PieChart, TooltipComponent, LegendComponent, GridComponent])

const {
  items,
  settings,
  itemSeconds,
  totalFormatted,
  realDaysFormatted,
  formatItem,
  addItem,
  removeItem,
} = useTimeConverter()

/** 速率单位选项 */
const unitOptions = [
  { label: '每秒', value: 'per_second' },
  { label: '每分钟', value: 'per_minute' },
  { label: '每小时', value: 'per_hour' },
  { label: '每天', value: 'per_day' },
]

/** 显示单位偏好选项 */
const displayModeOptions = [
  { label: '自动', value: 'auto' },
  { label: '秒', value: 's' },
  { label: '分钟', value: 'm' },
  { label: '小时', value: 'h' },
  { label: '天', value: 'd' },
]

/** 图表颜色列表 */
const CHART_COLORS = [
  '#63e2b7',
  '#f2a65a',
  '#70c0e8',
  '#e8706a',
  '#b77add',
  '#e8c06a',
  '#6ad4e8',
  '#e87a9e',
]

/** 横向柱状图 ECharts 配置 */
const barOption = computed(() => {
  const names = items.value.map((i) => i.name)
  const values = itemSeconds.value.map((s) => (isFinite(s) ? s : 0))

  return {
    backgroundColor: 'transparent',
    grid: { left: 100, right: 30, top: 20, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#1e2a38',
      borderColor: '#333',
      textStyle: { color: '#ccc' },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number }[])[0]
        return `${p.name}：${formatDuration(p.value, settings.value.displayMode)}`
      },
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#aaa',
        formatter: (val: number) => formatDuration(val, settings.value.displayMode),
      },
      splitLine: { lineStyle: { color: '#333' } },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#ccc' },
      axisLine: { lineStyle: { color: '#555' } },
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
      },
    ],
  }
})

/** 饼图 ECharts 配置 */
const pieOption = computed(() => {
  const finiteItems = items.value
    .map((item, i) => ({ name: item.name, value: itemSeconds.value[i] }))
    .filter((d) => isFinite(d.value) && d.value > 0)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e2a38',
      borderColor: '#333',
      textStyle: { color: '#ccc' },
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return `${p.name}：${formatDuration(p.value, settings.value.displayMode)}<br/>${p.percent}%`
      },
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      textStyle: { color: '#aaa' },
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '45%'],
        data: finiteItems.map((d, i) => ({
          ...d,
          itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        })),
        label: { color: '#ccc' },
        emphasis: {
          label: { fontWeight: 'bold' },
        },
      },
    ],
  }
})
</script>

<template>
  <div class="time-converter">
    <!-- 左侧：条目列表 + 全局参数 -->
    <div class="time-converter__left">
      <!-- 条目列表 -->
      <div class="section-title">换算条目</div>

      <div class="items-list">
        <div
          v-for="(item, idx) in items"
          :key="item.id"
          class="time-item"
        >
          <!-- 条目头部：名称 + 删除 -->
          <div class="time-item__header">
            <n-input
              v-model:value="item.name"
              size="small"
              placeholder="条目名称"
              style="flex: 1"
            />
            <n-button
              size="small"
              quaternary
              type="error"
              @click="removeItem(item.id)"
            >
              ✕
            </n-button>
          </div>

          <!-- 条目参数 -->
          <n-form label-placement="left" label-width="72" size="small">
            <n-form-item label="目标数量">
              <n-input-number
                v-model:value="item.target"
                :min="0"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="产出速率">
              <n-input-number
                v-model:value="item.rate"
                :min="0"
                :step="0.1"
                style="width: 100%"
              />
            </n-form-item>
            <n-form-item label="速率单位">
              <n-select
                v-model:value="item.unit"
                :options="unitOptions"
                size="small"
              />
            </n-form-item>
            <n-form-item label="数量乘数">
              <n-input-number
                v-model:value="item.multiplier"
                :min="0"
                :step="0.1"
                style="width: 100%"
              />
            </n-form-item>
          </n-form>

          <!-- 单项所需时间 -->
          <n-tag
            :type="isFinite(itemSeconds[idx]) ? 'success' : 'warning'"
            size="small"
            style="width: 100%; justify-content: center"
          >
            需要：{{ formatItem(idx) }}
          </n-tag>
        </div>
      </div>

      <!-- 添加条目按钮 -->
      <n-button
        dashed
        style="width: 100%; margin-top: 8px"
        @click="addItem"
      >
        + 添加条目
      </n-button>

      <!-- 分隔线 -->
      <n-divider style="margin: 16px 0 8px" />

      <!-- 全局参数 -->
      <div class="section-title">全局参数</div>
      <n-form label-placement="left" label-width="100" size="small">
        <n-form-item label="每日挂机时长">
          <n-input-number
            v-model:value="settings.dailyHours"
            :min="0.1"
            :max="24"
            :step="0.5"
            style="width: 100%"
          >
            <template #suffix>小时</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="显示单位">
          <n-select
            v-model:value="settings.displayMode"
            :options="displayModeOptions"
            size="small"
          />
        </n-form-item>
      </n-form>
    </div>

    <!-- 右侧：结果展示 -->
    <div class="time-converter__right">
      <!-- 总时间大字显示 -->
      <div class="result-card">
        <div class="result-card__label">总时间</div>
        <div class="result-card__value">{{ totalFormatted }}</div>
        <div class="result-card__sub">
          按每天 {{ settings.dailyHours }} 小时挂机：
          <span class="result-card__sub-value">{{ realDaysFormatted }}</span>
        </div>
      </div>

      <!-- 横向柱状图 -->
      <div class="chart-block">
        <div class="chart-block__title">时间分布（柱状图）</div>
        <v-chart
          class="bar-chart"
          :option="barOption"
          autoresize
        />
      </div>

      <!-- 饼图 -->
      <div class="chart-block">
        <div class="chart-block__title">时间占比（饼图）</div>
        <v-chart
          class="pie-chart"
          :option="pieOption"
          autoresize
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-converter {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 左侧滚动 */
.time-converter__left {
  overflow-y: auto;
  padding-right: 8px;
}

/* 右侧滚动 */
.time-converter__right {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-item {
  background: #1e2a38;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-item__header {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 结果卡片 */
.result-card {
  background: #1e2a38;
  border-radius: 8px;
  padding: 20px 24px;
  text-align: center;
}

.result-card__label {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}

.result-card__value {
  font-size: 36px;
  font-weight: 700;
  color: #63e2b7;
  margin-bottom: 8px;
}

.result-card__sub {
  font-size: 14px;
  color: #aaa;
}

.result-card__sub-value {
  color: #f2a65a;
  font-weight: 600;
}

/* 图表区 */
.chart-block {
  background: #1e2a38;
  border-radius: 8px;
  padding: 12px 16px;
}

.chart-block__title {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.bar-chart {
  width: 100%;
  height: 200px;
}

.pie-chart {
  width: 100%;
  height: 280px;
}
</style>
