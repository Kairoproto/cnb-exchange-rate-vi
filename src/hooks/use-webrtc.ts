import { useState, useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'

export type CallType = 'voice' | 'video'
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

export interface PeerConnection {
  userId: string
  userName: string
  userAvatar: string
  stream: MediaStream | null
  peerConnection: RTCPeerConnection | null
  callType: CallType
}

export interface CallSignal {
  from: string
  to: string
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end' | 'group-call-start' | 'group-call-join' | 'group-call-leave'
  data?: any
  callType?: CallType
  userName?: string
  userAvatar?: string
  timestamp: number
  roomId?: string
  participants?: string[]
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export function useWebRTC(watchlistId: string | null, currentUser: { login: string; avatarUrl: string }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map())
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [incomingCall, setIncomingCall] = useState<CallSignal | null>(null)
  const [currentCallType, setCurrentCallType] = useState<CallType>('voice')
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [groupRoomId, setGroupRoomId] = useState<string | null>(null)
  const [groupParticipants, setGroupParticipants] = useState<string[]>([])
  
  const [signals, setSignals] = useKV<CallSignal[]>(`webrtc-signals-${watchlistId}`, [])
  const processedSignalsRef = useRef<Set<number>>(new Set())
  const peersRef = useRef<Map<string, PeerConnection>>(new Map())

  peersRef.current = peers

  const startLocalMedia = useCallback(async (callType: CallType) => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setLocalStream(stream)
      setCurrentCallType(callType)
      setIsAudioEnabled(true)
      setIsVideoEnabled(callType === 'video')
      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw error
    }
  }, [])

  const stopLocalMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
  }, [localStream])

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [localStream])

  const toggleVideo = useCallback(() => {
    if (localStream && currentCallType === 'video') {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream, currentCallType])

  const sendSignal = useCallback(async (signal: Omit<CallSignal, 'timestamp'>) => {
    const newSignal = { ...signal, timestamp: Date.now() }
    setSignals((current) => [...(current || []), newSignal])
  }, [setSignals])

  const createPeerConnection = useCallback((userId: string, userName: string, userAvatar: string, callType: CallType) => {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    
    const peerConnection: PeerConnection = {
      userId,
      userName,
      userAvatar,
      stream: null,
      peerConnection: pc,
      callType,
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          from: currentUser.login,
          to: userId,
          type: 'ice-candidate',
          data: event.candidate.toJSON(),
        })
      }
    }

    pc.ontrack = (event) => {
      peerConnection.stream = event.streams[0]
      setPeers((current) => new Map(current).set(userId, { ...peerConnection }))
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected')
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall(userId)
      }
    }

    return peerConnection
  }, [currentUser.login, sendSignal])

  const startCall = useCallback(async (targetUserId: string, targetUserName: string, targetUserAvatar: string, callType: CallType) => {
    try {
      setCallStatus('calling')
      const stream = await startLocalMedia(callType)
      
      const peerConnection = createPeerConnection(targetUserId, targetUserName, targetUserAvatar, callType)
      
      stream.getTracks().forEach(track => {
        peerConnection.peerConnection?.addTrack(track, stream)
      })

      const offer = await peerConnection.peerConnection?.createOffer()
      await peerConnection.peerConnection?.setLocalDescription(offer!)
      
      setPeers((current) => new Map(current).set(targetUserId, peerConnection))
      
      await sendSignal({
        from: currentUser.login,
        to: targetUserId,
        type: 'call-request',
        data: offer,
        callType,
        userName: currentUser.login,
        userAvatar: currentUser.avatarUrl,
      })
    } catch (error) {
      console.error('Error starting call:', error)
      setCallStatus('idle')
      stopLocalMedia()
    }
  }, [currentUser, createPeerConnection, startLocalMedia, stopLocalMedia, sendSignal])

  const acceptCall = useCallback(async (signal: CallSignal) => {
    try {
      setCallStatus('connected')
      setIncomingCall(null)
      
      const stream = await startLocalMedia(signal.callType || 'voice')
      
      const peerConnection = createPeerConnection(
        signal.from,
        signal.userName || signal.from,
        signal.userAvatar || '',
        signal.callType || 'voice'
      )
      
      if (peerConnection.peerConnection) {
        stream.getTracks().forEach(track => {
          peerConnection.peerConnection!.addTrack(track, stream)
        })

        await peerConnection.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
      }
      
      const answer = await peerConnection.peerConnection?.createAnswer()
      await peerConnection.peerConnection?.setLocalDescription(answer!)
      
      setPeers((current) => new Map(current).set(signal.from, peerConnection))
      
      await sendSignal({
        from: currentUser.login,
        to: signal.from,
        type: 'call-accept',
        data: answer,
      })
    } catch (error) {
      console.error('Error accepting call:', error)
      rejectCall()
    }
  }, [currentUser.login, createPeerConnection, startLocalMedia, sendSignal])

  const rejectCall = useCallback(async () => {
    if (incomingCall) {
      await sendSignal({
        from: currentUser.login,
        to: incomingCall.from,
        type: 'call-reject',
      })
      setIncomingCall(null)
      setCallStatus('idle')
    }
  }, [incomingCall, currentUser.login, sendSignal])

  const endCall = useCallback(async (userId?: string) => {
    if (userId) {
      const peer = peersRef.current.get(userId)
      if (peer) {
        peer.peerConnection?.close()
        peer.stream?.getTracks().forEach(track => track.stop())
        
        await sendSignal({
          from: currentUser.login,
          to: userId,
          type: 'call-end',
        })
        
        setPeers((current) => {
          const newPeers = new Map(current)
          newPeers.delete(userId)
          return newPeers
        })
      }
    } else {
      if (groupRoomId) {
        groupParticipants.forEach(participantId => {
          if (participantId !== currentUser.login) {
            sendSignal({
              from: currentUser.login,
              to: participantId,
              type: 'group-call-leave',
              roomId: groupRoomId,
            })
          }
        })
        setGroupRoomId(null)
        setGroupParticipants([])
      }
      
      peersRef.current.forEach((peer, peerId) => {
        peer.peerConnection?.close()
        peer.stream?.getTracks().forEach(track => track.stop())
        
        sendSignal({
          from: currentUser.login,
          to: peerId,
          type: 'call-end',
        })
      })
      
      setPeers(new Map())
    }
    
    stopLocalMedia()
    setCallStatus('ended')
    setTimeout(() => setCallStatus('idle'), 1000)
  }, [currentUser.login, stopLocalMedia, sendSignal, groupRoomId, groupParticipants])

  const startGroupCall = useCallback(async (participantIds: string[], participantData: Array<{userId: string, userName: string, userAvatar: string}>, callType: CallType) => {
    try {
      const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(7)}`
      setGroupRoomId(roomId)
      setGroupParticipants([currentUser.login, ...participantIds])
      setCallStatus('calling')
      
      const stream = await startLocalMedia(callType)
      
      for (const participantId of participantIds) {
        const participantInfo = participantData.find(p => p.userId === participantId)
        if (!participantInfo) continue
        
        const peerConnection = createPeerConnection(participantId, participantInfo.userName, participantInfo.userAvatar, callType)
        
        stream.getTracks().forEach(track => {
          peerConnection.peerConnection?.addTrack(track, stream)
        })

        const offer = await peerConnection.peerConnection?.createOffer()
        await peerConnection.peerConnection?.setLocalDescription(offer!)
        
        setPeers((current) => new Map(current).set(participantId, peerConnection))
        
        await sendSignal({
          from: currentUser.login,
          to: participantId,
          type: 'group-call-start',
          data: offer,
          callType,
          userName: currentUser.login,
          userAvatar: currentUser.avatarUrl,
          roomId,
          participants: [currentUser.login, ...participantIds],
        })
      }
      
      setCallStatus('connected')
    } catch (error) {
      console.error('Error starting group call:', error)
      setCallStatus('idle')
      stopLocalMedia()
    }
  }, [currentUser, createPeerConnection, startLocalMedia, stopLocalMedia, sendSignal])

  const joinGroupCall = useCallback(async (signal: CallSignal) => {
    try {
      setCallStatus('connected')
      setIncomingCall(null)
      setGroupRoomId(signal.roomId || null)
      setGroupParticipants(signal.participants || [])
      
      const stream = await startLocalMedia(signal.callType || 'voice')
      
      const peerConnection = createPeerConnection(
        signal.from,
        signal.userName || signal.from,
        signal.userAvatar || '',
        signal.callType || 'voice'
      )
      
      if (peerConnection.peerConnection) {
        stream.getTracks().forEach(track => {
          peerConnection.peerConnection!.addTrack(track, stream)
        })

        await peerConnection.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
      }
      
      const answer = await peerConnection.peerConnection?.createAnswer()
      await peerConnection.peerConnection?.setLocalDescription(answer!)
      
      setPeers((current) => new Map(current).set(signal.from, peerConnection))
      
      await sendSignal({
        from: currentUser.login,
        to: signal.from,
        type: 'group-call-join',
        data: answer,
        roomId: signal.roomId,
      })
      
      const otherParticipants = (signal.participants || []).filter(p => p !== signal.from && p !== currentUser.login)
      for (const participantId of otherParticipants) {
        const newPeerConnection = createPeerConnection(participantId, participantId, '', signal.callType || 'voice')
        
        stream.getTracks().forEach(track => {
          newPeerConnection.peerConnection?.addTrack(track, stream)
        })

        const offer = await newPeerConnection.peerConnection?.createOffer()
        await newPeerConnection.peerConnection?.setLocalDescription(offer!)
        
        setPeers((current) => new Map(current).set(participantId, newPeerConnection))
        
        await sendSignal({
          from: currentUser.login,
          to: participantId,
          type: 'call-request',
          data: offer,
          callType: signal.callType,
          userName: currentUser.login,
          userAvatar: currentUser.avatarUrl,
        })
      }
    } catch (error) {
      console.error('Error joining group call:', error)
      rejectCall()
    }
  }, [currentUser, createPeerConnection, startLocalMedia, sendSignal, rejectCall])

  useEffect(() => {
    if (!watchlistId || !signals) return

    const processSignals = async () => {
      if (!signals) return
      
      for (const signal of signals) {
        if (processedSignalsRef.current.has(signal.timestamp)) continue
        if (signal.to !== currentUser.login) continue
        if (Date.now() - signal.timestamp > 60000) continue

        processedSignalsRef.current.add(signal.timestamp)

        try {
          switch (signal.type) {
            case 'call-request':
              if (callStatus === 'idle') {
                setIncomingCall(signal)
                setCallStatus('ringing')
              }
              break

            case 'group-call-start':
              if (callStatus === 'idle' || callStatus === 'ringing') {
                setIncomingCall(signal)
                setCallStatus('ringing')
              }
              break

            case 'group-call-join':
              const joinPeer = peersRef.current.get(signal.from)
              if (joinPeer?.peerConnection) {
                await joinPeer.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
              }
              break

            case 'group-call-leave':
              endCall(signal.from)
              break

            case 'call-accept':
              const peer = peersRef.current.get(signal.from)
              if (peer?.peerConnection) {
                await peer.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
                setCallStatus('connected')
              }
              break

            case 'ice-candidate':
              const candidatePeer = peersRef.current.get(signal.from)
              if (candidatePeer?.peerConnection) {
                await candidatePeer.peerConnection.addIceCandidate(new RTCIceCandidate(signal.data))
              }
              break

            case 'call-reject':
              endCall(signal.from)
              break

            case 'call-end':
              endCall(signal.from)
              break
          }
        } catch (error) {
          console.error('Error processing signal:', error)
        }
      }
    }

    processSignals()
  }, [signals, watchlistId, currentUser.login, callStatus, endCall, joinGroupCall])

  useEffect(() => {
    const cleanup = setInterval(() => {
      if (watchlistId && signals) {
        const cutoff = Date.now() - 120000
        setSignals((current) => (current || []).filter(s => s.timestamp > cutoff))
      }
    }, 30000)

    return () => clearInterval(cleanup)
  }, [watchlistId, signals, setSignals])

  useEffect(() => {
    return () => {
      stopLocalMedia()
      peersRef.current.forEach(peer => {
        peer.peerConnection?.close()
        peer.stream?.getTracks().forEach(track => track.stop())
      })
    }
  }, [stopLocalMedia])

  return {
    localStream,
    peers: Array.from(peers.values()),
    callStatus,
    incomingCall,
    currentCallType,
    isAudioEnabled,
    isVideoEnabled,
    groupRoomId,
    groupParticipants,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startGroupCall,
    joinGroupCall,
  }
}
