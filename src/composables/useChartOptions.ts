/**
 * 图表配置 Composable
 * 根据公式列表和图表参数生成 ECharts 配置
 */
import { computed, ref, watch } from 'vue'
import { evaluate } from 'mathjs'
import type { Formula } from './useFormulas'

export interface ChartConfig {
  xMin: number
  xMax: number
  samples: number
  xLog: boolean
  yLog: boolean
}

const STORAGE_KEY = 'numrpg.chartConfig'

function loadConfig(): ChartConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ChartConfig
  } catch {
    // 解析失败时使用默认值
  }
  return { xMin: 1, xMax: 50, samples: 50, xLog: false, yLog: false }
}

export function useChartOptions(formulas: ReturnType<typeof import('./useFormulas').useFormulas>['formulas']) {
  const config = ref<ChartConfig>(loadConfig())

  // 持久化图表配置
  watch(config, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  /** 生成 x 轴采样点 */
  const xValues = computed(() => {
    const { xMin, xMax, samples, xLog } = config.value
    const pts: number[] = []
    if (xLog) {
      const logMin = Math.log10(Math.max(xMin, 1e-10))
      const logMax = Math.log10(Math.max(xMax, 1e-9))
      for (let i = 0; i <= samples; i++) {
        pts.push(Math.pow(10, logMin + (i / samples) * (logMax - logMin)))
      }
    } else {
      for (let i = 0; i <= samples; i++) {
        pts.push(xMin + (i / samples) * (xMax - xMin))
      }
    }
    return pts
  })

  /** 对某条公式求值，返回 [x, y] 数据点 */
  function evalFormula(formula: Formula): [number, number][] {
    return xValues.value.map((x) => {
      try {
        const y = evaluate(formula.expr, { x }) as number
        return [x, isFinite(y) ? y : NaN]
      } catch {
        return [x, NaN]
      }
    })
  }

  /** ECharts option */
  const option = computed(() => {
    const series = formulas.value
      .filter((f) => f.visible)
      .map((f) => ({
        name: f.name,
        type: 'line' as const,
        smooth: true,
        symbol: 'none',
        data: evalFormula(f),
        itemStyle: { color: f.color },
        lineStyle: { color: f.color, width: 2 },
      }))

    return {
      backgroundColor: 'transparent',
      grid: { left: 60, right: 30, top: 30, bottom: 50 },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: '#1e2a38',
        borderColor: '#333',
        textStyle: { color: '#ccc' },
        formatter: (params: unknown) => {
          const ps = params as { seriesName: string; value: [number, number] }[]
          return ps
            .map((p) => `${p.seriesName}: (${p.value[0].toFixed(2)}, ${p.value[1].toFixed(2)})`)
            .join('<br/>')
        },
      },
      legend: {
        type: 'scroll',
        textStyle: { color: '#aaa' },
      },
      xAxis: {
        type: config.value.xLog ? ('log' as const) : ('value' as const),
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#aaa' },
      },
      yAxis: {
        type: config.value.yLog ? ('log' as const) : ('value' as const),
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#aaa' },
      },
      series,
    }
  })

  return { config, option }
}
