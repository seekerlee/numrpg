<script setup lang="ts">
/**
 * 公式编辑器组件
 * 支持添加/删除/隐藏公式，颜色选择，实时错误提示
 */
import { computed } from 'vue'
import { evaluate } from 'mathjs'
import { NButton, NInput, NSwitch, NTag, NTooltip } from 'naive-ui'
import type { Formula } from '../composables/useFormulas'

const props = defineProps<{
  formulas: Formula[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', id: string): void
}>()

/** 检验公式是否合法，返回错误信息或空字符串 */
function validateExpr(expr: string): string {
  try {
    evaluate(expr, { x: 1 })
    return ''
  } catch (err: unknown) {
    return err instanceof Error ? err.message : '公式错误'
  }
}

/** 每条公式的验证状态 */
const validationErrors = computed(() =>
  props.formulas.map((f) => validateExpr(f.expr)),
)
</script>

<template>
  <div class="formula-editor">
    <div class="formula-editor__list">
      <div
        v-for="(formula, idx) in formulas"
        :key="formula.id"
        class="formula-item"
      >
        <!-- 颜色指示条 -->
        <div class="formula-item__color-bar" :style="{ background: formula.color }" />

        <div class="formula-item__body">
          <!-- 第一行：名称 + 颜色 + 显隐 + 删除 -->
          <div class="formula-item__header">
            <n-input
              v-model:value="formula.name"
              size="small"
              placeholder="公式名称"
              style="flex: 1"
            />
            <input
              v-model="formula.color"
              type="color"
              class="color-picker"
              :title="`颜色：${formula.color}`"
            />
            <n-switch v-model:value="formula.visible" size="small" />
            <n-button
              size="small"
              quaternary
              type="error"
              @click="emit('remove', formula.id)"
            >
              ✕
            </n-button>
          </div>

          <!-- 第二行：公式表达式 -->
          <n-tooltip trigger="focus" placement="bottom-start">
            <template #trigger>
              <n-input
                v-model:value="formula.expr"
                size="small"
                placeholder="如 100 * 1.15^x"
                :status="validationErrors[idx] ? 'error' : undefined"
                style="font-family: monospace"
              />
            </template>
            <span v-if="validationErrors[idx]" style="color: #f2a65a">
              {{ validationErrors[idx] }}
            </span>
            <span v-else style="color: #63e2b7">公式合法 ✓</span>
          </n-tooltip>

          <!-- 错误提示 -->
          <n-tag
            v-if="validationErrors[idx]"
            type="error"
            size="small"
            style="margin-top: 4px"
          >
            {{ validationErrors[idx] }}
          </n-tag>
        </div>
      </div>
    </div>

    <!-- 添加按钮 -->
    <n-button
      dashed
      style="width: 100%; margin-top: 8px"
      @click="emit('add')"
    >
      + 添加公式
    </n-button>
  </div>
</template>

<style scoped>
.formula-editor__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formula-item {
  display: flex;
  gap: 8px;
  background: #1e2a38;
  border-radius: 6px;
  padding: 8px;
}

.formula-item__color-bar {
  width: 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.formula-item__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.formula-item__header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-picker {
  width: 28px;
  height: 28px;
  padding: 2px;
  border: 1px solid #333;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
