import { create } from 'zustand'
import { randomDelay } from '../lib/time'

const monthsBack = (n) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - n)
  return `${d.getMonth() + 1}월`
}

const REVENUE_STATS = [5, 4, 3, 2, 1, 0].map((n, i) => ({
  month: monthsBack(n),
  revenue: [2350000, 2680000, 3120000, 2900000, 3450000, 3980000][i],
}))

const PRODUCT_STATS = [
  { name: '레터링 케이크', revenue: 1200000, count: 28 },
  { name: '캐릭터 케이크', revenue: 980000, count: 14 },
  { name: '웨딩 케이크', revenue: 660000, count: 3 },
  { name: '데일리 케이크', revenue: 420000, count: 35 },
]

const PRODUCTION_TIME_STATS = [
  { name: '레터링 케이크', avgMinutes: 75 },
  { name: '캐릭터 케이크', avgMinutes: 150 },
  { name: '웨딩 케이크', avgMinutes: 320 },
  { name: '데일리 케이크', avgMinutes: 40 },
]

export const useStatsStore = create(() => ({
  getStats: async (type) => {
    await randomDelay(300, 600)
    if (type === 'revenue') return REVENUE_STATS
    if (type === 'product') return PRODUCT_STATS
    if (type === 'production-time') return PRODUCTION_TIME_STATS
    return []
  },
}))