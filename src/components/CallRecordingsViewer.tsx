import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Pause,
  Stop,
  DownloadSimple,
  Trash,
  VideoCamera,
  Microphone,
  Users,
  Info,
  SpeakerHigh,
  SpeakerSlash,
} from '@phosphor-icons/react'
import { formatDate } from '@/lib/utils'
import type { RecordingMetadata } from '@/hooks/use-call-recording'

interface CallRecordingsViewerProps {
  recordings: RecordingMetadata[]
  onDelete: (recordingId: string) => void
  onDownload: (recordingId: string, fileName: string) => void
  getRecordingBlob: (recordingId: string) => Blob | null
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface RecordingPlayerProps {
  recording: RecordingMetadata
  blob: Blob
  onClose: () => void
}

function RecordingPlayer({ recording, blob, onClose }: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [blob])

  useEffect(() => {
    const mediaElement = recording.callType === 'video' ? videoRef.current : audioRef.current
    if (!mediaElement) return

    const updateTime = () => setCurrentTime(mediaElement.currentTime)
    const updateDuration = () => setDuration(mediaElement.duration)
    const handleEnded = () => setIsPlaying(false)

    mediaElement.addEventListener('timeupdate', updateTime)
    mediaElement.addEventListener('loadedmetadata', updateDuration)
    mediaElement.addEventListener('ended', handleEnded)

    return () => {
      mediaElement.removeEventListener('timeupdate', updateTime)
      mediaElement.removeEventListener('loadedmetadata', updateDuration)
      mediaElement.removeEventListener('ended', handleEnded)
    }
  }, [recording.callType])

  const togglePlay = () => {
    const mediaElement = recording.callType === 'video' ? videoRef.current : audioRef.current
    if (!mediaElement) return

    if (isPlaying) {
      mediaElement.pause()
    } else {
      mediaElement.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    const mediaElement = recording.callType === 'video' ? videoRef.current : audioRef.current
    if (!mediaElement) return

    mediaElement.pause()
    mediaElement.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSeek = (value: number[]) => {
    const mediaElement = recording.callType === 'video' ? videoRef.current : audioRef.current
    if (!mediaElement) return

    mediaElement.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const mediaElement = recording.callType === 'video' ? videoRef.current : audioRef.current
    if (!mediaElement) return

    const newVolume = value[0]
    mediaElement.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const mediaElement = recording.callType === 'video' ? videoRef.current : audioRef.current
    if (!mediaElement) return

    if (isMuted) {
      mediaElement.volume = volume || 0.5
      setVolume(volume || 0.5)
      setIsMuted(false)
    } else {
      mediaElement.volume = 0
      setIsMuted(true)
    }
  }

  return (
    <div className="space-y-4">
      {recording.callType === 'video' ? (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={blobUrl}
            className="w-full h-full"
            controlsList="nodownload"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-lg flex items-center justify-center">
          <audio ref={audioRef} src={blobUrl} />
          <div className="text-center">
            <Microphone size={80} weight="duotone" className="text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">Audio Recording</p>
            <p className="text-sm text-muted-foreground mt-2">
              {recording.participantCount} participant{recording.participantCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground w-16">
              {formatDuration(Math.floor(currentTime))}
            </span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-sm font-mono text-muted-foreground w-16 text-right">
              {formatDuration(Math.floor(duration))}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePlay}
                size="lg"
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} weight="fill" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} weight="fill" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={handleStop}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Stop size={20} weight="fill" />
                Stop
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
              >
                {isMuted ? (
                  <SpeakerSlash size={20} weight="fill" />
                ) : (
                  <SpeakerHigh size={20} weight="fill" />
                )}
              </Button>
              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          Close Player
        </Button>
      </div>
    </div>
  )
}

export function CallRecordingsViewer({
  recordings,
  onDelete,
  onDownload,
  getRecordingBlob,
}: CallRecordingsViewerProps) {
  const [selectedRecording, setSelectedRecording] = useState<{
    metadata: RecordingMetadata
    blob: Blob
  } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handlePlayRecording = (recording: RecordingMetadata) => {
    const blob = getRecordingBlob(recording.id)
    if (blob) {
      setSelectedRecording({ metadata: recording, blob })
    }
  }

  const handleDownload = (recording: RecordingMetadata) => {
    const extension = recording.callType === 'video' ? 'webm' : 'webm'
    const fileName = `call-recording-${new Date(recording.timestamp).toISOString().replace(/[:.]/g, '-')}.${extension}`
    onDownload(recording.id, fileName)
  }

  const handleDelete = (recordingId: string) => {
    onDelete(recordingId)
    setDeleteConfirmId(null)
  }

  if (selectedRecording) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {selectedRecording.metadata.callType === 'video' ? (
                  <VideoCamera size={24} weight="duotone" />
                ) : (
                  <Microphone size={24} weight="duotone" />
                )}
                Recording Playback
              </CardTitle>
              <CardDescription>
                {formatDate(new Date(selectedRecording.metadata.timestamp).toISOString())}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecordingPlayer
            recording={selectedRecording.metadata}
            blob={selectedRecording.blob}
            onClose={() => setSelectedRecording(null)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoCamera size={24} weight="duotone" />
          Call Recordings
        </CardTitle>
        <CardDescription>
          View and manage your recorded group calls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recordings.length === 0 ? (
          <Alert>
            <Info size={20} weight="duotone" />
            <AlertDescription>
              <p className="font-medium mb-1">No recordings yet</p>
              <p className="text-sm">
                Start recording during a group call to save and replay it later. 
                Recordings will appear here for playback and download.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {recordings.map((recording, index) => (
                <div key={recording.id}>
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {recording.callType === 'video' ? (
                            <VideoCamera size={32} weight="duotone" className="text-primary" />
                          ) : (
                            <Microphone size={32} weight="duotone" className="text-primary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {recording.callType === 'video' ? 'Video' : 'Audio'} Call Recording
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(new Date(recording.timestamp).toISOString())}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handlePlayRecording(recording)}
                                size="sm"
                                className="gap-1"
                              >
                                <Play size={16} weight="fill" />
                                Play
                              </Button>
                              <Button
                                onClick={() => handleDownload(recording)}
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                <DownloadSimple size={16} weight="fill" />
                              </Button>
                              <Dialog
                                open={deleteConfirmId === recording.id}
                                onOpenChange={(open) => setDeleteConfirmId(open ? recording.id : null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <Trash size={16} weight="fill" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Recording?</DialogTitle>
                                    <DialogDescription>
                                      This action cannot be undone. The recording will be permanently deleted.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setDeleteConfirmId(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDelete(recording.id)}
                                      className="gap-2"
                                    >
                                      <Trash size={16} weight="fill" />
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="secondary" className="gap-1">
                              <Users size={14} />
                              {recording.participantCount} participant{recording.participantCount !== 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="secondary">
                              {formatDuration(recording.duration)}
                            </Badge>
                            <Badge variant="secondary">
                              {formatFileSize(recording.size)}
                            </Badge>
                          </div>

                          {recording.participants.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-1">Participants:</p>
                              <p className="text-sm">
                                {recording.participants.map(p => p.userName).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {index < recordings.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
