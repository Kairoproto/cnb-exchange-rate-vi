import { useState, useEffect, useCallback } from 'react'
import { fetchExchangeRates, CNBApiError } from '@/lib/api'
import { ExchangeRateData } from '@/lib/types'

interface UseExchangeRatesResult {
  data: ExchangeRateData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useExchangeRates(date?: string): UseExchangeRatesResult {
  const [data, setData] = useState<ExchangeRateData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetchExchangeRates(date)
      setData(result)
    } catch (err) {
      if (err instanceof CNBApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}
