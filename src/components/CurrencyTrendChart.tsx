import { useState, useMemo, useEffect } from 'react'
import { ExchangeRate } from '@/lib/types'
import { useHistoricalRates } from '@/hooks/use-historical-rates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown, ArrowsClockwise, Warning, ChartLine, ChartBar, ChartLineUp, Percent } from '@phosphor-icons/react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ComposedChart, Cell } from 'recharts'
import { formatDate } from '@/lib/utils'

type ChartType = 'line' | 'bar' | 'area' | 'change'

interface CurrencyTrendChartProps {
  rates: ExchangeRate[]
}

export function CurrencyTrendChart({ rates }: CurrencyTrendChartProps) {
  const defaultCurrency = useMemo(() => {
    const priorityCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF']
    const availablePriority = priorityCurrencies.find(code => 
      rates.some(rate => rate.currencyCode === code)
    )
    return availablePriority || (rates.length > 0 ? rates[0].currencyCode : 'USD')
  }, [rates])

  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrency)
  const [timeRange, setTimeRange] = useState<number>(7)
  const [chartType, setChartType] = useState<ChartType>('line')

  // Safety: Ensure selected currency actually exists in provided rates
  useEffect(() => {
    if (rates.length > 0 && !rates.some(rate => rate.currencyCode === selectedCurrency)) {
      setSelectedCurrency(defaultCurrency)
    }
  }, [rates, selectedCurrency, defaultCurrency])

  const { data: historicalData, isLoading, error, refetch } = useHistoricalRates(selectedCurrency, timeRange)

  const chartData = useMemo(() => {
    if (!historicalData) return []
    
    return historicalData.map((point, index, array) => {
      let percentChange = 0
      let absoluteChange = 0
      
      if (index > 0) {
        const previousRate = array[index - 1].rate
        absoluteChange = point.rate - previousRate
        percentChange = (absoluteChange / previousRate) * 100
      }
      
      return {
        date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: point.date,
        rate: Number(point.rate.toFixed(3)),
        percentChange: Number(percentChange.toFixed(3)),
        absoluteChange: Number(absoluteChange.toFixed(4)),
      }
    })
  }, [historicalData])

  const trendAnalysis = useMemo(() => {
    if (chartData.length < 2) return null

    const firstRate = chartData[0].rate
    const lastRate = chartData[chartData.length - 1].rate
    const change = lastRate - firstRate
    const percentChange = (change / firstRate) * 100

    const allPercentChanges = chartData
      .slice(1)
      .map(d => d.percentChange)
      .filter(pc => pc !== 0)
    
    const positiveChanges = allPercentChanges.filter(pc => pc > 0)
    const negativeChanges = allPercentChanges.filter(pc => pc < 0)
    
    const maxIncrease = allPercentChanges.length > 0 
      ? Math.max(...allPercentChanges) 
      : 0
    const maxDecrease = allPercentChanges.length > 0 
      ? Math.min(...allPercentChanges) 
      : 0
    
    const averageChange = allPercentChanges.length > 0
      ? allPercentChanges.reduce((sum, pc) => sum + pc, 0) / allPercentChanges.length
      : 0
    
    const volatility = allPercentChanges.length > 0
      ? Math.sqrt(allPercentChanges.reduce((sum, pc) => sum + Math.pow(pc - averageChange, 2), 0) / allPercentChanges.length)
      : 0

    return {
      change,
      percentChange,
      isPositive: change > 0,
      maxIncrease,
      maxDecrease,
      averageChange,
      volatility,
      positiveDays: positiveChanges.length,
      negativeDays: negativeChanges.length,
      stableDays: chartData.length - 1 - positiveChanges.length - negativeChanges.length,
    }
  }, [chartData])

  const sortedRates = useMemo(() => {
    return [...rates].sort((a, b) => a.currency.localeCompare(b.currency))
  }, [rates])

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-2xl">Currency Trend Analysis</CardTitle>
            <CardDescription className="text-base mt-1">
              Historical exchange rate movements against CZK
            </CardDescription>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="currency-select" className="text-sm font-medium">
                Currency
              </Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger id="currency-select" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortedRates.map((rate) => (
                    <SelectItem key={rate.currencyCode} value={rate.currencyCode}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{rate.currencyCode}</span>
                        <span className="text-muted-foreground">- {rate.currency}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timerange-select" className="text-sm font-medium">
                Time Range
              </Label>
              <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number(value))}>
                <SelectTrigger id="timerange-select" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="14">Last 14 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="60">Last 60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-type-select" className="text-sm font-medium">
                Chart Type
              </Label>
              <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                <SelectTrigger id="chart-type-select" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <ChartLine size={16} weight="bold" />
                      <span>Line Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <ChartBar size={16} weight="bold" />
                      <span>Bar Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center gap-2">
                      <ChartLineUp size={16} weight="bold" />
                      <span>Area Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="change">
                    <div className="flex items-center gap-2">
                      <Percent size={16} weight="bold" />
                      <span>Rate Changes</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                variant="outline"
                className="w-full h-10 gap-2"
              >
                <ArrowsClockwise 
                  size={16} 
                  weight="bold"
                  className={isLoading ? 'animate-spin' : ''}
                />
                Refresh
              </Button>
            </div>
          </div>

          {trendAnalysis && !isLoading && !error && (
            <>
              <div className={`p-4 rounded-lg border ${
                trendAnalysis.isPositive 
                  ? 'bg-accent/10 border-accent/30' 
                  : 'bg-destructive/10 border-destructive/30'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    {trendAnalysis.isPositive ? (
                      <TrendUp size={28} weight="bold" className="text-accent" />
                    ) : (
                      <TrendDown size={28} weight="bold" className="text-destructive" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {timeRange}-day trend for {selectedCurrency}
                      </p>
                      <p className="font-semibold text-xl">
                        {trendAnalysis.isPositive ? '+' : ''}{trendAnalysis.percentChange.toFixed(2)}% 
                        <span className="text-base ml-2 text-muted-foreground">
                          ({trendAnalysis.isPositive ? '+' : ''}{trendAnalysis.change.toFixed(3)} CZK)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Current Rate</p>
                    <p className="font-mono font-semibold text-xl">
                      {chartData.length > 0 ? chartData[chartData.length - 1].rate.toFixed(3) : '—'} CZK
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3 bg-accent/5 border-accent/20">
                  <div className="text-xs text-muted-foreground mb-1">Max Increase</div>
                  <div className="flex items-baseline gap-1">
                    <TrendUp size={16} weight="bold" className="text-accent" />
                    <span className="font-semibold text-accent text-lg">
                      +{trendAnalysis.maxIncrease.toFixed(2)}%
                    </span>
                  </div>
                </Card>

                <Card className="p-3 bg-destructive/5 border-destructive/20">
                  <div className="text-xs text-muted-foreground mb-1">Max Decrease</div>
                  <div className="flex items-baseline gap-1">
                    <TrendDown size={16} weight="bold" className="text-destructive" />
                    <span className="font-semibold text-destructive text-lg">
                      {trendAnalysis.maxDecrease.toFixed(2)}%
                    </span>
                  </div>
                </Card>

                <Card className="p-3 bg-muted/50 border-border">
                  <div className="text-xs text-muted-foreground mb-1">Avg Daily Change</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-semibold text-lg ${
                      trendAnalysis.averageChange > 0 
                        ? 'text-accent' 
                        : trendAnalysis.averageChange < 0 
                        ? 'text-destructive' 
                        : 'text-foreground'
                    }`}>
                      {trendAnalysis.averageChange > 0 ? '+' : ''}{trendAnalysis.averageChange.toFixed(3)}%
                    </span>
                  </div>
                </Card>

                <Card className="p-3 bg-muted/50 border-border">
                  <div className="text-xs text-muted-foreground mb-1">Volatility</div>
                  <div className="font-semibold text-lg">
                    {trendAnalysis.volatility.toFixed(3)}%
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <Warning size={20} weight="fill" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <div className="font-medium whitespace-pre-line">{error}</div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="gap-2"
                  >
                    <ArrowsClockwise size={14} weight="bold" />
                    Try Again
                  </Button>
                  {timeRange > 7 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimeRange(7)}
                    >
                      Try 7 Days
                    </Button>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <ArrowsClockwise size={48} weight="bold" className="text-primary animate-spin" />
              <div className="text-center">
                <p className="text-lg font-medium mb-1">Loading Historical Data</p>
                <p className="text-sm text-muted-foreground">
                  Fetching {timeRange} days of {selectedCurrency} exchange rates...
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && chartData.length > 0 && (
          <div className="w-full">
            <ResponsiveContainer width="100%" height={400}>
              <>
                {chartType === 'line' && (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={['auto', 'auto']} tickFormatter={(value) => value.toFixed(2)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: number) => [`${value.toFixed(3)} CZK`, 'Rate']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2.5} name={`${selectedCurrency} / CZK`} />
                  </LineChart>
                )}
                
                {chartType === 'bar' && (
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={['auto', 'auto']} tickFormatter={(value) => value.toFixed(2)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: number) => [`${value.toFixed(3)} CZK`, 'Rate']}
                    />
                    <Bar dataKey="rate" fill="hsl(var(--primary))" name={`${selectedCurrency} / CZK`} />
                  </BarChart>
                )}

                {chartType === 'area' && (
                   <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={['auto', 'auto']} tickFormatter={(value) => value.toFixed(2)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: number) => [`${value.toFixed(3)} CZK`, 'Rate']}
                    />
                    <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="url(#colorRate)" name={`${selectedCurrency} / CZK`} />
                  </AreaChart>
                )}

                {chartType === 'change' && (
                  <ComposedChart data={chartData.slice(1)} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tickFormatter={(value) => `${value.toFixed(2)}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                    <Bar dataKey="percentChange" name="Daily % Change">
                      {chartData.slice(1).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.percentChange > 0 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'} />
                      ))}
                    </Bar>
                  </ComposedChart>
                )}
              </>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}