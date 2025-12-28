import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Funnel,
  X,
  CalendarBlank,
  User,
  Users,
  SortAscending,
  Clock,
  VideoCamera,
  Microphone,
  ChatCircle,
  Sparkle,
  CaretDown,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export interface AdvancedFilters {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  participants: string[]
  participantCount: {
    min: number | undefined
    max: number | undefined
  }
  callType: 'all' | 'audio' | 'video' | 'group'
  duration: {
    min: number | undefined
    max: number | undefined
  }
  hasTranscription: boolean | undefined
  sentiment: 'all' | 'positive' | 'neutral' | 'negative'
  sortBy: 'date' | 'duration' | 'participants' | 'relevance'
  sortOrder: 'asc' | 'desc'
}

interface AdvancedSearchFiltersProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  availableParticipants?: string[]
  showCompactMode?: boolean
}

export function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  availableParticipants = [],
  showCompactMode = false,
}: AdvancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(!showCompactMode)
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set(filters.participants)
  )

  const updateFilters = (updates: Partial<AdvancedFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    setSelectedParticipants(new Set())
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      participants: [],
      participantCount: { min: undefined, max: undefined },
      callType: 'all',
      duration: { min: undefined, max: undefined },
      hasTranscription: undefined,
      sentiment: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
    })
  }

  const toggleParticipant = (participant: string) => {
    const newSelected = new Set(selectedParticipants)
    if (newSelected.has(participant)) {
      newSelected.delete(participant)
    } else {
      newSelected.add(participant)
    }
    setSelectedParticipants(newSelected)
    updateFilters({ participants: Array.from(newSelected) })
  }

  const hasActiveFilters =
    filters.dateRange.from !== undefined ||
    filters.dateRange.to !== undefined ||
    filters.participants.length > 0 ||
    filters.participantCount.min !== undefined ||
    filters.participantCount.max !== undefined ||
    filters.callType !== 'all' ||
    filters.duration.min !== undefined ||
    filters.duration.max !== undefined ||
    filters.hasTranscription !== undefined ||
    filters.sentiment !== 'all'

  const activeFilterCount = [
    filters.dateRange.from !== undefined || filters.dateRange.to !== undefined,
    filters.participants.length > 0,
    filters.participantCount.min !== undefined || filters.participantCount.max !== undefined,
    filters.callType !== 'all',
    filters.duration.min !== undefined || filters.duration.max !== undefined,
    filters.hasTranscription !== undefined,
    filters.sentiment !== 'all',
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Funnel size={24} weight="duotone" className="text-primary" />
            <div>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              {hasActiveFilters && (
                <CardDescription className="text-xs mt-0.5">
                  {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="gap-2 h-8"
              >
                <X size={14} />
                Clear All
              </Button>
            )}
            {showCompactMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-2"
              >
                {isExpanded ? 'Hide' : 'Show'}
                <CaretDown
                  size={16}
                  className={cn('transition-transform', isExpanded && 'rotate-180')}
                />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <CalendarBlank size={16} weight="duotone" />
                Date Range
              </Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal',
                        !filters.dateRange.from && 'text-muted-foreground'
                      )}
                    >
                      <CalendarBlank size={16} className="mr-2" />
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, 'PPP')
                      ) : (
                        'Start date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, from: date },
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'justify-start text-left font-normal',
                        !filters.dateRange.to && 'text-muted-foreground'
                      )}
                    >
                      <CalendarBlank size={16} className="mr-2" />
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, 'PPP')
                      ) : (
                        'End date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) =>
                        updateFilters({
                          dateRange: { ...filters.dateRange, to: date },
                        })
                      }
                      disabled={(date) =>
                        filters.dateRange.from
                          ? date < filters.dateRange.from
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Clock size={16} weight="duotone" />
                Duration (minutes)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="duration-min" className="text-xs text-muted-foreground">
                    Minimum
                  </Label>
                  <Input
                    id="duration-min"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={filters.duration.min ?? ''}
                    onChange={(e) =>
                      updateFilters({
                        duration: {
                          ...filters.duration,
                          min: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duration-max" className="text-xs text-muted-foreground">
                    Maximum
                  </Label>
                  <Input
                    id="duration-max"
                    type="number"
                    min="0"
                    placeholder="∞"
                    value={filters.duration.max ?? ''}
                    onChange={(e) =>
                      updateFilters({
                        duration: {
                          ...filters.duration,
                          max: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <VideoCamera size={16} weight="duotone" />
                Call Type
              </Label>
              <Select
                value={filters.callType}
                onValueChange={(value) =>
                  updateFilters({ callType: value as AdvancedFilters['callType'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <ChatCircle size={16} />
                      All Types
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Microphone size={16} />
                      Audio Only
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <VideoCamera size={16} />
                      Video Calls
                    </div>
                  </SelectItem>
                  <SelectItem value="group">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      Group Calls
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Sparkle size={16} weight="duotone" />
                Additional Filters
              </Label>
              <div className="space-y-2">
                <Select
                  value={filters.sentiment}
                  onValueChange={(value) =>
                    updateFilters({ sentiment: value as AdvancedFilters['sentiment'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 py-2 px-3 border rounded-md hover:bg-accent/50 cursor-pointer">
                  <Checkbox
                    id="has-transcription"
                    checked={filters.hasTranscription === true}
                    onCheckedChange={(checked) =>
                      updateFilters({
                        hasTranscription: checked === true ? true : undefined,
                      })
                    }
                  />
                  <Label
                    htmlFor="has-transcription"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Has transcription only
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Users size={16} weight="duotone" />
              Participant Count
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="participants-min" className="text-xs text-muted-foreground">
                  Minimum
                </Label>
                <Input
                  id="participants-min"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={filters.participantCount.min ?? ''}
                  onChange={(e) =>
                    updateFilters({
                      participantCount: {
                        ...filters.participantCount,
                        min: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="participants-max" className="text-xs text-muted-foreground">
                  Maximum
                </Label>
                <Input
                  id="participants-max"
                  type="number"
                  min="1"
                  placeholder="∞"
                  value={filters.participantCount.max ?? ''}
                  onChange={(e) =>
                    updateFilters({
                      participantCount: {
                        ...filters.participantCount,
                        max: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {availableParticipants.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <User size={16} weight="duotone" />
                  Filter by Participants
                  {selectedParticipants.size > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedParticipants.size} selected
                    </Badge>
                  )}
                </Label>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-2">
                    {availableParticipants.map((participant) => (
                      <div
                        key={participant}
                        className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-accent/50 cursor-pointer"
                        onClick={() => toggleParticipant(participant)}
                      >
                        <Checkbox
                          id={`participant-${participant}`}
                          checked={selectedParticipants.has(participant)}
                          onCheckedChange={() => toggleParticipant(participant)}
                        />
                        <Label
                          htmlFor={`participant-${participant}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {participant}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <SortAscending size={16} weight="duotone" />
              Sort Results
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  updateFilters({ sortBy: value as AdvancedFilters['sortBy'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="participants">Participants</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) =>
                  updateFilters({ sortOrder: value as 'asc' | 'desc' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
