import { useKV } from '@github/spark/hooks'
import { useCallback, useMemo } from 'react'

export interface PresetUsageEvent {
  id: string
  presetId: string
  presetName: string
  timestamp: string
  category?: string
}

export interface PresetAnalytics {
  totalUses: number
  uniquePresetsUsed: number
  mostUsedPreset: {
    id: string
    name: string
    count: number
    category?: string
  } | null
  categoryBreakdown: {
    category: string
    count: number
    percentage: number
  }[]
  usageByDay: {
    date: string
    count: number
  }[]
  usageByWeek: {
    weekStart: string
    count: number
  }[]
  usageByMonth: {
    month: string
    count: number
  }[]
  topPresets: {
    id: string
    name: string
    count: number
    category?: string
    percentage: number
  }[]
  recentActivity: PresetUsageEvent[]
}

export function usePresetAnalytics() {
  const [usageHistory, setUsageHistory] = useKV<PresetUsageEvent[]>('preset-usage-history', [])

  const trackUsage = useCallback(
    (presetId: string, presetName: string, category?: string) => {
      const event: PresetUsageEvent = {
        id: `usage-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        presetId,
        presetName,
        timestamp: new Date().toISOString(),
        category,
      }

      setUsageHistory((current) => [...(current || []), event])
    },
    [setUsageHistory]
  )

  const clearHistory = useCallback(() => {
    setUsageHistory([])
  }, [setUsageHistory])

  const analytics = useMemo((): PresetAnalytics => {
    const history = usageHistory || []

    const totalUses = history.length
    const uniquePresetsUsed = new Set(history.map((e) => e.presetId)).size

    const presetCounts = history.reduce((acc, event) => {
      acc[event.presetId] = {
        count: (acc[event.presetId]?.count || 0) + 1,
        name: event.presetName,
        category: event.category,
      }
      return acc
    }, {} as Record<string, { count: number; name: string; category?: string }>)

    const sortedPresets = Object.entries(presetCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
        category: data.category,
        percentage: totalUses > 0 ? (data.count / totalUses) * 100 : 0,
      }))

    const mostUsedPreset = sortedPresets[0]
      ? {
          id: sortedPresets[0].id,
          name: sortedPresets[0].name,
          count: sortedPresets[0].count,
          category: sortedPresets[0].category,
        }
      : null

    const topPresets = sortedPresets.slice(0, 10)

    const categoryCounts = history.reduce((acc, event) => {
      const cat = event.category || 'custom'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalUses > 0 ? (count / totalUses) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const dayMap = history.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const usageByDay = Object.entries(dayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

    const weekMap = history.reduce((acc, event) => {
      const date = new Date(event.timestamp)
      const weekStart = getWeekStart(date)
      acc[weekStart] = (acc[weekStart] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const usageByWeek = Object.entries(weekMap)
      .map(([weekStart, count]) => ({ weekStart, count }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .slice(-12)

    const monthMap = history.reduce((acc, event) => {
      const date = new Date(event.timestamp)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const usageByMonth = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)

    const recentActivity = history.slice(-20).reverse()

    return {
      totalUses,
      uniquePresetsUsed,
      mostUsedPreset,
      categoryBreakdown,
      usageByDay,
      usageByWeek,
      usageByMonth,
      topPresets,
      recentActivity,
    }
  }, [usageHistory])

  return {
    analytics,
    trackUsage,
    clearHistory,
    usageHistory: usageHistory || [],
  }
}

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}
