import { useState } from 'react'
import { useExchangeRates } from '@/hooks/use-exchange-rates'
import { useComparisonRates } from '@/hooks/use-comparison-rates'
import { useFavorites } from '@/hooks/use-favorites'
import { useAutoUpdatePredictionHistory } from '@/hooks/use-auto-update-prediction-history'
import { usePredictionHistory } from '@/hooks/use-prediction-history'
import { ExchangeRateTable } from '@/components/ExchangeRateTable'
import { ExchangeRateTableSkeleton } from '@/components/ExchangeRateTableSkeleton'
import { CurrencyConverter } from '@/components/CurrencyConverter'
import { CurrencyTrendChart } from '@/components/CurrencyTrendChart'
import { ComparisonDateSelector } from '@/components/ComparisonDateSelector'
import { ComparisonTemplates } from '@/components/ComparisonTemplates'
import { CustomTemplateBuilder } from '@/components/CustomTemplateBuilder'
import { RateComparisonTable } from '@/components/RateComparisonTable'
import { ComparisonReportExport } from '@/components/ComparisonReportExport'
import { ExportMenu } from '@/components/ExportMenu'
import { QuickStats } from '@/components/QuickStats'
import { MultiCurrencyConverter } from '@/components/MultiCurrencyConverter'
import { RateAlerts } from '@/components/RateAlerts'
import { AiInsights } from '@/components/AiInsights'
import { AiChatAssistant } from '@/components/AiChatAssistant'
import { AiReportGenerator } from '@/components/AiReportGenerator'
import { AiCurrencyPredictions } from '@/components/AiCurrencyPredictions'
import { PredictionHistoryViewer } from '@/components/PredictionHistoryViewer'
import { AccuracyTrendAnalytics } from '@/components/AccuracyTrendAnalytics'
import { ReportPreview } from '@/components/ReportPreview'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowsClockwise, Bank, Warning, ChartLine, CalendarCheck, Star, ChartPieSlice, Bell, Sparkle, ClockCounterClockwise } from '@phosphor-icons/react'
import { formatDate } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

type ViewMode = 'current' | 'comparison' | 'analytics' | 'ai' | 'history'

function App() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<ViewMode>('current')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { data, isLoading, error, refetch } = useExchangeRates(selectedDate)
  const comparison = useComparisonRates()
  const { favorites, clearFavorites } = useFavorites()
  const { history: predictionHistory } = usePredictionHistory()

  useAutoUpdatePredictionHistory(data?.rates)

  const handleRefresh = async () => {
    if (viewMode === 'current' || viewMode === 'analytics' || viewMode === 'ai') {
      toast.promise(refetch(), {
        loading: 'Fetching exchange rates...',
        success: 'Exchange rates updated successfully',
        error: 'Failed to fetch exchange rates',
      })
    } else if (viewMode === 'comparison') {
      toast.promise(comparison.refetchAll(), {
        loading: 'Refreshing comparison data...',
        success: 'Comparison data updated successfully',
        error: 'Failed to refresh comparison data',
      })
    }
  }

  const handleAddComparisonDate = async (date: string) => {
    toast.promise(comparison.addDate(date), {
      loading: 'Fetching data for selected date...',
      success: 'Date added to comparison',
      error: (err) => err || 'Failed to add date',
    })
  }

  const handleApplyTemplate = async (dates: string[]) => {
    comparison.clear()
    
    const promises = dates.map(date => comparison.addDate(date))
    
    toast.promise(Promise.all(promises), {
      loading: `Loading template with ${dates.length} dates...`,
      success: `Template applied successfully! ${dates.length} dates loaded.`,
      error: 'Failed to apply template. Some dates may not have loaded.',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl">
                <Bank size={32} weight="fill" className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  CNB Exchange Rates
                </h1>
                <p className="text-muted-foreground text-sm">
                  Czech National Bank Official Rates
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(viewMode === 'current' || viewMode === 'analytics' || viewMode === 'ai') && !isLoading && !error && data && (
                <ExportMenu data={data} variant="outline" size="lg" />
              )}
              {viewMode !== 'history' && (
                <Button
                  onClick={handleRefresh}
                  disabled={(viewMode === 'current' || viewMode === 'analytics' || viewMode === 'ai') && isLoading || (viewMode === 'comparison' && comparison.isLoading)}
                  size="lg"
                  className="gap-2"
                >
                  <ArrowsClockwise 
                    size={18} 
                    weight="bold"
                    className={((viewMode === 'current' || viewMode === 'analytics' || viewMode === 'ai') && isLoading) || (viewMode === 'comparison' && comparison.isLoading) ? 'animate-spin' : ''}
                  />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
            <TabsList className="grid w-full max-w-4xl grid-cols-5 h-12">
              <TabsTrigger value="current" className="gap-2 text-base">
                <ChartLine size={20} weight="duotone" />
                Current Rates
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2 text-base">
                <CalendarCheck size={20} weight="duotone" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 text-base">
                <ChartPieSlice size={20} weight="duotone" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2 text-base">
                <Sparkle size={20} weight="duotone" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 text-base">
                <ClockCounterClockwise size={20} weight="duotone" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-8 mt-8">
              {!isLoading && !error && data && (
                <QuickStats rates={data.rates} />
              )}

              {!isLoading && !error && data && (
                <CurrencyConverter rates={data.rates} />
              )}

              {!isLoading && !error && data && (
                <CurrencyTrendChart rates={data.rates} />
              )}

              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-2xl">Current Exchange Rates</CardTitle>
                      {data && (
                        <CardDescription className="text-base mt-1">
                          Valid for: <span className="font-semibold text-foreground">{formatDate(data.date)}</span>
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {data && (
                        <div className="text-sm text-muted-foreground">
                          {showFavoritesOnly 
                            ? `${(favorites || []).length} favorite${(favorites || []).length !== 1 ? 's' : ''}`
                            : `${data.rates.length} currencies`
                          }
                        </div>
                      )}
                      {(favorites || []).length > 0 && (
                        <Button
                          variant={showFavoritesOnly ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                          className="gap-2"
                        >
                          <Star size={16} weight={showFavoritesOnly ? "fill" : "regular"} />
                          {showFavoritesOnly ? 'Show All' : 'Watchlist'}
                        </Button>
                      )}
                      {data && (
                        <ExportMenu data={data} variant="ghost" size="sm" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <Warning size={20} weight="fill" />
                      <AlertTitle>Error Loading Exchange Rates</AlertTitle>
                      <AlertDescription className="mt-2">
                        {error}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          className="mt-3"
                        >
                          Try Again
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {isLoading && <ExchangeRateTableSkeleton />}

                  {!isLoading && !error && data && (
                    <>
                      {showFavoritesOnly && (favorites || []).length === 0 ? (
                        <div className="text-center py-12">
                          <Star size={48} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Click the star icon next to any currency to add it to your watchlist
                          </p>
                          <Button variant="outline" onClick={() => setShowFavoritesOnly(false)}>
                            View All Currencies
                          </Button>
                        </div>
                      ) : (
                        <ExchangeRateTable rates={data.rates} showFavoritesOnly={showFavoritesOnly} />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-8 mt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Multi-Period Comparison</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Compare exchange rates across different time periods
                  </p>
                </div>
                {comparison.comparisons.length > 0 && (
                  <ComparisonReportExport 
                    comparisons={comparison.comparisons}
                    variant="default"
                    size="lg"
                  />
                )}
              </div>

              <ComparisonTemplates 
                onApplyTemplate={handleApplyTemplate}
                isLoading={comparison.isLoading}
              />

              <CustomTemplateBuilder
                onApplyTemplate={handleApplyTemplate}
                isLoading={comparison.isLoading}
              />

              <ComparisonDateSelector
                selectedDates={comparison.comparisons.map(c => c.date)}
                onAddDate={handleAddComparisonDate}
                onRemoveDate={comparison.removeDate}
                onClear={comparison.clear}
                isLoading={comparison.isLoading}
                error={comparison.error}
              />

              <RateComparisonTable
                comparisons={comparison.comparisons}
                onRemoveDate={comparison.removeDate}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8 mt-8">
              {!isLoading && !error && data && (
                <>
                  <QuickStats rates={data.rates} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MultiCurrencyConverter rates={data.rates} />
                    <RateAlerts rates={data.rates} />
                  </div>

                  <CurrencyTrendChart rates={data.rates} />
                </>
              )}

              {isLoading && (
                <div className="space-y-6">
                  <ExchangeRateTableSkeleton />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <Warning size={20} weight="fill" />
                  <AlertTitle>Error Loading Data</AlertTitle>
                  <AlertDescription className="mt-2">
                    {error}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-3"
                    >
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-8 mt-8">
              {!isLoading && !error && data && (
                <>
                  <AiInsights rates={data.rates} date={data.date} />
                  
                  <AiCurrencyPredictions rates={data.rates} date={data.date} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AiChatAssistant rates={data.rates} date={data.date} />
                    <AiReportGenerator rates={data.rates} date={data.date} />
                  </div>
                </>
              )}

              {isLoading && (
                <div className="space-y-6">
                  <ExchangeRateTableSkeleton />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <Warning size={20} weight="fill" />
                  <AlertTitle>Error Loading Data</AlertTitle>
                  <AlertDescription className="mt-2">
                    {error}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-3"
                    >
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-8 mt-8">
              {data && (
                <>
                  <ReportPreview history={predictionHistory} />
                  
                  <AccuracyTrendAnalytics history={predictionHistory} />
                  
                  <PredictionHistoryViewer 
                    currencies={data.rates.map(r => r.currencyCode).filter((v, i, a) => a.indexOf(v) === i)}
                  />
                </>
              )}
              {!data && isLoading && (
                <ExchangeRateTableSkeleton />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Data provided by the{' '}
            <a
              href="https://www.cnb.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Czech National Bank
            </a>
          </p>
          <p className="mt-1">
            Exchange rates are updated daily by CNB
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App