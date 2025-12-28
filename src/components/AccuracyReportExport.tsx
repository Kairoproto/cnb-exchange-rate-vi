import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FilePdf, Download, Gear } from '@phosphor-icons/react'
import { AccuracyReportGenerator, calculateAnalytics } from '@/lib/pdf-report-generator'
import { HistoricalPrediction } from '@/hooks/use-prediction-history'
import { toast } from 'sonner'

interface AccuracyReportExportProps {
  history: HistoricalPrediction[]
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function AccuracyReportExport({ 
  history, 
  variant = 'default',
  size = 'default' 
}: AccuracyReportExportProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeDetailedStats, setIncludeDetailedStats] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const analytics = calculateAnalytics(history)

  if (!analytics) {
    return null
  }

  const handleQuickExport = async () => {
    setIsExporting(true)
    try {
      const generator = new AccuracyReportGenerator()
      await generator.downloadReport(analytics, undefined, {
        includeCharts: true,
        includeDetailedStats: true,
      })
      toast.success('PDF report downloaded successfully')
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      toast.error('Failed to generate PDF report')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCustomExport = async () => {
    setIsExporting(true)
    setShowOptions(false)
    try {
      const generator = new AccuracyReportGenerator()
      await generator.downloadReport(analytics, undefined, {
        includeCharts,
        includeDetailedStats,
      })
      toast.success('PDF report downloaded successfully')
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      toast.error('Failed to generate PDF report')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className="gap-2"
            disabled={isExporting}
          >
            <FilePdf size={18} weight="duotone" />
            {isExporting ? 'Generating...' : 'Export Report'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleQuickExport} disabled={isExporting}>
            <Download size={16} className="mr-2" weight="duotone" />
            Quick Export (Full Report)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowOptions(true)} disabled={isExporting}>
            <Gear size={16} className="mr-2" weight="duotone" />
            Custom Export Options
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilePdf size={24} weight="duotone" className="text-primary" />
              Custom Report Options
            </DialogTitle>
            <DialogDescription>
              Choose what to include in your accuracy analytics PDF report
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="include-charts" className="text-base font-semibold">
                  Include Charts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Visual representations of accuracy trends and currency performance
                </p>
              </div>
              <Switch
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={setIncludeCharts}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="include-stats" className="text-base font-semibold">
                  Detailed Statistics
                </Label>
                <p className="text-sm text-muted-foreground">
                  Complete breakdown of currency performance with rankings
                </p>
              </div>
              <Switch
                id="include-stats"
                checked={includeDetailedStats}
                onCheckedChange={setIncludeDetailedStats}
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="text-sm font-semibold mb-2">Report Will Include:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Key performance metrics</li>
                <li>✓ Performance insights</li>
                {includeCharts && <li>✓ Accuracy trend charts</li>}
                {includeCharts && <li>✓ Currency performance visualizations</li>}
                <li>✓ Trend accuracy breakdown</li>
                {includeDetailedStats && <li>✓ Detailed currency statistics</li>}
                <li>✓ Summary and recommendations</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowOptions(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCustomExport}
              disabled={isExporting}
              className="gap-2"
            >
              <FilePdf size={18} weight="duotone" />
              {isExporting ? 'Generating...' : 'Generate PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
