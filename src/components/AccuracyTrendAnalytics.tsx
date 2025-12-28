import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AccuracyReportExport } from '@/components/AccuracyReportExport'
import { 
  ChartLine, 
  Target,
  TrendUp,
  TrendDown,
  CheckCircle,
  Info
} from '@phosphor-icons/react'
import { HistoricalPrediction } from '@/hooks/use-prediction-history'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface AccuracyTrendAnalyticsProps {
  history: HistoricalPrediction[]
}

export function AccuracyTrendAnalytics({ history }: AccuracyTrendAnalyticsProps) {
  const analytics = useMemo(() => {
    const predictionsWithData = history.filter(pred => 
      pred.predictions.some(p => p.actualRate !== undefined)
    )

    if (predictionsWithData.length === 0) {
      return null
    }

    const accuracyOverTime = predictionsWithData.map(pred => {
      const withActual = pred.predictions.filter(p => p.actualRate !== undefined)
      
      if (withActual.length === 0) return null

      const totalError = withActual.reduce((sum, p) => {
        const error = Math.abs(p.predicted - (p.actualRate || 0)) / (p.actualRate || 1)
        return sum + error
      }, 0)

      const accuracy = (1 - (totalError / withActual.length)) * 100
      const finalAccuracy = Math.max(0, Math.min(100, accuracy))

      const avgVariance = withActual.reduce((sum, p) => {
        return sum + Math.abs(p.predicted - (p.actualRate || 0))
      }, 0) / withActual.length

      return {
        id: pred.id,
        currency: pred.currency,
        date: new Date(pred.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: pred.createdAt,
        accuracy: finalAccuracy,
        avgVariance,
        trend: pred.overallTrend,
        dataPoints: withActual.length,
      }
    }).filter(Boolean)

    const currencyAccuracy = predictionsWithData.reduce((acc, pred) => {
      const withActual = pred.predictions.filter(p => p.actualRate !== undefined)
      
      if (withActual.length === 0) return acc

      const totalError = withActual.reduce((sum, p) => {
        const error = Math.abs(p.predicted - (p.actualRate || 0)) / (p.actualRate || 1)
        return sum + error
      }, 0)

      const accuracy = (1 - (totalError / withActual.length)) * 100
      const finalAccuracy = Math.max(0, Math.min(100, accuracy))

      if (!acc[pred.currency]) {
        acc[pred.currency] = { count: 0, totalAccuracy: 0, accuracies: [] }
      }
      
      acc[pred.currency].count++
      acc[pred.currency].totalAccuracy += finalAccuracy
      acc[pred.currency].accuracies.push(finalAccuracy)
      
      return acc
    }, {} as Record<string, { count: number; totalAccuracy: number; accuracies: number[] }>)

    const currencyStats = Object.entries(currencyAccuracy).map(([currency, stats]) => ({
      currency,
      avgAccuracy: stats.totalAccuracy / stats.count,
      predictions: stats.count,
      bestAccuracy: Math.max(...stats.accuracies),
      worstAccuracy: Math.min(...stats.accuracies),
      consistency: 100 - (Math.max(...stats.accuracies) - Math.min(...stats.accuracies)),
    })).sort((a, b) => b.avgAccuracy - a.avgAccuracy)

    const overallAccuracy = accuracyOverTime.reduce((sum, item) => sum + (item?.accuracy || 0), 0) / accuracyOverTime.length

    const trendAccuracy = predictionsWithData.reduce((acc, pred) => {
      const withActual = pred.predictions.filter(p => p.actualRate !== undefined)
      
      if (withActual.length === 0) return acc

      const totalError = withActual.reduce((sum, p) => {
        const error = Math.abs(p.predicted - (p.actualRate || 0)) / (p.actualRate || 1)
        return sum + error
      }, 0)

      const accuracy = (1 - (totalError / withActual.length)) * 100
      const finalAccuracy = Math.max(0, Math.min(100, accuracy))

      if (!acc[pred.overallTrend]) {
        acc[pred.overallTrend] = { count: 0, totalAccuracy: 0 }
      }
      
      acc[pred.overallTrend].count++
      acc[pred.overallTrend].totalAccuracy += finalAccuracy
      
      return acc
    }, {} as Record<string, { count: number; totalAccuracy: number }>)

    const trendStats = Object.entries(trendAccuracy).map(([trend, stats]) => ({
      trend,
      avgAccuracy: stats.totalAccuracy / stats.count,
      predictions: stats.count,
    })).sort((a, b) => b.avgAccuracy - a.avgAccuracy)

    const recentTrend = accuracyOverTime.length >= 3
      ? accuracyOverTime.slice(-3).reduce((sum, item) => sum + (item?.accuracy || 0), 0) / 3
      : null

    const isImproving = recentTrend && accuracyOverTime.length >= 6
      ? recentTrend > (accuracyOverTime.slice(0, 3).reduce((sum, item) => sum + (item?.accuracy || 0), 0) / 3)
      : null

    return {
      accuracyOverTime,
      currencyStats,
      overallAccuracy,
      trendStats,
      totalPredictions: predictionsWithData.length,
      totalDataPoints: predictionsWithData.reduce((sum, pred) => 
        sum + pred.predictions.filter(p => p.actualRate !== undefined).length, 0
      ),
      recentTrend,
      isImproving,
    }
  }, [history])

  if (!analytics) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <ChartLine size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Accuracy Trend Analytics</CardTitle>
              <CardDescription className="text-base mt-1">
                Track prediction performance over time
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
              <Target size={32} weight="duotone" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Performance Data Yet</h3>
            <p className="text-muted-foreground">
              Accuracy trends will appear once predictions have actual rates to compare against.
              Generate predictions and check back after a few days.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { 
    accuracyOverTime, 
    currencyStats, 
    overallAccuracy, 
    trendStats, 
    totalPredictions,
    totalDataPoints,
    recentTrend,
    isImproving 
  } = analytics

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <ChartLine size={24} weight="duotone" className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Accuracy Trend Analytics</CardTitle>
                <CardDescription className="text-base mt-1">
                  Performance metrics across {totalPredictions} predictions
                </CardDescription>
              </div>
            </div>
            <AccuracyReportExport history={history} variant="default" size="lg" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                  <Target size={20} weight="duotone" className="text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">
                  {overallAccuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalDataPoints} data points analyzed
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Total Predictions</div>
                  <ChartLine size={20} weight="duotone" className="text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">
                  {totalPredictions}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Across {currencyStats.length} currencies
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Best Currency</div>
                  <CheckCircle size={20} weight="duotone" className="text-primary" />
                </div>
                <div className="text-2xl font-bold font-mono">
                  {currencyStats[0]?.currency || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {currencyStats[0] ? `${currencyStats[0].avgAccuracy.toFixed(1)}% accuracy` : 'No data'}
                </div>
              </CardContent>
            </Card>

            {recentTrend !== null && isImproving !== null && (
              <Card className={`bg-gradient-to-br ${isImproving ? 'from-accent/10 to-accent/5' : 'from-muted to-muted/50'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Recent Trend</div>
                    {isImproving ? (
                      <TrendUp size={20} weight="duotone" className="text-accent" />
                    ) : (
                      <TrendDown size={20} weight="duotone" className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-3xl font-bold">
                    {recentTrend.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last 3 predictions
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {isImproving !== null && (
            <Alert className={isImproving ? 'border-accent/50 bg-accent/5' : ''}>
              <Info size={20} weight="fill" className={isImproving ? 'text-accent' : ''} />
              <AlertTitle>Performance Insight</AlertTitle>
              <AlertDescription>
                {isImproving 
                  ? `Your prediction accuracy is improving! Recent predictions are ${((recentTrend || 0) - overallAccuracy).toFixed(1)}% more accurate than earlier ones.`
                  : `Consider analyzing what factors contribute to more accurate predictions to improve future forecasts.`
                }
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accuracy Over Time</CardTitle>
              <CardDescription>How prediction accuracy has evolved</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={accuracyOverTime}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'accuracy') return [`${value.toFixed(1)}%`, 'Accuracy']
                      return [value, name]
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload
                        return `${data.currency} - ${label}`
                      }
                      return label
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    fill="url(#accuracyGradient)"
                    name="Accuracy"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accuracy by Currency</CardTitle>
                <CardDescription>Performance across different currencies</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currencyStats.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="currency" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Avg Accuracy']}
                    />
                    <Bar
                      dataKey="avgAccuracy"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accuracy by Trend Type</CardTitle>
                <CardDescription>Performance for bullish, bearish, and stable predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendStats.map((stat) => (
                    <div key={stat.trend} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {stat.trend}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {stat.predictions} prediction{stat.predictions !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="font-bold">
                          {stat.avgAccuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${stat.avgAccuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Currency Performance Details</CardTitle>
              <CardDescription>Detailed accuracy metrics for each currency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currencyStats.map((stat, idx) => (
                  <div
                    key={stat.currency}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-mono font-bold text-lg">{stat.currency}</div>
                        <div className="text-sm text-muted-foreground">
                          {stat.predictions} prediction{stat.predictions !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Avg Accuracy</div>
                        <div className="text-xl font-bold text-accent">
                          {stat.avgAccuracy.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Best</div>
                        <div className="text-sm font-semibold text-primary">
                          {stat.bestAccuracy.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Consistency</div>
                        <div className="text-sm font-semibold">
                          {stat.consistency.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
