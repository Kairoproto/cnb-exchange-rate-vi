import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AccuracyReportExport } from '@/components/AccuracyReportExport'
import { 
  FilePdf, 
  ChartBar, 
  ListChecks, 
  Lightbulb,
  Info,
  CheckCircle,
  Target
} from '@phosphor-icons/react'
import { HistoricalPrediction } from '@/hooks/use-prediction-history'
import { calculateAnalytics } from '@/lib/pdf-report-generator'

interface ReportPreviewProps {
  history: HistoricalPrediction[]
}

export function ReportPreview({ history }: ReportPreviewProps) {
  const analytics = calculateAnalytics(history)

  if (!analytics) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <FilePdf size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">PDF Report Generator</CardTitle>
              <CardDescription className="text-base mt-1">
                Generate comprehensive accuracy analytics reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
              <FilePdf size={32} weight="duotone" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Report Data Available</h3>
            <p className="text-muted-foreground">
              Generate predictions and wait for actual rates to compare before creating reports.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <FilePdf size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">PDF Report Generator</CardTitle>
              <CardDescription className="text-base mt-1">
                Professional analytics report with charts and insights
              </CardDescription>
            </div>
          </div>
          <AccuracyReportExport history={history} variant="default" size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-accent/50 bg-accent/5">
          <Info size={20} weight="fill" className="text-accent" />
          <AlertTitle>Ready to Export</AlertTitle>
          <AlertDescription>
            Your accuracy analytics report includes {analytics.totalPredictions} predictions 
            across {analytics.currencyStats.length} currencies with {analytics.totalDataPoints} data points.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                <Target size={20} weight="duotone" className="text-accent" />
              </div>
              <div className="text-3xl font-bold text-accent">
                {analytics.overallAccuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Average across all predictions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Total Predictions</div>
                <ChartBar size={20} weight="duotone" className="text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">
                {analytics.totalPredictions}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analytics.currencyStats.length} currencies analyzed
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
                {analytics.currencyStats[0]?.currency || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analytics.currencyStats[0]?.avgAccuracy.toFixed(1)}% accuracy
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks size={20} weight="duotone" />
              Report Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle size={16} weight="fill" className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Key Metrics Dashboard</div>
                  <div className="text-xs text-muted-foreground">
                    Overall accuracy, prediction counts, and best performers
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle size={16} weight="fill" className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Performance Insights</div>
                  <div className="text-xs text-muted-foreground">
                    AI-generated analysis and recommendations
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle size={16} weight="fill" className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Accuracy Trend Charts</div>
                  <div className="text-xs text-muted-foreground">
                    Visual timeline of prediction accuracy over time
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle size={16} weight="fill" className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Currency Performance</div>
                  <div className="text-xs text-muted-foreground">
                    Ranked bar charts showing top currencies
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle size={16} weight="fill" className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Trend Analysis</div>
                  <div className="text-xs text-muted-foreground">
                    Accuracy breakdown by bullish, bearish, and stable trends
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle size={16} weight="fill" className="text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Detailed Statistics</div>
                  <div className="text-xs text-muted-foreground">
                    Complete data tables with rankings and metrics
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb size={20} weight="duotone" className="text-accent" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
              <span className="text-sm font-medium">Format</span>
              <Badge variant="outline">PDF Document</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
              <span className="text-sm font-medium">Pages</span>
              <Badge variant="outline">
                {analytics.currencyStats.length > 10 ? '4-6 pages' : '3-4 pages'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background/80 rounded-lg">
              <span className="text-sm font-medium">File Size</span>
              <Badge variant="outline">~200-500 KB</Badge>
            </div>

            {analytics.isImproving && (
              <Alert className="border-accent/30 bg-accent/5">
                <Lightbulb size={16} weight="fill" className="text-accent" />
                <AlertDescription className="text-xs">
                  Your report will highlight that prediction accuracy is improving by{' '}
                  {((analytics.recentTrend || 0) - analytics.overallAccuracy).toFixed(1)}%!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center pt-2">
          <AccuracyReportExport history={history} variant="outline" size="lg" />
        </div>
      </CardContent>
    </Card>
  )
}
