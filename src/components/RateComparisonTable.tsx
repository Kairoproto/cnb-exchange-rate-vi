import { useState } from 'react'
import { ComparisonDataPoint } from '@/hooks/use-comparison-rates'
import { ExchangeRate } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CaretUp, CaretDown, X, Info, TrendUp, TrendDown, Equals, CalendarPlus } from '@phosphor-icons/react'
import { formatDate, cn } from '@/lib/utils'

interface RateComparisonTableProps {
  comparisons: ComparisonDataPoint[]
  onRemoveDate: (date: string) => void
}

type SortField = 'currency' | 'country'
type SortDirection = 'asc' | 'desc'

export function RateComparisonTable({ comparisons, onRemoveDate }: RateComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('currency')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterCurrency, setFilterCurrency] = useState<string>('')

  if (comparisons.length === 0) {
    return (
      <Alert className="border-accent/30 bg-accent/5">
        <CalendarPlus size={20} weight="duotone" className="text-accent" />
        <AlertTitle>No Dates Selected</AlertTitle>
        <AlertDescription>
          Add dates above to compare exchange rates across different time periods. You can select up to 5 dates for comparison.
        </AlertDescription>
      </Alert>
    )
  }

  const getAllCurrencyCodes = (): string[] => {
    const codes = new Set<string>()
    comparisons.forEach(comp => {
      comp.data.rates.forEach(rate => codes.add(rate.currencyCode))
    })
    return Array.from(codes).sort()
  }

  const getRateForCurrency = (comparison: ComparisonDataPoint, currencyCode: string): ExchangeRate | undefined => {
    return comparison.data.rates.find(r => r.currencyCode === currencyCode)
  }

  const calculateChange = (oldRate: number | undefined, newRate: number | undefined): number | null => {
    if (oldRate === undefined || newRate === undefined) return null
    return ((newRate - oldRate) / oldRate) * 100
  }

  const getCurrencyInfo = (currencyCode: string): { name: string; country: string } => {
    for (const comp of comparisons) {
      const rate = comp.data.rates.find(r => r.currencyCode === currencyCode)
      if (rate) {
        return { name: rate.currency, country: rate.country }
      }
    }
    return { name: 'Unknown', country: 'Unknown' }
  }

  const currencyCodes = getAllCurrencyCodes()
  const filteredCodes = filterCurrency 
    ? currencyCodes.filter(code => 
        code.toLowerCase().includes(filterCurrency.toLowerCase()) ||
        getCurrencyInfo(code).name.toLowerCase().includes(filterCurrency.toLowerCase())
      )
    : currencyCodes

  const sortedCodes = [...filteredCodes].sort((a, b) => {
    const aInfo = getCurrencyInfo(a)
    const bInfo = getCurrencyInfo(b)
    
    let comparison = 0
    if (sortField === 'currency') {
      comparison = a.localeCompare(b)
    } else {
      comparison = aInfo.country.localeCompare(bInfo.country)
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const renderChangeIndicator = (change: number | null) => {
    if (change === null) {
      return <span className="text-muted-foreground text-sm">—</span>
    }

    const isPositive = change > 0
    const isNeutral = Math.abs(change) < 0.01

    if (isNeutral) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Equals size={14} weight="bold" />
          <span className="text-sm font-medium">0.00%</span>
        </div>
      )
    }

    return (
      <div className={cn(
        "flex items-center gap-1 font-medium",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? (
          <TrendUp size={14} weight="bold" />
        ) : (
          <TrendDown size={14} weight="bold" />
        )}
        <span className="text-sm">
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Rate Comparison</CardTitle>
              <CardDescription className="text-base mt-1">
                Comparing {comparisons.length} date{comparisons.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {comparisons.map((comp) => (
                <Badge
                  key={comp.date}
                  variant="secondary"
                  className="text-sm px-3 py-1 gap-2"
                >
                  {formatDate(comp.date)}
                  <button
                    onClick={() => onRemoveDate(comp.date)}
                    className="hover:text-destructive transition-colors"
                    title="Remove this date"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Filter by currency code or name..."
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="sm:max-w-xs"
            />
            <div className="text-sm text-muted-foreground self-center">
              Showing {sortedCodes.length} of {currencyCodes.length} currencies
            </div>
          </div>

          {comparisons.length > 1 && (
            <Alert className="border-accent/30 bg-accent/5">
              <Info size={20} weight="duotone" className="text-accent" />
              <AlertDescription>
                Percentage changes show the difference from the <strong>first date</strong> ({formatDate(comparisons[0].date)}) to each subsequent date. Green indicates rate increase, red indicates decrease.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('currency')}
                    className="font-semibold -ml-4 hover:bg-accent/10"
                  >
                    Currency
                    {sortField === 'currency' && (
                      sortDirection === 'asc' ? (
                        <CaretUp size={16} weight="bold" className="ml-1" />
                      ) : (
                        <CaretDown size={16} weight="bold" className="ml-1" />
                      )
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('country')}
                    className="font-semibold -ml-4 hover:bg-accent/10"
                  >
                    Country
                    {sortField === 'country' && (
                      sortDirection === 'asc' ? (
                        <CaretUp size={16} weight="bold" className="ml-1" />
                      ) : (
                        <CaretDown size={16} weight="bold" className="ml-1" />
                      )
                    )}
                  </Button>
                </TableHead>
                {comparisons.map((comp, index) => (
                  <TableHead key={comp.date} className="text-right min-w-[140px]">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold">
                        {new Date(comp.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                      </span>
                      {index > 0 && (
                        <span className="text-xs text-muted-foreground font-normal">
                          Change
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCodes.map((currencyCode) => {
                const currencyInfo = getCurrencyInfo(currencyCode)
                const baseRate = getRateForCurrency(comparisons[0], currencyCode)
                const baseRateValue = baseRate ? baseRate.rate / baseRate.amount : undefined

                return (
                  <TableRow key={currencyCode} className="hover:bg-muted/30">
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-semibold">
                        {currencyCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {currencyInfo.country}
                    </TableCell>
                    {comparisons.map((comp, index) => {
                      const rate = getRateForCurrency(comp, currencyCode)
                      const rateValue = rate ? rate.rate / rate.amount : undefined
                      const change = index > 0 ? calculateChange(baseRateValue, rateValue) : null

                      return (
                        <TableCell key={comp.date} className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            {rateValue !== undefined ? (
                              <>
                                <span className="font-mono font-medium">
                                  {rateValue.toFixed(3)} CZK
                                </span>
                                {index > 0 && renderChangeIndicator(change)}
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {sortedCodes.length === 0 && filterCurrency && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No currencies match your filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
