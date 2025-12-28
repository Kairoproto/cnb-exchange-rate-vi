import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain, TrendUp, TrendDown, ArrowsClockwise } from '@phosphor-icons/react'
import { ExchangeRate } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface AiCurrencyPredictionsProps {
  rates: ExchangeRate[]
  date: string
}

interface DayPrediction {
  day: string
  date: string
  predicted: number
  confidence: 'high' | 'medium' | 'low'
}

interface PredictionResult {
  currency: string
  currentRate: number
  predictions: DayPrediction[]
  overallTrend: 'bullish' | 'bearish' | 'stable'
  analysis: string
  weekChange: number
}

export function AiCurrencyPredictions({ rates }: AiCurrencyPredictionsProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD']
  const sortedRates = [...rates].sort((a, b) => {
    const aIndex = popularCurrencies.indexOf(a.currencyCode)
    const bIndex = popularCurrencies.indexOf(b.currencyCode)
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.currencyCode.localeCompare(b.currencyCode)
  })

  const generatePredictions = async () => {
    if (!selectedCurrency) return

    setIsGenerating(true)
    setError(null)

    try {
      const selectedRate = rates.find(r => r.currencyCode === selectedCurrency)
      if (!selectedRate) {
        throw new Error('Currency not found')
      }

      const today = new Date()
      const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() + i + 1)
        return {
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dateStr: date.toISOString().split('T')[0],
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      })

      const daysList = nextSevenDays.map(d => `${d.dayName} (${d.fullDate})`).join(', ')

      const nearbyRates = rates.slice(0, 15).map(r => ({
        code: r.currencyCode,
        rate: r.rate,
        amount: r.amount
      }))

      const promptText = `You are an expert forex analyst with deep knowledge of currency markets and technical analysis. 

Current Market Context:
- Currency: ${selectedRate.currencyCode} (${selectedRate.currency})
- Current Rate: ${selectedRate.rate} CZK per ${selectedRate.amount} ${selectedRate.currencyCode}
- Country: ${selectedRate.country}

Other Major Currencies (for context):
${JSON.stringify(nearbyRates, null, 2)}

Task: Generate realistic 7-day predictions for ${selectedRate.currencyCode}/CZK exchange rate.

For the next 7 days (${daysList}), predict the exchange rate based on:
- Current rate trends and patterns
- Typical forex volatility (usually 0.1% - 0.5% daily change)
- Market sentiment and economic factors
- Currency strength indicators

Return your predictions as a valid JSON object with a single property "prediction" containing:
- currency: "${selectedRate.currencyCode}"
- currentRate: ${selectedRate.rate}
- predictions: array of 7 objects with:
  * day: day name (Mon, Tue, Wed, etc)
  * date: ISO date string (YYYY-MM-DD)
  * predicted: predicted rate (number with 3 decimals)
  * confidence: "high" | "medium" | "low"
- overallTrend: "bullish" | "bearish" | "stable" (based on week-end vs current)
- analysis: 2-3 sentence explanation of the prediction reasoning
- weekChange: percentage change from current to day 7 (positive or negative number)

Ensure predictions are realistic with small daily variations (typically 0.1-0.5%).

Example format:
{
  "prediction": {
    "currency": "USD",
    "currentRate": 23.456,
    "predictions": [
      {"day": "Mon", "date": "2024-01-15", "predicted": 23.478, "confidence": "high"},
      {"day": "Tue", "date": "2024-01-16", "predicted": 23.465, "confidence": "high"}
    ],
    "overallTrend": "stable",
    "analysis": "USD/CZK expected to remain stable with minor fluctuations. Strong US economic data supports dollar, but Czech central bank policy provides counterbalance.",
    "weekChange": 0.23
  }
}`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const data = JSON.parse(response)

      if (data.prediction && data.prediction.predictions && Array.isArray(data.prediction.predictions)) {
        const predictionData = data.prediction
        
        const formattedPredictions = nextSevenDays.map((day, idx) => {
          const pred = predictionData.predictions[idx]
          return {
            day: day.dayName,
            date: day.dateStr,
            predicted: pred?.predicted || predictionData.currentRate,
            confidence: pred?.confidence || 'medium'
          }
        })

        setPrediction({
          ...predictionData,
          predictions: formattedPredictions
        })
      } else {
        throw new Error('Invalid prediction format')
      }
    } catch (err) {
      console.error('AI Prediction error:', err)
      setError('Failed to generate predictions. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getChartData = () => {
    if (!prediction) return []

    const data: Array<{ day: string; rate: number; type: string; confidence?: string }> = [
      {
        day: 'Today',
        rate: prediction.currentRate,
        type: 'current'
      }
    ]

    prediction.predictions.forEach((pred) => {
      data.push({
        day: pred.day,
        rate: pred.predicted,
        type: 'predicted',
        confidence: pred.confidence
      })
    })

    return data
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return 'text-accent'
      case 'bearish':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendUp size={20} weight="duotone" className="text-accent" />
      case 'bearish':
        return <TrendDown size={20} weight="duotone" className="text-destructive" />
      default:
        return <ArrowsClockwise size={20} weight="duotone" className="text-muted-foreground" />
    }
  }

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'medium':
        return 'bg-primary/20 text-primary border-primary/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Brain size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Currency Predictions</CardTitle>
              <CardDescription className="text-base mt-1">
                7-day forecast powered by advanced AI models
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="currency-select" className="text-base mb-2 block">
              Select Currency
            </Label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger id="currency-select" className="h-12 text-base">
                <SelectValue placeholder="Choose a currency..." />
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
          <div className="flex items-end">
            <Button
              onClick={generatePredictions}
              disabled={!selectedCurrency || isGenerating}
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <Brain size={18} weight="bold" className={isGenerating ? 'animate-pulse' : ''} />
              {isGenerating ? 'Analyzing...' : 'Generate Forecast'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        )}

        {!isGenerating && !prediction && !error && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
              <Brain size={32} weight="duotone" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Select a currency and click "Generate Forecast" to see AI-powered predictions
            </p>
          </div>
        )}

        {!isGenerating && prediction && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Current Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">
                    {prediction.currentRate.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    CZK per {rates.find(r => r.currencyCode === prediction.currency)?.amount || 1} {prediction.currency}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>7-Day Forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(prediction.overallTrend)}
                    <div className="text-2xl font-bold font-mono capitalize">
                      {prediction.overallTrend}
                    </div>
                  </div>
                  <div className={`text-sm mt-1 ${getTrendColor(prediction.overallTrend)}`}>
                    {prediction.weekChange > 0 ? '+' : ''}{prediction.weekChange.toFixed(2)}% change
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Day 7 Prediction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">
                    {prediction.predictions[6]?.predicted.toFixed(3) || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {prediction.predictions[6]?.day} forecast
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground">
                  {prediction.analysis}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">7-Day Forecast Chart</CardTitle>
                <CardDescription>
                  Predicted rates for the next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                      domain={['dataMin - 0.1', 'dataMax + 0.1']}
                      tickFormatter={(value) => value.toFixed(2)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value.toFixed(3), 'Rate']}
                    />
                    <Legend />
                    <ReferenceLine 
                      y={prediction.currentRate} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                      label={{ value: 'Current', position: 'right' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                      name={`${prediction.currency}/CZK`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Predictions</CardTitle>
                <CardDescription>
                  Detailed forecast for each day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prediction.predictions.map((pred, idx) => {
                    const change = ((pred.predicted - prediction.currentRate) / prediction.currentRate) * 100
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-muted-foreground min-w-[60px]">
                            {pred.day}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`text-xs px-2 py-1 rounded-full border ${getConfidenceBadgeColor(pred.confidence)}`}>
                            {pred.confidence}
                          </div>
                          <div className="font-mono font-semibold text-base min-w-[80px] text-right">
                            {pred.predicted.toFixed(3)}
                          </div>
                          <div className={`text-sm font-medium min-w-[60px] text-right ${change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
