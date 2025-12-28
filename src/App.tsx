import { useState } from 'react'
import { useExchangeRates } from '@/hooks/use-exchange-rates'
import { ExchangeRateTable } from '@/components/ExchangeRateTable'
import { ExchangeRateTableSkeleton } from '@/components/ExchangeRateTableSkeleton'
import { CurrencyConverter } from '@/components/CurrencyConverter'
import { CurrencyTrendChart } from '@/components/CurrencyTrendChart'
import { ExportMenu } from '@/components/ExportMenu'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowsClockwise, Bank, Warning } from '@phosphor-icons/react'
import { formatDate } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function App() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const { data, isLoading, error, refetch } = useExchangeRates(selectedDate)

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Fetching exchange rates...',
      success: 'Exchange rates updated successfully',
      error: 'Failed to fetch exchange rates',
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
              {!isLoading && !error && data && (
                <ExportMenu data={data} variant="outline" size="lg" />
              )}
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                size="lg"
                className="gap-2"
              >
                <ArrowsClockwise 
                  size={18} 
                  weight="bold"
                  className={isLoading ? 'animate-spin' : ''}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

{!isLoading && !error && data && (
          <div className="mb-8">
            <CurrencyConverter rates={data.rates} />
          </div>
        )}

        {!isLoading && !error && data && (
          <div className="mb-8">
            <CurrencyTrendChart rates={data.rates} />
          </div>
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
                    {data.rates.length} currencies
                  </div>
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
              <ExchangeRateTable rates={data.rates} />
            )}
          </CardContent>
        </Card>

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