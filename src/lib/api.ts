import { ExchangeRate, ExchangeRateData } from './types'

const CNB_API_BASE = 'https://api.cnb.cz/cnbapi'

// Updated proxy list - allorigins is currently the most stable for this use case
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://thingproxy.freeboard.io/fetch/',
]

let currentProxyIndex = 0
let workingProxy: string | null = null

export class CNBApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'CNBApiError'
  }
}

async function fetchWithRetry(endpoint: string, maxRetries: number = 2): Promise<Response> {
  let lastError: Error | null = null
  
  // Try the last known working proxy first
  if (workingProxy) {
    try {
      const proxiedEndpoint = `${workingProxy}${encodeURIComponent(endpoint)}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      
      const response = await fetch(proxiedEndpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) return response
      
      // If 404, the endpoint is wrong or data is missing for that specific date
      // We don't want to discard the proxy just because the date was empty
      if (response.status === 404) {
        throw new CNBApiError('Data not found for the specified date', 404)
      }
      
      // If it's a server error or forbidden, the proxy might be bad
      workingProxy = null
    } catch (error) {
      if (error instanceof CNBApiError) throw error
      workingProxy = null
    }
  }
  
  // Iterate through proxies
  for (let proxyAttempt = 0; proxyAttempt < CORS_PROXIES.length; proxyAttempt++) {
    const proxyIndex = (currentProxyIndex + proxyAttempt) % CORS_PROXIES.length
    const proxy = CORS_PROXIES[proxyIndex]
    
    // Some proxies don't handle double encoding well, but allorigins requires it.
    // We encode consistently here.
    const proxiedEndpoint = `${proxy}${encodeURIComponent(endpoint)}`
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)
        
        const response = await fetch(proxiedEndpoint, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          currentProxyIndex = proxyIndex
          workingProxy = proxy
          return response
        }
        
        if (response.status === 404) {
          // 404 means the API worked but date is empty. Stop retrying this URL.
          throw new CNBApiError('Data not found for the specified date', 404)
        }
        
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        lastError = error as Error
        
        if (error instanceof CNBApiError) throw error
        
        if (attempt < maxRetries) {
          await delay(500 * (attempt + 1)) // Increased backoff
        }
      }
    }
  }
  
  throw lastError || new Error('All fetch attempts failed')
}

export async function fetchExchangeRates(date?: string): Promise<ExchangeRateData> {
  // CRITICAL FIX: CNB API expects 'date' as a query parameter, not a path parameter.
  // Old (Broken): /exrates/daily/${date}
  // New (Fixed):  /exrates/daily?date=${date}
  const endpoint = date 
    ? `${CNB_API_BASE}/exrates/daily?date=${date}&lang=EN`
    : `${CNB_API_BASE}/exrates/daily?lang=EN`

  try {
    const response = await fetchWithRetry(endpoint)
    const data = await response.json()
    
    if (!data.rates || !Array.isArray(data.rates)) {
      throw new CNBApiError('Invalid response format from CNB API')
    }

    const rates: ExchangeRate[] = data.rates.map((rate: any) => ({
      country: rate.country || 'Unknown',
      currency: rate.currency || 'Unknown',
      amount: rate.amount || 1,
      currencyCode: rate.currencyCode || 'XXX',
      rate: rate.rate || 0,
    }))

    return {
      date: data.date || new Date().toISOString().split('T')[0],
      rates,
    }
  } catch (error) {
    if (error instanceof CNBApiError) throw error
    
    if (error instanceof TypeError || (error as Error).message?.includes('fetch')) {
      throw new CNBApiError('Network error: Unable to connect to CNB API via proxy')
    }
    
    throw new CNBApiError('An unexpected error occurred while fetching exchange rates')
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getWorkingDates(startDate: Date, numDays: number): string[] {
  const dates: string[] = []
  let daysAdded = 0
  let daysChecked = 0
  const maxDaysToCheck = numDays * 4 // Increased buffer for weekends/holidays
  
  // Start from yesterday to ensure data availability (CNB updates around 14:30 CET)
  const date = new Date(startDate)
  date.setDate(date.getDate() - 1)
  
  while (daysAdded < numDays && daysChecked < maxDaysToCheck) {
    const dayOfWeek = date.getDay()
    // Skip weekends (0 is Sunday, 6 is Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(date.toISOString().split('T')[0])
      daysAdded++
    }
    date.setDate(date.getDate() - 1) // Move backwards
    daysChecked++
  }
  
  return dates
}

async function fetchRatesInBatches(
  dates: string[],
  batchSize: number = 2
): Promise<Map<string, ExchangeRateData>> {
  const results = new Map<string, ExchangeRateData>()
  
  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize)
    
    // Process batch in parallel
    await Promise.all(batch.map(async (date) => {
      try {
        const data = await fetchExchangeRates(date)
        results.set(date, data)
      } catch (error) {
        console.warn(`Failed to fetch data for ${date}:`, error)
      }
    }))
    
    // Increased delay between batches to be nicer to the proxy
    if (i + batchSize < dates.length) {
      await delay(500) 
    }
  }
  
  return results
}

export async function fetchHistoricalRates(
  currencyCode: string,
  days: number = 30
): Promise<{ date: string; rate: number }[]> {
  const dates = getWorkingDates(new Date(), days)
  
  console.log(`Fetching ${days} days of historical data for ${currencyCode}...`)
  
  const rateDataMap = await fetchRatesInBatches(dates, 3) // Slightly larger batch size with better delay
  
  const historicalData: Array<{ date: string; rate: number }> = []
  let currencyNotFoundCount = 0
  
  dates.forEach((date) => {
    const data = rateDataMap.get(date)
    if (data) {
      const rate = data.rates.find(r => r.currencyCode === currencyCode)
      if (rate) {
        historicalData.push({
          date,
          rate: rate.rate / rate.amount,
        })
      } else {
        currencyNotFoundCount++
      }
    }
  })
  
  console.log(`Retrieved ${historicalData.length} of ${dates.length} data points`)
  
  if (historicalData.length === 0) {
    if (rateDataMap.size === 0) {
      throw new CNBApiError(
        `Unable to fetch historical data. 0 of ${dates.length} requests succeeded.\n\nPossible causes:\n• CNB API connectivity issues\n• Proxy services are overloaded\n\nPlease try selecting a shorter time range (e.g., 7 days).`
      )
    }
    
    if (currencyNotFoundCount > 0) {
      throw new CNBApiError(
        `No historical data found for ${currencyCode}. This currency might not be listed in daily CNB records.`
      )
    } 
    
    throw new CNBApiError(
      `Unable to retrieve sufficient data. Only ${rateDataMap.size}/${dates.length} dates loaded.`
    )
  }
  
  return historicalData.reverse()
}