export interface ExchangeRate {
  country: string
  currency: string
  amount: number
  currencyCode: string
  rate: number
}

export interface ExchangeRateData {
  date: string
  rates: ExchangeRate[]
}
