import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { useFilterPresets, FilterPreset } from './use-filter-presets'

export interface PresetRecommendation {
  id: string
  type: 'usage' | 'time' | 'similar' | 'ai'
  score: number
  reason: string
  preset?: FilterPreset
  suggestedFilters?: any
  suggestedName?: string
  suggestedDescription?: string
  category?: FilterPreset['category']
}

export interface UsagePattern {
  presetId: string
  timestamp: number
  dayOfWeek: number
  hourOfDay: number
  filterType: string
}

export function usePresetRecommendations() {
  const { presets } = useFilterPresets()
  const [usageHistory, setUsageHistory] = useKV<UsagePattern[]>('preset-usage-history', [])
  const [aiRecommendations, setAiRecommendations] = useKV<PresetRecommendation[]>('ai-preset-recommendations', [])
  const [isGenerating, setIsGenerating] = useState(false)

  const getMostUsedPresets = (limit: number = 5): FilterPreset[] => {
    return [...presets]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit)
  }

  const recordUsage = (presetId: string, filterType: string) => {
    const now = new Date()
    const pattern: UsagePattern = {
      presetId,
      timestamp: now.getTime(),
      dayOfWeek: now.getDay(),
      hourOfDay: now.getHours(),
      filterType,
    }

    setUsageHistory((current) => {
      const updated = [...(current || []), pattern]
      return updated.slice(-100)
    })
  }

  const getUsageBasedRecommendations = (): PresetRecommendation[] => {
    if (!usageHistory || usageHistory.length < 3) return []

    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()

    const hourlyUsage = new Map<string, number>()
    const dailyUsage = new Map<string, number>()

    usageHistory.forEach((pattern) => {
      const hourKey = `${pattern.presetId}-${pattern.hourOfDay}`
      const dayKey = `${pattern.presetId}-${pattern.dayOfWeek}`
      
      hourlyUsage.set(hourKey, (hourlyUsage.get(hourKey) || 0) + 1)
      dailyUsage.set(dayKey, (dailyUsage.get(dayKey) || 0) + 1)
    })

    const recommendations: PresetRecommendation[] = []

    presets.forEach((preset) => {
      const hourKey = `${preset.id}-${currentHour}`
      const dayKey = `${preset.id}-${currentDay}`
      
      const hourScore = hourlyUsage.get(hourKey) || 0
      const dayScore = dailyUsage.get(dayKey) || 0
      
      if (hourScore > 0 || dayScore > 0) {
        let reason = ''
        if (hourScore >= 2 && dayScore >= 2) {
          reason = `You often use this preset on ${getDayName(currentDay)}s around ${currentHour}:00`
        } else if (hourScore >= 2) {
          reason = `You typically use this preset around ${currentHour}:00`
        } else if (dayScore >= 2) {
          reason = `You usually use this preset on ${getDayName(currentDay)}s`
        }

        if (reason) {
          recommendations.push({
            id: `usage-${preset.id}`,
            type: 'usage',
            score: hourScore * 2 + dayScore,
            reason,
            preset,
          })
        }
      }
    })

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  const getTimeBasedRecommendations = (): PresetRecommendation[] => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    const recommendations: PresetRecommendation[] = []

    if (hour >= 9 && hour < 12) {
      recommendations.push({
        id: 'time-morning',
        type: 'time',
        score: 8,
        reason: 'Good morning! Try this preset for your morning currency review',
        suggestedFilters: {
          sortBy: 'change',
          sortOrder: 'desc',
          showOnlyFavorites: true,
        },
        suggestedName: 'Morning Review',
        suggestedDescription: 'Quick overview of favorite currencies with biggest changes',
        category: 'rate',
      })
    }

    if (hour >= 14 && hour < 17) {
      recommendations.push({
        id: 'time-afternoon',
        type: 'time',
        score: 7,
        reason: 'Afternoon check-in: Monitor high-value currency movements',
        suggestedFilters: {
          minRate: 20,
          sortBy: 'rate',
          sortOrder: 'desc',
        },
        suggestedName: 'High Value Currencies',
        suggestedDescription: 'Focus on currencies with rates above 20 CZK',
        category: 'rate',
      })
    }

    if (day === 1) {
      recommendations.push({
        id: 'time-monday',
        type: 'time',
        score: 9,
        reason: 'Start your week with a comprehensive market overview',
        suggestedFilters: {
          includeAllCurrencies: true,
          sortBy: 'country',
        },
        suggestedName: 'Weekly Market Overview',
        suggestedDescription: 'Full currency landscape for week planning',
        category: 'search',
      })
    }

    if (day === 5) {
      recommendations.push({
        id: 'time-friday',
        type: 'time',
        score: 9,
        reason: 'End of week: Review weekly currency performance',
        suggestedFilters: {
          comparisonDates: ['week'],
          showChanges: true,
        },
        suggestedName: 'Weekly Performance',
        suggestedDescription: 'Compare rates from Monday to Friday',
        category: 'comparison',
      })
    }

    return recommendations
  }

  const getSimilarPresetRecommendations = (currentFilters: any): PresetRecommendation[] => {
    if (!currentFilters || Object.keys(currentFilters).length === 0) return []

    const recommendations: PresetRecommendation[] = []

    presets.forEach((preset) => {
      const similarity = calculateFilterSimilarity(currentFilters, preset.filters)
      
      if (similarity > 0.3 && similarity < 0.9) {
        recommendations.push({
          id: `similar-${preset.id}`,
          type: 'similar',
          score: similarity * 10,
          reason: `Similar to your current filters (${Math.round(similarity * 100)}% match)`,
          preset,
        })
      }
    })

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 2)
  }

  const generateAIRecommendations = async (context?: {
    recentPresets?: FilterPreset[]
    currentTime?: number
    userBehavior?: string
  }) => {
    setIsGenerating(true)
    
    try {
      const mostUsed = getMostUsedPresets(5)
      const now = new Date()
      
      const promptText = `You are an intelligent preset recommendation system for a currency exchange rate application.

Current context:
- Time: ${now.toLocaleString()}
- Day: ${getDayName(now.getDay())}
- Hour: ${now.getHours()}:00
- Most used presets: ${mostUsed.map(p => `"${p.name}" (used ${p.useCount} times)`).join(', ')}
- Total presets: ${presets.length}

Generate 3-5 smart filter preset recommendations based on:
1. Time of day (morning routines, afternoon checks, end-of-day reviews)
2. Day of week (Monday market overview, Friday weekly wrap-up)
3. Common financial workflows (risk assessment, portfolio tracking, comparison analysis)
4. User's existing preset patterns

For each recommendation, provide:
- type: one of ["ai", "workflow", "insight"]
- name: Short, descriptive preset name (max 30 chars)
- description: Brief explanation of value (max 80 chars)
- reason: Why this is recommended now (max 100 chars)
- category: one of ["search", "rate", "comparison", "custom"]
- filters: Suggested filter configuration as JSON object
- score: Relevance score 1-10

Return as a JSON object with a single "recommendations" property containing the array.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      
      const aiRecs: PresetRecommendation[] = (data.recommendations || []).map((rec: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: 'ai' as const,
        score: rec.score || 7,
        reason: rec.reason || 'AI-powered recommendation',
        suggestedFilters: rec.filters || {},
        suggestedName: rec.name || 'Suggested Preset',
        suggestedDescription: rec.description || '',
        category: rec.category || 'custom',
      }))

      setAiRecommendations(aiRecs)
      return aiRecs
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error)
      return []
    } finally {
      setIsGenerating(false)
    }
  }

  const allRecommendations = useMemo(() => {
    const usage = getUsageBasedRecommendations()
    const time = getTimeBasedRecommendations()
    const ai = aiRecommendations || []

    const combined = [...usage, ...time, ...ai]
    
    return combined
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [usageHistory, presets, aiRecommendations])

  const refreshRecommendations = async () => {
    await generateAIRecommendations()
  }

  return {
    recommendations: allRecommendations,
    usageRecommendations: getUsageBasedRecommendations(),
    timeRecommendations: getTimeBasedRecommendations(),
    aiRecommendations: aiRecommendations || [],
    isGenerating,
    recordUsage,
    getSimilarRecommendations: getSimilarPresetRecommendations,
    generateAIRecommendations,
    refreshRecommendations,
  }
}

function calculateFilterSimilarity(filters1: any, filters2: any): number {
  if (!filters1 || !filters2) return 0

  const keys1 = Object.keys(filters1)
  const keys2 = Object.keys(filters2)
  
  if (keys1.length === 0 || keys2.length === 0) return 0

  const allKeys = new Set([...keys1, ...keys2])
  let matches = 0

  allKeys.forEach((key) => {
    if (filters1[key] === filters2[key]) {
      matches++
    } else if (
      typeof filters1[key] === 'object' &&
      typeof filters2[key] === 'object' &&
      JSON.stringify(filters1[key]) === JSON.stringify(filters2[key])
    ) {
      matches++
    }
  })

  return matches / allKeys.size
}

function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day]
}
