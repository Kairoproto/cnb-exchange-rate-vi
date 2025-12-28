import { useState, useRef, useCallback, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

export interface Recording {
  id: string
  timestamp: number
  duration: number
  blob: Blob
  blobUrl: string
  participantCount: number
  callType: 'voice' | 'video'
  roomId: string
  participants: Array<{
    userId: string
    userName: string
  }>
}

export interface RecordingMetadata {
  id: string
  timestamp: number
  duration: number
  participantCount: number
  callType: 'voice' | 'video'
  roomId: string
  participants: Array<{
    userId: string
    userName: string
  }>
  size: number
}

export function useCallRecording(roomId: string | null) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordings, setRecordings] = useKV<RecordingMetadata[]>('call-recordings-metadata', [])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<number | null>(null)
  const currentRecordingIdRef = useRef<string>('')
  const recordedBlobsRef = useRef<Map<string, Blob>>(new Map())

  const startRecording = useCallback(async (
    localStream: MediaStream | null,
    remoteStreams: MediaStream[],
    participantData: Array<{ userId: string; userName: string }>,
    callType: 'voice' | 'video'
  ) => {
    try {
      if (!localStream) {
        throw new Error('No local stream available')
      }

      const audioContext = new AudioContext()
      const destination = audioContext.createMediaStreamDestination()

      const localSource = audioContext.createMediaStreamSource(localStream)
      localSource.connect(destination)

      remoteStreams.forEach(stream => {
        if (stream) {
          const remoteSource = audioContext.createMediaStreamSource(stream)
          remoteSource.connect(destination)
        }
      })

      let finalStream: MediaStream

      if (callType === 'video' && localStream.getVideoTracks().length > 0) {
        const canvas = document.createElement('canvas')
        canvas.width = 1920
        canvas.height = 1080
        const ctx = canvas.getContext('2d')!

        const videoElements: HTMLVideoElement[] = []
        const localVideo = document.createElement('video')
        localVideo.srcObject = localStream
        localVideo.muted = true
        await localVideo.play()
        videoElements.push(localVideo)

        for (const stream of remoteStreams) {
          if (stream && stream.getVideoTracks().length > 0) {
            const video = document.createElement('video')
            video.srcObject = stream
            video.muted = true
            await video.play()
            videoElements.push(video)
          }
        }

        const drawFrame = () => {
          if (!isRecording) return

          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          const gridSize = Math.ceil(Math.sqrt(videoElements.length))
          const cellWidth = canvas.width / gridSize
          const cellHeight = canvas.height / gridSize

          videoElements.forEach((video, index) => {
            const col = index % gridSize
            const row = Math.floor(index / gridSize)
            const x = col * cellWidth
            const y = row * cellHeight

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              ctx.drawImage(video, x, y, cellWidth, cellHeight)
            }
          })

          requestAnimationFrame(drawFrame)
        }

        drawFrame()

        const canvasStream = canvas.captureStream(30)
        const videoTrack = canvasStream.getVideoTracks()[0]
        
        finalStream = new MediaStream([
          videoTrack,
          ...destination.stream.getAudioTracks()
        ])
      } else {
        finalStream = destination.stream
      }

      const mimeType = callType === 'video' 
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
            ? 'video/webm;codecs=vp9' 
            : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm')

      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000,
      })

      recordedChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { 
          type: callType === 'video' ? 'video/webm' : 'audio/webm' 
        })
        
        const recordingId = currentRecordingIdRef.current
        recordedBlobsRef.current.set(recordingId, blob)

        const metadata: RecordingMetadata = {
          id: recordingId,
          timestamp: startTimeRef.current,
          duration: recordingDuration,
          participantCount: participantData.length + 1,
          callType,
          roomId: roomId || 'unknown',
          participants: participantData,
          size: blob.size,
        }

        setRecordings((current) => [metadata, ...(current || [])])
        
        recordedChunksRef.current = []
      }

      const recordingId = `recording-${Date.now()}-${Math.random().toString(36).substring(7)}`
      currentRecordingIdRef.current = recordingId

      mediaRecorder.start(100)
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setIsPaused(false)
      startTimeRef.current = Date.now()
      pausedTimeRef.current = 0

      durationIntervalRef.current = window.setInterval(() => {
        if (!isPaused) {
          setRecordingDuration((prev) => prev + 1)
        }
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      throw error
    }
  }, [roomId, setRecordings, isRecording, isPaused, recordingDuration])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      pausedTimeRef.current = Date.now()
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }, [isRecording, isPaused])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }

      setTimeout(() => {
        setRecordingDuration(0)
      }, 500)
    }
  }, [])

  const getRecordingBlob = useCallback((recordingId: string): Blob | null => {
    return recordedBlobsRef.current.get(recordingId) || null
  }, [])

  const deleteRecording = useCallback((recordingId: string) => {
    setRecordings((current) => 
      (current || []).filter(r => r.id !== recordingId)
    )
    recordedBlobsRef.current.delete(recordingId)
  }, [setRecordings])

  const downloadRecording = useCallback((recordingId: string, fileName: string) => {
    const blob = recordedBlobsRef.current.get(recordingId)
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  return {
    isRecording,
    isPaused,
    recordingDuration,
    recordings: recordings || [],
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getRecordingBlob,
    deleteRecording,
    downloadRecording,
  }
}
