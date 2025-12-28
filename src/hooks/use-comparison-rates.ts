import { useState, useCallback } from 'react'
import { fetchExchangeRates, CNBApiError } from '@/lib/api'
import { ExchangeRateData } from '@/lib/types'

export interface ComparisonDataPoint {
  date: string
  data: ExchangeRateData
}

interface UseComparisonRatesResult {
  comparisons: ComparisonDataPoint[]
  isLoading: boolean
  error: string | null
  addDate: (date: string) => Promise<void>
  removeDate: (date: string) => void
  clear: () => void
  refetchAll: () => Promise<void>
}

export function useComparisonRates(): UseComparisonRatesResult {
  const [comparisons, setComparisons] = useState<ComparisonDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addDate = useCallback(async (date: string) => {
    if (comparisons.some(c => c.date === date)) {
      setError('This date is already in the comparison')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetchExchangeRates(date)
      setComparisons(prev => [...prev, { date, data: result }].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ))
    } catch (err) {
      if (err instanceof CNBApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch data for this date')
      }
    } finally {
      setIsLoading(false)
    }
  }, [comparisons])

  const removeDate = useCallback((date: string) => {
    setComparisons(prev => prev.filter(c => c.date !== date))
    setError(null)
  }, [])

  const clear = useCallback(() => {
    setComparisons([])
    setError(null)
  }, [])

  const refetchAll = useCallback(async () => {
    if (comparisons.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const results = await Promise.all(
        comparisons.map(async (comp) => {
          const data = await fetchExchangeRates(comp.date)
          return { date: comp.date, data }
        })
      )
      setComparisons(results)
    } catch (err) {
      if (err instanceof CNBApiError) {
        setError(err.message)
      } else {
        setError('Failed to refresh comparison data')
      }
    } finally {
      setIsLoading(false)
    }
  }, [comparisons])

  return {
    comparisons,
    isLoading,
    error,
    addDate,
    removeDate,
    clear,
    refetchAll,
  }
}
