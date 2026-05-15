/**
 * 时间工具函数
 * 提供时间格式化和换算功能
 */

export type RateUnit = 'per_second' | 'per_minute' | 'per_hour' | 'per_day'
export type DisplayMode = 'auto' | 's' | 'm' | 'h' | 'd'

/** 各速率单位对应的秒数 */
const UNIT_SECONDS: Record<RateUnit, number> = {
  per_second: 1,
  per_minute: 60,
  per_hour: 3600,
  per_day: 86400,
}

/**
 * 把目标数量、产出速率、单位换算成所需秒数
 * @param target 目标数量
 * @param rate 每单位时间产出量
 * @param unit 速率单位
 * @param multiplier 数量乘数（如每次掉 2 个，填 2）
 */
export function computeSeconds(
  target: number,
  rate: number,
  unit: RateUnit,
  multiplier: number,
): number {
  if (target <= 0) return 0
  const effectiveRate = rate * multiplier
  if (effectiveRate <= 0) return Infinity
  // 实际每秒产出
  const perSecond = effectiveRate / UNIT_SECONDS[unit]
  return target / perSecond
}

/**
 * 把秒数格式化为人类可读字符串
 * auto 模式自动选合适的单位组合
 * @param seconds 秒数
 * @param mode 显示模式
 */
export function formatDuration(seconds: number, mode: DisplayMode = 'auto'): string {
  if (!isFinite(seconds)) return '∞ 永远'
  if (seconds <= 0) return '0 秒'

  const s = Math.floor(seconds)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const secs = s % 60

  switch (mode) {
    case 's':
      return `${s} 秒`
    case 'm': {
      const totalMinutes = Math.floor(s / 60)
      const remainSecs = s % 60
      if (remainSecs === 0) return `${totalMinutes} 分钟`
      return `${totalMinutes} 分 ${remainSecs} 秒`
    }
    case 'h': {
      const totalHours = Math.floor(s / 3600)
      const remainMinutes = Math.floor((s % 3600) / 60)
      if (remainMinutes === 0) return `${totalHours} 小时`
      return `${totalHours} 小时 ${remainMinutes} 分`
    }
    case 'd': {
      const totalDays = Math.floor(s / 86400)
      const remainHours = Math.floor((s % 86400) / 3600)
      if (remainHours === 0) return `${totalDays} 天`
      return `${totalDays} 天 ${remainHours} 小时`
    }
    case 'auto':
    default: {
      if (s < 60) {
        // 不足 1 分钟，显示秒
        return `${s} 秒`
      } else if (s < 3600) {
        // 不足 1 小时，显示分秒
        if (secs === 0) return `${minutes} 分钟`
        return `${minutes} 分 ${secs} 秒`
      } else if (s < 86400) {
        // 不足 1 天，显示时分
        if (minutes === 0) return `${hours} 小时`
        return `${hours} 小时 ${minutes} 分`
      } else {
        // 超过 1 天，显示天时
        if (hours === 0) return `${days} 天`
        return `${days} 天 ${hours} 小时`
      }
    }
  }
}
