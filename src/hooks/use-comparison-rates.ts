import { useState, useCallback } from 'react'
import { fetchExchangeRates, CNBApiError } from '@/lib/api'
import { ExchangeRateData } from '@/lib/types'

// Define the data structure for a comparison point
export interface ComparisonDataPoint {
  date: string
  data: ExchangeRateData
}

// Define the return type of the hook
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
    // 1. Prevent duplicates
    if (comparisons.some(c => c.date === date)) {
      setError('This date is already in the comparison')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // 2. Fetch the data
      const result = await fetchExchangeRates(date)
      
      // 3. Add to state and sort chronologically
      setComparisons(prev => {
        const updated = [...prev, { date, data: result }]
        return updated.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      })
    } catch (err) {
      // 4. Handle errors gracefully
      if (err instanceof CNBApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while fetching rates')
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
    setIsLoading(false)
  }, [])

  const refetchAll = useCallback(async () => {
    if (comparisons.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const promises = comparisons.map(comp => 
        fetchExchangeRates(comp.date).then(result => ({ date: comp.date, data: result }))
      )
      const results = await Promise.all(promises)
      setComparisons(results.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ))
    } catch (err) {
      if (err instanceof CNBApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while refreshing comparison data')
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

