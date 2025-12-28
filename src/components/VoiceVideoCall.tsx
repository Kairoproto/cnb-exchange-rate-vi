import { useEffect, useRef } from 'react'
import { useWebRTC, type CallType } from '@/hooks/use-webrtc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Phone, 
  PhoneDisconnect, 
  VideoCamera, 
  Microphone, 
  MicrophoneSlash, 
  VideoCamera as VideoCameraIcon,
  VideoCameraSlash,
  UserCircle,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface VoiceVideoCallProps {
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

export function VoiceVideoCall({ watchlistId, watchlistMembers, currentUser }: VoiceVideoCallProps) {
  const {
    localStream,
    peers,
    callStatus,
    incomingCall,
    currentCallType,
    isAudioEnabled,
    isVideoEnabled,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(watchlistId, currentUser)

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
    if (incomingCall) {
      toast.info(`Incoming ${incomingCall.callType} call from ${incomingCall.userName}`, {
        duration: 30000,
        action: {
          label: 'View',
          onClick: () => {},
        },
      })
    }
  }, [incomingCall])

  const handleStartCall = async (userId: string, callType: CallType) => {
    const member = watchlistMembers.find(m => m.userId === userId)
    if (!member) return

    try {
      await startCall(userId, member.userName, member.userAvatar, callType)
      toast.success(`Calling ${member.userName}...`)
    } catch (error) {
      toast.error('Failed to start call. Please check your camera/microphone permissions.')
    }
  }

  const handleAcceptCall = async () => {
    if (!incomingCall) return
    try {
      await acceptCall(incomingCall)
      toast.success('Call connected')
    } catch (error) {
      toast.error('Failed to accept call. Please check your camera/microphone permissions.')
    }
  }

  const handleRejectCall = () => {
    rejectCall()
    toast.info('Call rejected')
  }

  const handleEndCall = () => {
    endCall()
    toast.info('Call ended')
  }

  if (!watchlistId) {
    return (
      <Alert>
        <Info size={20} weight="duotone" />
        <AlertDescription>
          Select a shared watchlist to enable voice and video calls with team members.
        </AlertDescription>
      </Alert>
    )
  }

  const availableMembers = watchlistMembers.filter(m => m.userId !== currentUser.login)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone size={24} weight="duotone" />
                Voice & Video Calls
              </CardTitle>
              <CardDescription>
                Real-time communication with team members
              </CardDescription>
            </div>
            {callStatus !== 'idle' && (
              <Badge variant={callStatus === 'connected' ? 'default' : 'secondary'} className="gap-1">
                <div className={callStatus === 'connected' ? 'w-2 h-2 rounded-full bg-green-500 animate-pulse' : ''} />
                {callStatus === 'calling' && 'Calling...'}
                {callStatus === 'ringing' && 'Ringing...'}
                {callStatus === 'connected' && 'Connected'}
                {callStatus === 'ended' && 'Call Ended'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {incomingCall && (
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
                        Incoming {incomingCall.callType} call
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAcceptCall} size="lg" className="gap-2">
                      {incomingCall.callType === 'video' ? (
                        <VideoCamera size={20} weight="fill" />
                      ) : (
                        <Phone size={20} weight="fill" />
                      )}
                      Accept
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
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Team Members</h3>
              {availableMembers.length === 0 ? (
                <Alert>
                  <Info size={20} weight="duotone" />
                  <AlertDescription>
                    No other team members are in this watchlist. Invite members to enable calls.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-3">
                  {availableMembers.map(member => (
                    <Card key={member.userId}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.userAvatar} />
                              <AvatarFallback>
                                {member.userName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.userName}</p>
                              <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleStartCall(member.userId, 'voice')}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Phone size={18} weight="duotone" />
                              Voice
                            </Button>
                            <Button
                              onClick={() => handleStartCall(member.userId, 'video')}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <VideoCamera size={18} weight="duotone" />
                              Video
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {(callStatus !== 'idle' || localStream) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
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
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <p className="text-white text-sm font-medium">You</p>
                  </div>
                  {!isVideoEnabled && currentCallType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <VideoCameraSlash size={48} weight="duotone" className="text-white" />
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
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <p className="text-white text-sm font-medium">{peer.userName}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3">
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
                  End Call
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info size={20} weight="duotone" />
        <AlertDescription>
          <p className="font-medium mb-1">How Voice & Video Calls Work:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Select a team member and click Voice or Video to start a call</li>
            <li>The recipient will see an incoming call notification</li>
            <li>Once connected, you can toggle audio/video or end the call anytime</li>
            <li>Calls use peer-to-peer WebRTC technology for low latency</li>
            <li>Your browser will request microphone/camera permissions when starting a call</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
