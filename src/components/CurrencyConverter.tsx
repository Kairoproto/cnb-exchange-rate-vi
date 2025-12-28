import { useState, useEffect } from 'react'
import { ExchangeRate } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowsLeftRight, Equals } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface CurrencyConverterProps {
  rates: ExchangeRate[]
}

export function CurrencyConverter({ rates }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<string>('100')
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('CZK')
  const [result, setResult] = useState<number | null>(null)

  const allCurrencies = [
    { code: 'CZK', name: 'Czech Koruna', rate: 1, amount: 1 },
    ...rates.map(r => ({ 
      code: r.currencyCode, 
      name: r.currency,
      rate: r.rate,
      amount: r.amount
    }))
  ]

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  useEffect(() => {
    calculateConversion()
  }, [amount, fromCurrency, toCurrency, rates])

  const calculateConversion = () => {
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setResult(null)
      return
    }

    const fromCurr = allCurrencies.find(c => c.code === fromCurrency)
    const toCurr = allCurrencies.find(c => c.code === toCurrency)

    if (!fromCurr || !toCurr) {
      setResult(null)
      return
    }

    const fromRateInCZK = fromCurr.rate / fromCurr.amount
    const toRateInCZK = toCurr.rate / toCurr.amount

    const amountInCZK = numericAmount * fromRateInCZK
    const convertedAmount = amountInCZK / toRateInCZK

    setResult(convertedAmount)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Currency Converter</CardTitle>
        <CardDescription className="text-base">
          Convert between currencies using live CNB exchange rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr] items-end">
            <div className="space-y-2">
              <Label htmlFor="from-amount" className="text-base font-medium">
                Amount
              </Label>
              <Input
                id="from-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-lg font-mono h-12"
                min="0"
                step="any"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapCurrencies}
              className="hidden md:flex h-12 w-12 shrink-0"
              title="Swap currencies"
            >
              <ArrowsLeftRight size={20} weight="bold" />
            </Button>

            <div className="space-y-2">
              <Label htmlFor="to-amount" className="text-base font-medium">
                Result
              </Label>
              <div className="relative">
                <Input
                  id="to-amount"
                  type="text"
                  value={result !== null ? result.toFixed(2) : ''}
                  readOnly
                  placeholder="0.00"
                  className="text-lg font-mono h-12 bg-muted/50"
                />
                {result !== null && (
                  <Equals 
                    size={20} 
                    weight="bold" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from-currency" className="text-base font-medium">
                From
              </Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from-currency" className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code} className="text-base">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{curr.code}</span>
                        <span className="text-muted-foreground">- {curr.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-currency" className="text-base font-medium">
                To
              </Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to-currency" className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code} className="text-base">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{curr.code}</span>
                        <span className="text-muted-foreground">- {curr.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSwapCurrencies}
            className="md:hidden gap-2"
          >
            <ArrowsLeftRight size={18} weight="bold" />
            Swap Currencies
          </Button>

          {result !== null && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Conversion Result</p>
                <p className="text-2xl font-bold font-mono">
                  {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                </p>
                {fromCurrency !== 'CZK' && toCurrency !== 'CZK' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Converted via CZK exchange rate
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
