/**
 * 时间换算器状态管理 Composable
 * 使用 localStorage 持久化条目列表和全局参数
 */
import { ref, computed, watch } from 'vue'
import { computeSeconds, formatDuration } from '../utils/time'
import type { RateUnit, DisplayMode } from '../utils/time'

export type { RateUnit, DisplayMode }

export interface TimeItem {
  id: string
  name: string
  target: number
  rate: number
  unit: RateUnit
  multiplier: number
}

export interface TimeSettings {
  dailyHours: number
  displayMode: DisplayMode
}

const ITEMS_KEY = 'numrpg.timeItems'
const SETTINGS_KEY = 'numrpg.timeSettings'

/** 预设示例数据 */
const DEFAULT_ITEMS: TimeItem[] = [
  { id: '1', name: '强化材料', target: 100, rate: 2, unit: 'per_minute', multiplier: 1 },
  { id: '2', name: '经验值', target: 5000, rate: 10, unit: 'per_second', multiplier: 1 },
  { id: '3', name: '钻石', target: 300, rate: 50, unit: 'per_day', multiplier: 1 },
]

const DEFAULT_SETTINGS: TimeSettings = {
  dailyHours: 4,
  displayMode: 'auto',
}

function loadItems(): TimeItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as TimeItem[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // 解析失败时使用默认值
  }
  return DEFAULT_ITEMS.map((i) => ({ ...i }))
}

function loadSettings(): TimeSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<TimeSettings>) }
  } catch {
    // 解析失败时使用默认值
  }
  return { ...DEFAULT_SETTINGS }
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useTimeConverter() {
  const items = ref<TimeItem[]>(loadItems())
  const settings = ref<TimeSettings>(loadSettings())

  // 持久化
  watch(items, (val) => localStorage.setItem(ITEMS_KEY, JSON.stringify(val)), { deep: true })
  watch(settings, (val) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(val)), { deep: true })

  /** 每个条目所需秒数 */
  const itemSeconds = computed(() =>
    items.value.map((item) =>
      computeSeconds(item.target, item.rate, item.unit, item.multiplier),
    ),
  )

  /** 总秒数 */
  const totalSeconds = computed(() =>
    itemSeconds.value.reduce((sum, s) => (isFinite(s) ? sum + s : Infinity), 0),
  )

  /** 按每日有效时长换算的实际天数 */
  const realDays = computed(() => {
    if (!isFinite(totalSeconds.value)) return Infinity
    const dailySecs = settings.value.dailyHours * 3600
    if (dailySecs <= 0) return Infinity
    return totalSeconds.value / dailySecs
  })

  /** 格式化各条目时间 */
  function formatItem(idx: number): string {
    return formatDuration(itemSeconds.value[idx], settings.value.displayMode)
  }

  /** 格式化总时间 */
  const totalFormatted = computed(() =>
    formatDuration(totalSeconds.value, settings.value.displayMode),
  )

  /** 实际游戏天数格式化 */
  const realDaysFormatted = computed(() => {
    if (!isFinite(realDays.value)) return '∞ 永远'
    const d = realDays.value
    if (d < 1) return `${(d * 24).toFixed(1)} 小时`
    return `${d.toFixed(1)} 天`
  })

  /** 添加新条目 */
  function addItem() {
    items.value.push({
      id: genId(),
      name: `新条目 ${items.value.length + 1}`,
      target: 100,
      rate: 1,
      unit: 'per_minute',
      multiplier: 1,
    })
  }

  /** 删除条目 */
  function removeItem(id: string) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx !== -1) items.value.splice(idx, 1)
  }

  return {
    items,
    settings,
    itemSeconds,
    totalSeconds,
    realDays,
    totalFormatted,
    realDaysFormatted,
    formatItem,
    addItem,
    removeItem,
  }
}
