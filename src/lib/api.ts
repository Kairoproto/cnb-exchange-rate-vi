import { ExchangeRate, ExchangeRateData } from './types'

const CNB_API_BASE = 'https://api.cnb.cz/cnbapi'

export class CNBApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'CNBApiError'
  }
}

export async function fetchExchangeRates(date?: string): Promise<ExchangeRateData> {
  try {
    const endpoint = date 
      ? `${CNB_API_BASE}/exrates/daily/${date}?lang=EN`
      : `${CNB_API_BASE}/exrates/daily?lang=EN`

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new CNBApiError(
        `Failed to fetch exchange rates: ${response.statusText}`,
        response.status
      )
    }

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
    if (error instanceof CNBApiError) {
      throw error
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CNBApiError('Network error: Unable to connect to CNB API')
    }
    
    throw new CNBApiError('An unexpected error occurred while fetching exchange rates')
  }
}
