import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Sparkle,
  Trash,
  DownloadSimple,
  ListChecks,
  Lightbulb,
  ChatCircle,
  SmileyXEyes,
  SmileyMeh,
  Smiley,
  Info,
  Warning,
  CheckCircle,
  Clock,
  FileText,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { formatDate } from '@/lib/utils'
import type { TranscriptionData } from '@/hooks/use-call-transcription'
import { toast } from 'sonner'

interface CallTranscriptionViewerProps {
  transcriptions: TranscriptionData[]
  onDelete: (transcriptionId: string) => void
  onRegenerate?: (transcriptionId: string) => void
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function getSentimentIcon(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return <Smiley size={20} weight="fill" className="text-green-500" />
    case 'negative':
      return <SmileyXEyes size={20} weight="fill" className="text-red-500" />
    default:
      return <SmileyMeh size={20} weight="fill" className="text-muted-foreground" />
  }
}

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-500/10 text-green-700 border-green-200'
    case 'negative':
      return 'bg-red-500/10 text-red-700 border-red-200'
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200'
  }
}

interface TranscriptionDetailProps {
  transcription: TranscriptionData
  onClose: () => void
  onDelete: (transcriptionId: string) => void
  onRegenerate?: (transcriptionId: string) => void
}

function TranscriptionDetail({ transcription, onClose, onDelete, onRegenerate }: TranscriptionDetailProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleDownload = () => {
    const content = `Call Transcription Report
Generated: ${new Date(transcription.timestamp).toLocaleString()}
Duration: ${formatDuration(transcription.duration)}
Participants: ${transcription.participantCount}
Sentiment: ${transcription.sentiment}

SUMMARY
${transcription.summary}

KEY TOPICS
${transcription.keyTopics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

${transcription.actionItems.length > 0 ? `ACTION ITEMS
${transcription.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}` : ''}

FULL TRANSCRIPT
${transcription.segments.map(segment => 
  `[${formatTimestamp(segment.timestamp)}] ${segment.speaker}: ${segment.text}`
).join('\n\n')}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${new Date(transcription.timestamp).toISOString().replace(/[:.]/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Transcription downloaded successfully')
  }

  const handleDelete = () => {
    onDelete(transcription.id)
    setDeleteConfirmOpen(false)
    onClose()
    toast.success('Transcription deleted')
  }

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(transcription.id)
      toast.info('Regenerating transcription...')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl font-bold">AI Transcription & Analysis</h3>
            {transcription.status === 'completed' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle size={14} className="mr-1" />
                Completed
              </Badge>
            )}
            {transcription.status === 'processing' && (
              <Badge variant="secondary">
                <Clock size={14} className="mr-1" />
                Processing...
              </Badge>
            )}
            {transcription.status === 'failed' && (
              <Badge variant="destructive">
                <Warning size={14} className="mr-1" />
                Failed
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(new Date(transcription.timestamp).toISOString())} • {formatDuration(transcription.duration)}
          </p>
        </div>
        <div className="flex gap-2">
          {onRegenerate && transcription.status === 'failed' && (
            <Button onClick={handleRegenerate} variant="outline" size="sm" className="gap-2">
              <ArrowsClockwise size={16} />
              Retry
            </Button>
          )}
          <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
            <DownloadSimple size={16} />
            Download
          </Button>
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Transcription?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. The transcription will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="gap-2">
                  <Trash size={16} />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {transcription.status === 'failed' && transcription.error && (
        <Alert variant="destructive">
          <Warning size={20} weight="fill" />
          <AlertTitle>Transcription Failed</AlertTitle>
          <AlertDescription>{transcription.error}</AlertDescription>
        </Alert>
      )}

      {transcription.status === 'processing' && (
        <Alert>
          <Clock size={20} weight="duotone" />
          <AlertTitle>Processing Transcription</AlertTitle>
          <AlertDescription>
            <p className="mb-3">AI is analyzing the recording and generating the transcription. This may take a minute...</p>
            <Progress value={undefined} className="w-full" />
          </AlertDescription>
        </Alert>
      )}

      {transcription.status === 'completed' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={20} weight="duotone" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{transcription.summary}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">Sentiment:</span>
                <Badge variant="outline" className={getSentimentColor(transcription.sentiment)}>
                  {getSentimentIcon(transcription.sentiment)}
                  <span className="ml-1 capitalize">{transcription.sentiment}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb size={20} weight="duotone" />
                  Key Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transcription.keyTopics.length > 0 ? (
                  <ul className="space-y-2">
                    {transcription.keyTopics.map((topic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{topic}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No key topics identified</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks size={20} weight="duotone" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transcription.actionItems.length > 0 ? (
                  <ul className="space-y-2">
                    {transcription.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" weight="bold" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No action items identified</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChatCircle size={20} weight="duotone" />
                Full Transcript
              </CardTitle>
              <CardDescription>
                {transcription.segments.length} conversation segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {transcription.segments.map((segment, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatTimestamp(segment.timestamp)}
                        </Badge>
                        <span className="font-semibold text-sm">{segment.speaker}</span>
                      </div>
                      <p className="text-sm text-foreground/90">{segment.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  )
}

export function CallTranscriptionViewer({ transcriptions, onDelete, onRegenerate }: CallTranscriptionViewerProps) {
  const [selectedTranscription, setSelectedTranscription] = useState<TranscriptionData | null>(null)

  if (selectedTranscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <TranscriptionDetail
            transcription={selectedTranscription}
            onClose={() => setSelectedTranscription(null)}
            onDelete={onDelete}
            onRegenerate={onRegenerate}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle size={24} weight="duotone" />
          AI Transcriptions & Summaries
        </CardTitle>
        <CardDescription>
          View AI-generated transcriptions with summaries, key topics, and action items
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transcriptions.length === 0 ? (
          <Alert>
            <Info size={20} weight="duotone" />
            <AlertDescription>
              <p className="font-medium mb-1">No transcriptions yet</p>
              <p className="text-sm">
                After recording a call, use the "Generate Transcription" button to create an AI-powered 
                transcription with automatic summary, key topics, and action items.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {transcriptions.map((transcription, index) => (
                <div key={transcription.id}>
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Sparkle size={32} weight="duotone" className="text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">AI Transcription</h3>
                                {transcription.status === 'completed' && (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle size={12} className="mr-1" />
                                    Ready
                                  </Badge>
                                )}
                                {transcription.status === 'processing' && (
                                  <Badge variant="secondary">
                                    <Clock size={12} className="mr-1" />
                                    Processing
                                  </Badge>
                                )}
                                {transcription.status === 'failed' && (
                                  <Badge variant="destructive">
                                    <Warning size={12} className="mr-1" />
                                    Failed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(new Date(transcription.timestamp).toISOString())}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setSelectedTranscription(transcription)}
                                size="sm"
                                className="gap-1"
                              >
                                <FileText size={16} />
                                View Details
                              </Button>
                            </div>
                          </div>

                          {transcription.status === 'completed' && (
                            <>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {transcription.summary}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="gap-1">
                                  <ChatCircle size={14} />
                                  {transcription.segments.length} segments
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                  <Clock size={14} />
                                  {formatDuration(transcription.duration)}
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                  <Lightbulb size={14} />
                                  {transcription.keyTopics.length} topics
                                </Badge>
                                {transcription.actionItems.length > 0 && (
                                  <Badge variant="secondary" className="gap-1">
                                    <ListChecks size={14} />
                                    {transcription.actionItems.length} action items
                                  </Badge>
                                )}
                                <Badge variant="outline" className={getSentimentColor(transcription.sentiment)}>
                                  {getSentimentIcon(transcription.sentiment)}
                                  <span className="ml-1 capitalize">{transcription.sentiment}</span>
                                </Badge>
                              </div>
                            </>
                          )}

                          {transcription.status === 'processing' && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                AI is analyzing the recording and generating transcription...
                              </p>
                              <Progress value={undefined} className="w-full" />
                            </div>
                          )}

                          {transcription.status === 'failed' && (
                            <Alert variant="destructive" className="mt-2">
                              <Warning size={16} />
                              <AlertDescription className="text-xs">
                                {transcription.error || 'Failed to generate transcription'}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {index < transcriptions.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
