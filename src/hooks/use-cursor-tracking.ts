import { useState, useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'

export interface CursorPosition {
  userId: string
  userName: string
  userAvatar: string
  x: number
  y: number
  timestamp: number
  watchlistId: string
}

export interface CursorData {
  [userId: string]: CursorPosition
}

export function useCursorTracking(watchlistId: string | null, isActive: boolean) {
  const [cursors, setCursors] = useKV<CursorData>(`cursor-positions-${watchlistId}`, {})
  const [localCursor, setLocalCursor] = useState<{ x: number; y: number } | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; login: string; avatarUrl: string } | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const user = await window.spark.user()
      if (user) {
        setCurrentUser({
          id: String(user.id),
          login: user.login,
          avatarUrl: user.avatarUrl
        })
      }
    }
    loadUser()
  }, [])

  const updateCursorPosition = useCallback((x: number, y: number) => {
    if (!watchlistId || !isActive || !currentUser) return

    const now = Date.now()
    
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }

    throttleTimeoutRef.current = setTimeout(() => {
      setCursors(current => ({
        ...current,
        [currentUser.id]: {
          userId: currentUser.id,
          userName: currentUser.login,
          userAvatar: currentUser.avatarUrl,
          x,
          y,
          timestamp: now,
          watchlistId
        }
      }))
      lastUpdateRef.current = now
    }, 50)
  }, [watchlistId, isActive, currentUser, setCursors])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!watchlistId || !isActive) return

    const x = (e.clientX / window.innerWidth) * 100
    const y = (e.clientY / window.innerHeight) * 100
    
    setLocalCursor({ x, y })
    updateCursorPosition(x, y)
  }, [watchlistId, isActive, updateCursorPosition])

  useEffect(() => {
    if (!watchlistId || !isActive) return

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
    }
  }, [watchlistId, isActive, handleMouseMove])

  useEffect(() => {
    if (!watchlistId || !isActive || !currentUser) return

    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      const timeout = 5000
      
      setCursors(current => {
        const currentCursors = current || {}
        const updated = { ...currentCursors }
        let hasChanges = false
        
        Object.keys(updated).forEach(userId => {
          if (now - updated[userId].timestamp > timeout) {
            delete updated[userId]
            hasChanges = true
          }
        })
        
        return hasChanges ? updated : currentCursors
      })
    }, 2000)

    return () => clearInterval(cleanupInterval)
  }, [watchlistId, isActive, currentUser, setCursors])

  useEffect(() => {
    return () => {
      if (watchlistId && currentUser) {
        setCursors(current => {
          const updated = { ...current }
          delete updated[currentUser.id]
          return updated
        })
      }
    }
  }, [watchlistId, currentUser, setCursors])

  const otherCursors = currentUser
    ? Object.values(cursors || {}).filter(cursor => cursor.userId !== currentUser.id)
    : []

  return {
    cursors: otherCursors,
    localCursor,
    updateCursorPosition
  }
}
