import { ExchangeRateData } from '@/lib/types'
import { exportToCSV, exportToJSON, exportToPDF } from '@/lib/export'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DownloadSimple, FileCsv, FileJs, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ExportMenuProps {
  data: ExchangeRateData
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportMenu({ data, variant = 'default', size = 'default' }: ExportMenuProps) {
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    try {
      switch (format) {
        case 'csv':
          exportToCSV(data)
          toast.success('CSV file downloaded successfully')
          break
        case 'json':
          exportToJSON(data)
          toast.success('JSON file downloaded successfully')
          break
        case 'pdf':
          exportToPDF(data)
          toast.success('PDF file downloaded successfully')
          break
      }
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} file`)
      console.error('Export error:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <DownloadSimple size={18} weight="bold" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-3 cursor-pointer">
          <FileCsv size={20} weight="fill" className="text-accent" />
          <div className="flex flex-col">
            <span className="font-medium">CSV File</span>
            <span className="text-xs text-muted-foreground">
              Spreadsheet compatible format
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-3 cursor-pointer">
          <FileJs size={20} weight="fill" className="text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">JSON File</span>
            <span className="text-xs text-muted-foreground">
              Structured data format
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-3 cursor-pointer">
          <FileText size={20} weight="fill" className="text-destructive" />
          <div className="flex flex-col">
            <span className="font-medium">PDF Document</span>
            <span className="text-xs text-muted-foreground">
              Printable report format
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
