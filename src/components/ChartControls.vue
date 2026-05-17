<script setup lang="ts">
/**
 * 图表控制组件
 * 提供 x 范围、采样点数、对数轴切换
 */
import { NInputNumber, NSwitch, NFormItem, NForm } from 'naive-ui'
import type { ChartConfig } from '../composables/useChartOptions'

defineProps<{
  config: ChartConfig
}>()
</script>

<template>
  <n-form label-placement="left" label-width="90" size="small">
    <n-form-item label="X 最小值">
      <n-input-number
        v-model:value="config.xMin"
        :min="-1e9"
        :step="1"
        style="width: 100%"
      />
    </n-form-item>
    <n-form-item label="X 最大值">
      <n-input-number
        v-model:value="config.xMax"
        :min="-1e9"
        :step="1"
        style="width: 100%"
      />
    </n-form-item>
    <n-form-item label="采样点数">
      <n-input-number
        v-model:value="config.samples"
        :min="5"
        :max="500"
        :step="10"
        style="width: 100%"
      />
    </n-form-item>
    <n-form-item label="X 轴对数">
      <n-switch v-model:value="config.xLog" />
    </n-form-item>
    <n-form-item label="Y 轴对数">
      <n-switch v-model:value="config.yLog" />
    </n-form-item>
  </n-form>
</template>
