/**
 * 公式管理 Composable
 * 使用 localStorage 持久化公式列表
 */
import { ref, watch } from 'vue'

export interface Formula {
  id: string
  name: string
  expr: string
  color: string
  visible: boolean
}

const STORAGE_KEY = 'numrpg.formulas'

/** 默认预设公式 */
const DEFAULT_FORMULAS: Formula[] = [
  { id: '1', name: '指数成长', expr: '100 * 1.15^x', color: '#63e2b7', visible: true },
  { id: '2', name: '幂函数成本', expr: '50 * x^2', color: '#f2a65a', visible: true },
]

/** 从 localStorage 加载公式列表 */
function loadFormulas(): Formula[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Formula[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // 解析失败时使用默认值
  }
  return DEFAULT_FORMULAS.map((f) => ({ ...f }))
}

/** 生成唯一 ID */
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** 可用颜色循环 */
const COLORS = ['#63e2b7', '#f2a65a', '#70c0e8', '#e8706a', '#b77add', '#e8c06a']

export function useFormulas() {
  const formulas = ref<Formula[]>(loadFormulas())

  // 监听变化自动持久化
  watch(
    formulas,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  /** 添加新公式 */
  function addFormula() {
    const colorIndex = formulas.value.length % COLORS.length
    formulas.value.push({
      id: genId(),
      name: `公式 ${formulas.value.length + 1}`,
      expr: 'x',
      color: COLORS[colorIndex],
      visible: true,
    })
  }

  /** 删除公式 */
  function removeFormula(id: string) {
    const idx = formulas.value.findIndex((f) => f.id === id)
    if (idx !== -1) formulas.value.splice(idx, 1)
  }

  return { formulas, addFormula, removeFormula }
}
