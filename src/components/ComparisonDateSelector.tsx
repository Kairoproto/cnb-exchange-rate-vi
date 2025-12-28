import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarBlank, Plus, Trash, Warning } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ComparisonDateSelectorProps {
  selectedDates: string[]
  onAddDate: (date: string) => void
  onRemoveDate: (date: string) => void
  onClear: () => void
  isLoading: boolean
  error: string | null
  maxDates?: number
}

export function ComparisonDateSelector({
  selectedDates,
  onAddDate,
  onRemoveDate,
  onClear,
  isLoading,
  error,
  maxDates = 5
}: ComparisonDateSelectorProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    const dateString = format(selectedDate, 'yyyy-MM-dd')
    
    if (selectedDates.includes(dateString)) {
      return
    }

    if (selectedDates.length >= maxDates) {
      return
    }

    onAddDate(dateString)
    setDate(undefined)
    setIsCalendarOpen(false)
  }

  const handleQuickAdd = (daysAgo: number) => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - daysAgo)
    
    const dayOfWeek = targetDate.getDay()
    if (dayOfWeek === 0) {
      targetDate.setDate(targetDate.getDate() - 2)
    } else if (dayOfWeek === 6) {
      targetDate.setDate(targetDate.getDate() - 1)
    }

    const dateString = format(targetDate, 'yyyy-MM-dd')
    
    if (!selectedDates.includes(dateString) && selectedDates.length < maxDates) {
      onAddDate(dateString)
    }
  }

  const disabledDates = (date: Date) => {
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isFuture = date > new Date()
    const dateString = format(date, 'yyyy-MM-dd')
    const isAlreadySelected = selectedDates.includes(dateString)
    
    return isWeekend || isFuture || isAlreadySelected
  }

  return (
    <Card className="shadow-lg border-accent/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CalendarBlank size={28} weight="duotone" className="text-accent" />
              Comparison Mode
            </CardTitle>
            <CardDescription className="text-base mt-1">
              Select multiple dates to track rate changes over time
            </CardDescription>
          </div>
          {selectedDates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash size={16} weight="bold" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <Warning size={20} weight="fill" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "gap-2 justify-start text-left font-normal",
                      selectedDates.length >= maxDates && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isLoading || selectedDates.length >= maxDates}
                  >
                    <Plus size={18} weight="bold" />
                    Add Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={disabledDates}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Note: Weekends and already selected dates are disabled
                    </p>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="text-sm text-muted-foreground">
                {selectedDates.length} / {maxDates} dates selected
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAdd(1)}
                  disabled={isLoading || selectedDates.length >= maxDates}
                  className="gap-1"
                >
                  Yesterday
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAdd(7)}
                  disabled={isLoading || selectedDates.length >= maxDates}
                  className="gap-1"
                >
                  1 Week Ago
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAdd(30)}
                  disabled={isLoading || selectedDates.length >= maxDates}
                  className="gap-1"
                >
                  1 Month Ago
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAdd(90)}
                  disabled={isLoading || selectedDates.length >= maxDates}
                  className="gap-1"
                >
                  3 Months Ago
                </Button>
              </div>
            </div>

            {selectedDates.length >= maxDates && (
              <Alert className="border-accent/30 bg-accent/5">
                <AlertDescription>
                  Maximum of {maxDates} dates reached. Remove a date to add another.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
