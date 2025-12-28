import { useEffect, useRef, useState } from 'react'
import { useWebRTC, type CallType } from '@/hooks/use-webrtc'
import { useCallRecording } from '@/hooks/use-call-recording'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CallRecordingsViewer } from '@/components/CallRecordingsViewer'
import { 
  Phone, 
  PhoneDisconnect, 
  VideoCamera, 
  Microphone, 
  MicrophoneSlash, 
  VideoCamera as VideoCameraIcon,
  VideoCameraSlash,
  UserCircle,
  Info,
  Users,
  User,
  Record,
  Stop,
  Pause,
  Play,
  FilmStrip
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GroupVideoCallProps {
  watchlistId: string | null
  watchlistMembers: Array<{
    userId: string
    userName: string
    userAvatar: string
    role: string
  }>
  currentUser: {
    login: string
    avatarUrl: string
  }
}

export function GroupVideoCall({ watchlistId, watchlistMembers, currentUser }: GroupVideoCallProps) {
  const {
    localStream,
    peers,
    callStatus,
    incomingCall,
    currentCallType,
    isAudioEnabled,
    isVideoEnabled,
    groupRoomId,
    groupParticipants,
    startGroupCall,
    joinGroupCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(watchlistId, currentUser)

  const {
    isRecording,
    isPaused,
    recordingDuration,
    recordings,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getRecordingBlob,
    deleteRecording,
    downloadRecording,
  } = useCallRecording(groupRoomId)

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [callTypeSelection, setCallTypeSelection] = useState<CallType>('video')
  const [isGridView, setIsGridView] = useState(true)
  const [activeTab, setActiveTab] = useState<'call' | 'recordings'>('call')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    peers.forEach(peer => {
      const videoElement = remoteVideoRefs.current.get(peer.userId)
      if (videoElement && peer.stream) {
        videoElement.srcObject = peer.stream
      }
    })
  }, [peers])

  useEffect(() => {
    if (incomingCall && incomingCall.roomId) {
      toast.info(`Incoming group ${incomingCall.callType} call from ${incomingCall.userName}`, {
        duration: 30000,
        action: {
          label: 'View',
          onClick: () => {},
        },
      })
    }
  }, [incomingCall])

  const availableMembers = watchlistMembers.filter(m => m.userId !== currentUser.login)

  const handleStartGroupCall = async () => {
    if (selectedParticipants.length < 2) {
      toast.error('Please select at least 2 participants for a group call')
      return
    }

    const participantData = selectedParticipants.map(id => {
      const member = watchlistMembers.find(m => m.userId === id)
      return {
        userId: id,
        userName: member?.userName || id,
        userAvatar: member?.userAvatar || '',
      }
    })

    try {
      await startGroupCall(selectedParticipants, participantData, callTypeSelection)
      setIsDialogOpen(false)
      setSelectedParticipants([])
      toast.success(`Starting group call with ${selectedParticipants.length} participants...`)
    } catch (error) {
      toast.error('Failed to start group call. Please check your camera/microphone permissions.')
    }
  }

  const handleAcceptGroupCall = async () => {
    if (!incomingCall) return
    try {
      await joinGroupCall(incomingCall)
      toast.success('Joined group call')
    } catch (error) {
      toast.error('Failed to join group call. Please check your camera/microphone permissions.')
    }
  }

  const handleRejectCall = () => {
    rejectCall()
    toast.info('Call rejected')
  }

  const handleEndCall = () => {
    if (isRecording) {
      stopRecording()
      toast.info('Recording stopped and saved')
    }
    endCall()
    toast.info('Left group call')
  }

  const handleStartRecording = async () => {
    try {
      const remoteStreams = peers.map(p => p.stream).filter((s): s is MediaStream => s !== null)
      const participantData = peers.map(p => ({
        userId: p.userId,
        userName: p.userName,
      }))

      await startRecording(localStream, remoteStreams, participantData, currentCallType)
      toast.success('Recording started')
    } catch (error) {
      toast.error('Failed to start recording')
    }
  }

  const handleStopRecording = () => {
    stopRecording()
    toast.success('Recording stopped and saved')
  }

  const handlePauseRecording = () => {
    pauseRecording()
    toast.info('Recording paused')
  }

  const handleResumeRecording = () => {
    resumeRecording()
    toast.success('Recording resumed')
  }

  const formatRecordingDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const getGridColumns = (count: number) => {
    if (count <= 2) return 'grid-cols-1 lg:grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  if (!watchlistId) {
    return (
      <Alert>
        <Info size={20} weight="duotone" />
        <AlertDescription>
          Select a shared watchlist to enable group video calls with team members.
        </AlertDescription>
      </Alert>
    )
  }

  const totalParticipants = peers.length + 1
  const activePeers = peers.filter(p => p.stream !== null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users size={24} weight="duotone" />
                Group Video Calls
              </CardTitle>
              <CardDescription>
                Connect with multiple team members simultaneously
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {isRecording && (
                <Badge variant="destructive" className="gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  REC {formatRecordingDuration(recordingDuration)}
                </Badge>
              )}
              {groupRoomId && (
                <Badge variant="default" className="gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
                </Badge>
              )}
              {callStatus !== 'idle' && (
                <Badge variant={callStatus === 'connected' ? 'default' : 'secondary'} className="gap-1">
                  {callStatus === 'calling' && 'Calling...'}
                  {callStatus === 'ringing' && 'Ringing...'}
                  {callStatus === 'connected' && 'Connected'}
                  {callStatus === 'ended' && 'Call Ended'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'call' | 'recordings')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="call" className="gap-2">
                <VideoCamera size={20} weight="duotone" />
                Active Call
              </TabsTrigger>
              <TabsTrigger value="recordings" className="gap-2">
                <FilmStrip size={20} weight="duotone" />
                Recordings ({recordings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="call" className="space-y-6 mt-6">
              {incomingCall && incomingCall.roomId && (
                <Card className="border-2 border-primary bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={incomingCall.userAvatar} />
                          <AvatarFallback>
                            {incomingCall.userName?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{incomingCall.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            Incoming group {incomingCall.callType} call
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(incomingCall.participants || []).length} participants
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAcceptGroupCall} size="lg" className="gap-2">
                          {incomingCall.callType === 'video' ? (
                            <VideoCamera size={20} weight="fill" />
                          ) : (
                            <Phone size={20} weight="fill" />
                          )}
                          Join
                        </Button>
                        <Button onClick={handleRejectCall} variant="destructive" size="lg">
                          <PhoneDisconnect size={20} weight="fill" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {callStatus === 'idle' && !incomingCall && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Start Group Call</h3>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="gap-2">
                          <Users size={20} weight="duotone" />
                          New Group Call
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Users size={24} weight="duotone" />
                            Start Group Call
                          </DialogTitle>
                          <DialogDescription>
                            Select at least 2 team members to start a group call
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="flex gap-3">
                            <Button
                              onClick={() => setCallTypeSelection('video')}
                              variant={callTypeSelection === 'video' ? 'default' : 'outline'}
                              className="flex-1 gap-2"
                            >
                              <VideoCamera size={20} weight="duotone" />
                              Video Call
                            </Button>
                            <Button
                              onClick={() => setCallTypeSelection('voice')}
                              variant={callTypeSelection === 'voice' ? 'default' : 'outline'}
                              className="flex-1 gap-2"
                            >
                              <Phone size={20} weight="duotone" />
                              Voice Call
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Selected: {selectedParticipants.length} / {availableMembers.length}
                            </p>
                            {availableMembers.length === 0 ? (
                              <Alert>
                                <Info size={20} weight="duotone" />
                                <AlertDescription>
                                  No other team members are in this watchlist. Invite members to enable group calls.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="grid gap-3 max-h-96 overflow-y-auto">
                                {availableMembers.map(member => (
                                  <Card
                                    key={member.userId}
                                    className={cn(
                                      'cursor-pointer transition-all hover:bg-accent/50',
                                      selectedParticipants.includes(member.userId) && 'bg-accent border-primary'
                                    )}
                                    onClick={() => toggleParticipant(member.userId)}
                                  >
                                    <CardContent className="pt-4 pb-4">
                                      <div className="flex items-center gap-3">
                                        <Checkbox
                                          checked={selectedParticipants.includes(member.userId)}
                                          onCheckedChange={() => toggleParticipant(member.userId)}
                                        />
                                        <Avatar>
                                          <AvatarImage src={member.userAvatar} />
                                          <AvatarFallback>
                                            {member.userName.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <p className="font-medium">{member.userName}</p>
                                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={handleStartGroupCall}
                            disabled={selectedParticipants.length < 2}
                            size="lg"
                            className="gap-2"
                          >
                            <VideoCamera size={20} weight="fill" />
                            Start Call with {selectedParticipants.length} member{selectedParticipants.length !== 1 ? 's' : ''}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Alert>
                    <Info size={20} weight="duotone" />
                    <AlertDescription>
                      <p className="font-medium mb-1">Group calls support 3+ participants</p>
                      <p className="text-sm">
                        Start a new group call to connect with multiple team members simultaneously. 
                        All participants will see each other in a grid layout.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {(callStatus !== 'idle' || localStream) && groupRoomId && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Active Group Call - {totalParticipants} Participant{totalParticipants !== 1 ? 's' : ''}
                    </h3>
                    <Button
                      onClick={() => setIsGridView(!isGridView)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Users size={16} />
                      {isGridView ? 'Spotlight View' : 'Grid View'}
                    </Button>
                  </div>

                  <div className={cn('grid gap-4', getGridColumns(totalParticipants))}>
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-primary">
                      {currentCallType === 'video' && localStream ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserCircle size={80} weight="duotone" className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="default" className="bg-primary">
                          <User size={14} className="mr-1" />
                          You
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <p className="text-white text-sm font-medium">{currentUser.login}</p>
                      </div>
                      {!isVideoEnabled && currentCallType === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                          <div className="text-center">
                            <VideoCameraSlash size={48} weight="duotone" className="text-white mx-auto mb-2" />
                            <p className="text-white text-sm">Video Off</p>
                          </div>
                        </div>
                      )}
                      {!isAudioEnabled && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="destructive" className="gap-1">
                            <MicrophoneSlash size={14} weight="fill" />
                            Muted
                          </Badge>
                        </div>
                      )}
                    </div>

                    {peers.map(peer => (
                      <div key={peer.userId} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        {peer.callType === 'video' && peer.stream ? (
                          <video
                            ref={el => {
                              if (el) remoteVideoRefs.current.set(peer.userId, el)
                            }}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCircle size={80} weight="duotone" className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <p className="text-white text-sm font-medium">{peer.userName}</p>
                        </div>
                        {!peer.stream && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <div className="text-center">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2 animate-pulse" />
                              <p className="text-muted-foreground text-sm">Connecting...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Button
                          onClick={toggleAudio}
                          variant={isAudioEnabled ? 'outline' : 'destructive'}
                          size="lg"
                          className="gap-2"
                        >
                          {isAudioEnabled ? (
                            <>
                              <Microphone size={20} weight="fill" />
                              Mute
                            </>
                          ) : (
                            <>
                              <MicrophoneSlash size={20} weight="fill" />
                              Unmute
                            </>
                          )}
                        </Button>

                        {currentCallType === 'video' && (
                          <Button
                            onClick={toggleVideo}
                            variant={isVideoEnabled ? 'outline' : 'destructive'}
                            size="lg"
                            className="gap-2"
                          >
                            {isVideoEnabled ? (
                              <>
                                <VideoCameraIcon size={20} weight="fill" />
                                Stop Video
                              </>
                            ) : (
                              <>
                                <VideoCameraSlash size={20} weight="fill" />
                                Start Video
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          onClick={handleEndCall}
                          variant="destructive"
                          size="lg"
                          className="gap-2"
                        >
                          <PhoneDisconnect size={20} weight="fill" />
                          Leave Call
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          {!isRecording ? (
                            <Button
                              onClick={handleStartRecording}
                              variant="default"
                              size="lg"
                              className="gap-2"
                            >
                              <Record size={20} weight="fill" />
                              Start Recording
                            </Button>
                          ) : (
                            <>
                              {isPaused ? (
                                <Button
                                  onClick={handleResumeRecording}
                                  variant="default"
                                  size="lg"
                                  className="gap-2"
                                >
                                  <Play size={20} weight="fill" />
                                  Resume Recording
                                </Button>
                              ) : (
                                <Button
                                  onClick={handlePauseRecording}
                                  variant="outline"
                                  size="lg"
                                  className="gap-2"
                                >
                                  <Pause size={20} weight="fill" />
                                  Pause Recording
                                </Button>
                              )}
                              <Button
                                onClick={handleStopRecording}
                                variant="destructive"
                                size="lg"
                                className="gap-2"
                              >
                                <Stop size={20} weight="fill" />
                                Stop Recording
                              </Button>
                            </>
                          )}
                        </div>
                        {isRecording && (
                          <p className="text-center text-sm text-muted-foreground mt-3">
                            Recording: {formatRecordingDuration(recordingDuration)}
                            {isPaused && ' (Paused)'}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recordings" className="mt-6">
              <CallRecordingsViewer
                recordings={recordings}
                onDelete={deleteRecording}
                onDownload={downloadRecording}
                getRecordingBlob={getRecordingBlob}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert>
        <Info size={20} weight="duotone" />
        <AlertDescription>
          <p className="font-medium mb-1">Group Video Call Features:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Support for 3+ participants in the same call</li>
            <li>Grid view shows all participants simultaneously</li>
            <li>Toggle your audio and video independently</li>
            <li>Record calls with start/pause/stop controls</li>
            <li>Playback recordings with full video and audio controls</li>
            <li>Download recordings for offline viewing</li>
            <li>See real-time status of all participants</li>
            <li>Peer-to-peer connections for optimal quality</li>
            <li>Your browser will request camera/microphone permissions when joining</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
