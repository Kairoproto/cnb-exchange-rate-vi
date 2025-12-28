import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChartLine, Lightning, Rocket, CopySimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface ComparisonTemplate {
  id: string
  name: string
  description: string
  icon: typeof Calendar
  dates: string[]
}

interface CustomTemplate {
  id: string
  name: string
  description: string
  dates: string[]
  createdAt: string
  isFavorite?: boolean
}

interface ComparisonTemplatesProps {
  onApplyTemplate: (dates: string[]) => void
  isLoading?: boolean
}

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1)
  }
  
  return date.toISOString().split('T')[0]
}

function getMonthsAgoDate(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1)
  }
  
  return date.toISOString().split('T')[0]
}

function getCurrentDate(): string {
  const date = new Date()
  
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1)
  }
  
  return date.toISOString().split('T')[0]
}

export function ComparisonTemplates({ onApplyTemplate, isLoading }: ComparisonTemplatesProps) {
  const [customTemplates, setCustomTemplates] = useKV<CustomTemplate[]>('custom-comparison-templates', [])

  const templates: ComparisonTemplate[] = [
    {
      id: 'weekly',
      name: 'Weekly Comparison',
      description: 'Compare current rates with the past week (today, 1, 3, 5, 7 days ago)',
      icon: Calendar,
      dates: [
        getCurrentDate(),
        getDateDaysAgo(1),
        getDateDaysAgo(3),
        getDateDaysAgo(5),
        getDateDaysAgo(7),
      ]
    },
    {
      id: 'biweekly',
      name: 'Bi-Weekly Comparison',
      description: 'Track rates over two weeks (today, 3, 7, 10, 14 days ago)',
      icon: ChartLine,
      dates: [
        getCurrentDate(),
        getDateDaysAgo(3),
        getDateDaysAgo(7),
        getDateDaysAgo(10),
        getDateDaysAgo(14),
      ]
    },
    {
      id: 'monthly',
      name: 'Monthly Comparison',
      description: 'View monthly progression (today, 1, 2, 3, 4 weeks ago)',
      icon: Lightning,
      dates: [
        getCurrentDate(),
        getDateDaysAgo(7),
        getDateDaysAgo(14),
        getDateDaysAgo(21),
        getDateDaysAgo(28),
      ]
    },
    {
      id: 'quarterly',
      name: 'Quarterly Comparison',
      description: 'Quarterly overview (today, 1, 2, 3 months ago)',
      icon: Rocket,
      dates: [
        getCurrentDate(),
        getMonthsAgoDate(1),
        getMonthsAgoDate(2),
        getMonthsAgoDate(3),
      ]
    },
  ]

  const handleDuplicateTemplate = (template: ComparisonTemplate) => {
    const newCustomTemplate: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name: template.name,
      description: template.description,
      dates: [...template.dates],
      createdAt: new Date().toISOString(),
      isFavorite: false
    }

    setCustomTemplates((current) => [...(current || []), newCustomTemplate])
    toast.success(`"${template.name}" saved as custom template`)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Quick Comparison Templates</CardTitle>
        <CardDescription className="text-base">
          Select a pre-configured time period to instantly compare exchange rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => {
            const Icon = template.icon
            return (
              <div
                key={template.id}
                className={cn(
                  "group relative flex flex-col items-start gap-3 p-5 rounded-lg border-2 transition-all",
                  "hover:border-primary hover:bg-primary/5 hover:shadow-md"
                )}
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "p-2.5 rounded-lg bg-primary/10 text-primary transition-colors shrink-0",
                      "group-hover:bg-primary group-hover:text-primary-foreground"
                    )}>
                      <Icon size={24} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {template.name}
                      </h3>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-1.5 h-auto text-muted-foreground hover:text-accent shrink-0"
                    title="Save as custom template"
                  >
                    <CopySimple size={18} weight="bold" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
                <div className="mt-auto w-full pt-2 border-t space-y-2">
                  <div className="text-xs text-muted-foreground font-mono">
                    {template.dates.length} dates
                  </div>
                  <Button
                    onClick={() => onApplyTemplate(template.dates)}
                    disabled={isLoading}
                    className="w-full gap-2"
                    size="sm"
                  >
                    Apply Template
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
              <Calendar size={20} weight="duotone" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">
                Template Features
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All templates automatically exclude weekends when the CNB doesn't publish rates. 
                Click the <CopySimple size={14} weight="bold" className="inline mx-1" /> icon to save any template as a custom template that you can then modify and reuse.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
