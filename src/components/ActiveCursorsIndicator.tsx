import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Cursor, Users } from '@phosphor-icons/react'
import { CursorPosition } from '@/hooks/use-cursor-tracking'
import { motion, AnimatePresence } from 'framer-motion'

interface ActiveCursorsIndicatorProps {
  cursors: CursorPosition[]
}

export function ActiveCursorsIndicator({ cursors }: ActiveCursorsIndicatorProps) {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    if (cursors.length > 0) {
      setVisible(true)
    } else {
      const timeout = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [cursors.length])

  if (!visible) return null

  const uniqueUsers = Array.from(
    new Map(cursors.map(c => [c.userId, c])).values()
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-4 right-4 z-50"
      >
        <Card className="shadow-xl border-primary/20 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Cursor size={20} weight="duotone" className="text-primary" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {uniqueUsers.length} Active {uniqueUsers.length === 1 ? 'User' : 'Users'}
                  </span>
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                  </div>
                </div>
                
                <div className="flex -space-x-2 mt-1">
                  {uniqueUsers.slice(0, 5).map((cursor) => {
                    const initials = cursor.userName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                    
                    return (
                      <Avatar
                        key={cursor.userId}
                        className="w-6 h-6 border-2 border-card"
                        title={cursor.userName}
                      >
                        <AvatarImage src={cursor.userAvatar} alt={cursor.userName} />
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {uniqueUsers.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-semibold">
                      +{uniqueUsers.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
