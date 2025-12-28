import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MagnifyingGlass,
  X,
  Sparkle,
  ChatCircle,
  Lightbulb,
  ListChecks,
  Funnel,
  SortAscending,
  Calendar,
  User,
  FileText,
  Info,
  CheckCircle,
} from '@phosphor-icons/react'
import type { TranscriptionData } from '@/hooks/use-call-transcription'
import { formatDate } from '@/lib/utils'
import { AdvancedSearchFilters, type AdvancedFilters } from './AdvancedSearchFilters'

interface TranscriptionSearchProps {
  transcriptions: TranscriptionData[]
  onSelectTranscription?: (transcription: TranscriptionData) => void
}

interface SearchMatch {
  transcription: TranscriptionData
  matchedSegments: Array<{
    segment: {
      timestamp: number
      speaker: string
      text: string
    }
    highlightedText: string
  }>
  matchType: 'segment' | 'summary' | 'topic' | 'actionItem'
  matchCount: number
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-accent/60 text-accent-foreground font-semibold rounded px-0.5">$1</mark>')
}

export function TranscriptionSearch({ transcriptions, onSelectTranscription }: TranscriptionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dateRange: { from: undefined, to: undefined },
    participants: [],
    participantCount: { min: undefined, max: undefined },
    callType: 'all',
    duration: { min: undefined, max: undefined },
    hasTranscription: undefined,
    sentiment: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
  })

  const availableParticipants = useMemo(() => {
    const participants = new Set<string>()
    transcriptions.forEach((t) => {
      t.segments.forEach((s) => {
        if (s.speaker && s.speaker !== 'Unknown') {
          participants.add(s.speaker)
        }
      })
    })
    return Array.from(participants).sort()
  }, [transcriptions])

  const searchResults = useMemo(() => {
    let results = transcriptions.filter(t => t.status === 'completed')

    if (advancedFilters.dateRange.from) {
      results = results.filter(t => {
        const transcriptionDate = new Date(t.timestamp)
        return transcriptionDate >= advancedFilters.dateRange.from!
      })
    }

    if (advancedFilters.dateRange.to) {
      results = results.filter(t => {
        const transcriptionDate = new Date(t.timestamp)
        const endOfDay = new Date(advancedFilters.dateRange.to!)
        endOfDay.setHours(23, 59, 59, 999)
        return transcriptionDate <= endOfDay
      })
    }

    if (advancedFilters.participants.length > 0) {
      results = results.filter(t => {
        const speakers = new Set(t.segments.map(s => s.speaker))
        return advancedFilters.participants.some(p => speakers.has(p))
      })
    }

    if (advancedFilters.participantCount.min !== undefined) {
      results = results.filter(t => t.participantCount >= advancedFilters.participantCount.min!)
    }

    if (advancedFilters.participantCount.max !== undefined) {
      results = results.filter(t => t.participantCount <= advancedFilters.participantCount.max!)
    }

    if (advancedFilters.duration.min !== undefined) {
      results = results.filter(t => t.duration >= advancedFilters.duration.min! * 60)
    }

    if (advancedFilters.duration.max !== undefined) {
      results = results.filter(t => t.duration <= advancedFilters.duration.max! * 60)
    }

    if (advancedFilters.sentiment !== 'all') {
      results = results.filter(t => t.sentiment === advancedFilters.sentiment)
    }

    if (advancedFilters.callType !== 'all') {
      results = results.filter(t => {
        if (advancedFilters.callType === 'group') {
          return t.participantCount > 2
        }
        return true
      })
    }

    if (advancedFilters.hasTranscription === true) {
      results = results.filter(t => t.segments.length > 0)
    }

    const query = searchQuery.toLowerCase().trim()
    const searchMatches: SearchMatch[] = []

    results.forEach((transcription) => {
      let matchCount = 0
      const matchedSegments: SearchMatch['matchedSegments'] = []
      let matchType: SearchMatch['matchType'] = 'segment'

      if (query) {
        transcription.segments.forEach((segment) => {
          if (segment.text.toLowerCase().includes(query) || segment.speaker.toLowerCase().includes(query)) {
            matchCount++
            matchedSegments.push({
              segment,
              highlightedText: highlightText(segment.text, query),
            })
          }
        })

        if (transcription.summary.toLowerCase().includes(query)) {
          matchCount += 5
          matchType = 'summary'
        }

        transcription.keyTopics.forEach((topic) => {
          if (topic.toLowerCase().includes(query)) {
            matchCount += 3
            matchType = 'topic'
          }
        })

        transcription.actionItems.forEach((item) => {
          if (item.toLowerCase().includes(query)) {
            matchCount += 3
            matchType = 'actionItem'
          }
        })
      } else {
        matchCount = 1
      }

      if (matchCount > 0 || !query) {
        searchMatches.push({
          transcription,
          matchedSegments,
          matchType,
          matchCount,
        })
      }
    })

    return searchMatches.sort((a, b) => {
      const sortOrder = advancedFilters.sortOrder === 'asc' ? 1 : -1
      switch (advancedFilters.sortBy) {
        case 'relevance':
          return (b.matchCount - a.matchCount) * sortOrder
        case 'date':
          return (b.transcription.timestamp - a.transcription.timestamp) * sortOrder
        case 'duration':
          return (b.transcription.duration - a.transcription.duration) * sortOrder
        case 'participants':
          return (b.transcription.participantCount - a.transcription.participantCount) * sortOrder
        default:
          return 0
      }
    })
  }, [transcriptions, searchQuery, advancedFilters])

  const toggleExpanded = (transcriptionId: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev)
      if (next.has(transcriptionId)) {
        next.delete(transcriptionId)
      } else {
        next.add(transcriptionId)
      }
      return next
    })
  }

  const clearSearch = () => {
    setSearchQuery('')
    setAdvancedFilters({
      dateRange: { from: undefined, to: undefined },
      participants: [],
      participantCount: { min: undefined, max: undefined },
      callType: 'all',
      duration: { min: undefined, max: undefined },
      hasTranscription: undefined,
      sentiment: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
    })
  }

  const hasActiveFilters = searchQuery.trim() !== '' || 
    advancedFilters.dateRange.from !== undefined ||
    advancedFilters.dateRange.to !== undefined ||
    advancedFilters.participants.length > 0 ||
    advancedFilters.participantCount.min !== undefined ||
    advancedFilters.participantCount.max !== undefined ||
    advancedFilters.callType !== 'all' ||
    advancedFilters.duration.min !== undefined ||
    advancedFilters.duration.max !== undefined ||
    advancedFilters.hasTranscription !== undefined ||
    advancedFilters.sentiment !== 'all'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={24} weight="duotone" />
            Search Transcriptions
          </CardTitle>
          <CardDescription>
            Search across all call transcriptions, summaries, topics, and action items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <MagnifyingGlass 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcriptions, speakers, topics, action items..."
                className="pl-10 pr-10 h-12 text-base"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2"
              >
                <Funnel size={16} weight={showAdvancedFilters ? "fill" : "regular"} />
                Advanced Filters
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="gap-2 h-9"
                >
                  <X size={14} />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                {searchQuery && (
                  <span className="ml-1">
                    for <span className="font-semibold text-foreground">"{searchQuery}"</span>
                  </span>
                )}
              </p>
            </div>

            {searchResults.length === 0 ? (
              <Alert>
                <Info size={20} weight="duotone" />
                <AlertDescription>
                  {transcriptions.filter(t => t.status === 'completed').length === 0 ? (
                    <>
                      <p className="font-medium mb-1">No transcriptions available</p>
                      <p className="text-sm">
                        Generate transcriptions from your recorded calls to search through them.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium mb-1">No results found</p>
                      <p className="text-sm">
                        Try adjusting your search query or filters to find what you're looking for.
                      </p>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {searchResults.map((result, index) => {
                  const { transcription, matchedSegments, matchType, matchCount } = result
                  const isExpanded = expandedResults.has(transcription.id)

                  return (
                    <div key={transcription.id}>
                      <Card className="hover:bg-accent/30 transition-colors">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkle size={20} weight="duotone" className="text-primary flex-shrink-0" />
                                  <h3 className="font-semibold text-base">
                                    Call Transcription
                                  </h3>
                                  {searchQuery && matchCount > 0 && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {matchCount} match{matchCount !== 1 ? 'es' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(new Date(transcription.timestamp).toISOString())}
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <ChatCircle size={14} />
                                    {formatTimestamp(transcription.duration)}
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <User size={14} />
                                    {transcription.participantCount} participant{transcription.participantCount !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onSelectTranscription?.(transcription)}
                                className="gap-2"
                              >
                                <FileText size={16} />
                                View Full
                              </Button>
                            </div>

                            {searchQuery && transcription.summary.toLowerCase().includes(searchQuery.toLowerCase()) && (
                              <div className="bg-accent/20 border border-accent/40 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkle size={16} weight="fill" className="text-accent" />
                                  <span className="text-xs font-semibold text-accent-foreground uppercase">
                                    Match in Summary
                                  </span>
                                </div>
                                <p 
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{ 
                                    __html: highlightText(transcription.summary, searchQuery) 
                                  }}
                                />
                              </div>
                            )}

                            {searchQuery && transcription.keyTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) && (
                              <div className="bg-accent/20 border border-accent/40 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb size={16} weight="fill" className="text-accent" />
                                  <span className="text-xs font-semibold text-accent-foreground uppercase">
                                    Match in Topics
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {transcription.keyTopics
                                    .filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((topic, i) => (
                                      <Badge 
                                        key={i} 
                                        variant="secondary"
                                        dangerouslySetInnerHTML={{ 
                                          __html: highlightText(topic, searchQuery) 
                                        }}
                                      />
                                    ))}
                                </div>
                              </div>
                            )}

                            {searchQuery && transcription.actionItems.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) && (
                              <div className="bg-accent/20 border border-accent/40 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <ListChecks size={16} weight="fill" className="text-accent" />
                                  <span className="text-xs font-semibold text-accent-foreground uppercase">
                                    Match in Action Items
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {transcription.actionItems
                                    .filter(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((item, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                        <CheckCircle size={14} className="text-accent mt-0.5 flex-shrink-0" weight="bold" />
                                        <span 
                                          className="text-sm"
                                          dangerouslySetInnerHTML={{ 
                                            __html: highlightText(item, searchQuery) 
                                          }}
                                        />
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {matchedSegments.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ChatCircle size={16} className="text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      Transcript Matches ({matchedSegments.length})
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpanded(transcription.id)}
                                    className="h-8 text-xs"
                                  >
                                    {isExpanded ? 'Show Less' : 'Show All'}
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  {matchedSegments.slice(0, isExpanded ? undefined : 2).map((match, i) => (
                                    <div 
                                      key={i} 
                                      className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="font-mono text-xs">
                                          {formatTimestamp(match.segment.timestamp)}
                                        </Badge>
                                        <span className="font-semibold text-sm">
                                          {match.segment.speaker}
                                        </span>
                                      </div>
                                      <p 
                                        className="text-sm text-foreground/90"
                                        dangerouslySetInnerHTML={{ __html: match.highlightedText }}
                                      />
                                    </div>
                                  ))}
                                  {!isExpanded && matchedSegments.length > 2 && (
                                    <p className="text-xs text-muted-foreground text-center py-1">
                                      + {matchedSegments.length - 2} more matches
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {!searchQuery && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {transcription.summary}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="gap-1">
                                <ChatCircle size={12} />
                                {transcription.segments.length} segments
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                <Lightbulb size={12} />
                                {transcription.keyTopics.length} topics
                              </Badge>
                              {transcription.actionItems.length > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                  <ListChecks size={12} />
                                  {transcription.actionItems.length} actions
                                </Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={
                                  transcription.sentiment === 'positive' 
                                    ? 'bg-green-500/10 text-green-700 border-green-200'
                                    : transcription.sentiment === 'negative'
                                    ? 'bg-red-500/10 text-red-700 border-red-200'
                                    : 'bg-gray-500/10 text-gray-700 border-gray-200'
                                }
                              >
                                {transcription.sentiment}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {index < searchResults.length - 1 && <Separator className="my-3" />}
                    </div>
                  )
                })}
              </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {showAdvancedFilters && (
        <AdvancedSearchFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          availableParticipants={availableParticipants}
          showCompactMode={false}
        />
      )}
    </div>
  )
}
