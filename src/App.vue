<script setup lang="ts">
/**
 * 主应用组件
 * 顶部标题栏 + Tab 切换（曲线对比 / 时间换算器）
 */
import { ref, watch } from 'vue'
import { NConfigProvider, NLayout, NLayoutHeader, NTabs, NTabPane, darkTheme } from 'naive-ui'
import FormulaEditor from './components/FormulaEditor.vue'
import ChartControls from './components/ChartControls.vue'
import CurveChart from './components/CurveChart.vue'
import TimeConverter from './views/TimeConverter.vue'
import { useFormulas } from './composables/useFormulas'
import { useChartOptions } from './composables/useChartOptions'

const ACTIVE_TAB_KEY = 'numrpg.activeTab'

// 从 localStorage 恢复上次选中的 Tab
const activeTab = ref<string>(localStorage.getItem(ACTIVE_TAB_KEY) ?? 'curve')

// 持久化 Tab 选择
watch(activeTab, (val) => localStorage.setItem(ACTIVE_TAB_KEY, val))

// 公式列表
const { formulas, addFormula, removeFormula } = useFormulas()

// 图表配置与 ECharts option
const { config, option } = useChartOptions(formulas)
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-layout class="app-layout">
      <!-- 顶部标题栏 -->
      <n-layout-header class="app-header">
        <span class="app-title">numrpg — RPG 挂机数值工具</span>
      </n-layout-header>

      <!-- 主内容区：Tab 切换 -->
      <div class="app-body">
        <n-tabs
          v-model:value="activeTab"
          type="line"
          animated
          class="main-tabs"
          pane-style="height: 100%; overflow: hidden;"
        >
          <!-- 📈 曲线对比 -->
          <n-tab-pane name="curve" tab="📈 曲线对比">
            <div class="curve-layout">
              <!-- 左侧：公式编辑 + 图表控制 -->
              <div class="curve-layout__left">
                <div class="panel-title">公式列表</div>
                <FormulaEditor
                  :formulas="formulas"
                  @add="addFormula"
                  @remove="removeFormula"
                />
                <div class="panel-title" style="margin-top: 16px">图表参数</div>
                <ChartControls :config="config" />
              </div>

              <!-- 右侧：曲线图 -->
              <div class="curve-layout__right">
                <CurveChart :option="option" />
              </div>
            </div>
          </n-tab-pane>

          <!-- ⏱️ 时间换算器 -->
          <n-tab-pane name="time" tab="⏱️ 时间换算器">
            <TimeConverter />
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-layout>
  </n-config-provider>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f1923;
}

.app-header {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #111d2c;
  border-bottom: 1px solid #1e2f3f;
  flex-shrink: 0;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: #63e2b7;
  letter-spacing: 0.02em;
}

.app-body {
  flex: 1;
  overflow: hidden;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
}

/* main-tabs 撑满高度 */
.main-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.n-tabs-pane-wrapper) {
  flex: 1;
  overflow: hidden;
  height: 100%;
}

:deep(.n-tab-pane) {
  height: 100%;
  overflow: hidden;
}

/* 曲线对比布局 */
.curve-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.curve-layout__left {
  overflow-y: auto;
  padding-right: 4px;
}

.curve-layout__right {
  overflow: hidden;
}

.panel-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
