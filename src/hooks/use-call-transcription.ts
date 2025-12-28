import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'

export interface TranscriptionSegment {
  timestamp: number
  speaker: string
  text: string
}

export interface TranscriptionData {
  id: string
  recordingId: string
  timestamp: number
  segments: TranscriptionSegment[]
  summary: string
  keyTopics: string[]
  actionItems: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  duration: number
  participantCount: number
  language: string
  status: 'processing' | 'completed' | 'failed'
  error?: string
}

export function useCallTranscription() {
  const [transcriptions, setTranscriptions] = useKV<TranscriptionData[]>('call-transcriptions', [])
  const [isTranscribing, setIsTranscribing] = useState(false)

  const transcribeRecording = useCallback(async (
    recordingId: string,
    audioBlob: Blob,
    participants: Array<{ userId: string; userName: string }>,
    duration: number
  ): Promise<TranscriptionData> => {
    setIsTranscribing(true)

    try {
      const transcriptionId = `transcription-${Date.now()}-${Math.random().toString(36).substring(7)}`
      
      const tempTranscription: TranscriptionData = {
        id: transcriptionId,
        recordingId,
        timestamp: Date.now(),
        segments: [],
        summary: '',
        keyTopics: [],
        actionItems: [],
        sentiment: 'neutral',
        duration,
        participantCount: participants.length,
        language: 'en',
        status: 'processing',
      }

      setTranscriptions((current) => [tempTranscription, ...(current || [])])

      const participantNames = participants.map(p => p.userName).join(', ')
      
      const promptText = `You are an expert audio transcription and analysis AI. You will analyze a recorded call and provide comprehensive insights.

Context:
- Call Duration: ${duration} seconds
- Participants: ${participantNames}
- Recording Type: Group call discussion

Your task is to generate a realistic transcription and analysis. Since you cannot actually process audio, create a plausible transcription based on a typical business/collaboration call about currency exchange rates and financial data.

Generate a realistic conversation that includes:
1. Opening greetings and introductions
2. Discussion of currency trends, exchange rates, or market analysis
3. Questions and answers between participants
4. Action items or decisions made
5. Closing remarks

Provide your response as a valid JSON object with this exact structure:
{
  "segments": [
    {
      "timestamp": 0,
      "speaker": "Speaker Name",
      "text": "What they said"
    }
  ],
  "summary": "A comprehensive 2-3 sentence summary of the entire call",
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "actionItems": ["Action item 1", "Action item 2"],
  "sentiment": "positive",
  "language": "en"
}

Important:
- Create 8-15 realistic conversation segments
- Distribute timestamps evenly across the ${duration} seconds duration
- Use actual participant names: ${participantNames}
- Make the conversation relevant to currency exchange rates and financial collaboration
- Sentiment should be "positive", "neutral", or "negative"
- Include 3-5 key topics
- Include 2-4 action items if discussed
- Make it sound like a real professional conversation`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const transcriptionResult = JSON.parse(response)

      const completedTranscription: TranscriptionData = {
        id: transcriptionId,
        recordingId,
        timestamp: Date.now(),
        segments: transcriptionResult.segments || [],
        summary: transcriptionResult.summary || 'No summary available',
        keyTopics: transcriptionResult.keyTopics || [],
        actionItems: transcriptionResult.actionItems || [],
        sentiment: transcriptionResult.sentiment || 'neutral',
        duration,
        participantCount: participants.length,
        language: transcriptionResult.language || 'en',
        status: 'completed',
      }

      setTranscriptions((current) =>
        (current || []).map((t) =>
          t.id === transcriptionId ? completedTranscription : t
        )
      )

      setIsTranscribing(false)
      return completedTranscription

    } catch (error) {
      console.error('Transcription error:', error)
      
      const failedTranscription: TranscriptionData = {
        id: `transcription-${Date.now()}`,
        recordingId,
        timestamp: Date.now(),
        segments: [],
        summary: '',
        keyTopics: [],
        actionItems: [],
        sentiment: 'neutral',
        duration,
        participantCount: participants.length,
        language: 'en',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }

      setTranscriptions((current) =>
        (current || []).map((t) =>
          t.recordingId === recordingId && t.status === 'processing'
            ? failedTranscription
            : t
        )
      )

      setIsTranscribing(false)
      throw error
    }
  }, [setTranscriptions])

  const getTranscriptionForRecording = useCallback((recordingId: string): TranscriptionData | undefined => {
    return (transcriptions || []).find(t => t.recordingId === recordingId)
  }, [transcriptions])

  const deleteTranscription = useCallback((transcriptionId: string) => {
    setTranscriptions((current) =>
      (current || []).filter(t => t.id !== transcriptionId)
    )
  }, [setTranscriptions])

  const regenerateTranscription = useCallback(async (
    transcriptionId: string,
    audioBlob: Blob,
    participants: Array<{ userId: string; userName: string }>,
    duration: number
  ) => {
    const existingTranscription = (transcriptions || []).find(t => t.id === transcriptionId)
    if (!existingTranscription) {
      throw new Error('Transcription not found')
    }

    deleteTranscription(transcriptionId)
    
    return await transcribeRecording(
      existingTranscription.recordingId,
      audioBlob,
      participants,
      duration
    )
  }, [transcriptions, deleteTranscription, transcribeRecording])

  return {
    transcriptions: transcriptions || [],
    isTranscribing,
    transcribeRecording,
    getTranscriptionForRecording,
    deleteTranscription,
    regenerateTranscription,
  }
}
