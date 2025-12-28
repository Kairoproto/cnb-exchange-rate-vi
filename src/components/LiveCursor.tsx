import { motion, AnimatePresence } from 'framer-motion'
import { CursorPosition } from '@/hooks/use-cursor-tracking'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface LiveCursorProps {
  cursor: CursorPosition
}

const cursorColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-yellow-500',
]

function getColorForUser(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return cursorColors[hash % cursorColors.length]
}

export function LiveCursor({ cursor }: LiveCursorProps) {
  const color = getColorForUser(cursor.userId)
  const initials = cursor.userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        position: 'fixed',
        left: `${cursor.x}%`,
        top: `${cursor.y}%`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      className="transform -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-lg ${color.replace('bg-', 'text-')}`}
        >
          <path
            d="M5.65376 12.3673L10.6538 17.3673C11.0443 17.7578 11.6775 17.7578 12.068 17.3673L20.3317 9.10365C21.4974 7.93797 20.9362 5.95342 19.3317 5.41738L8.4146 2.09944C7.01896 1.63075 5.63075 3.01896 6.09944 4.4146L9.41738 15.3317C9.95342 16.9362 11.938 17.4974 13.1036 16.3317L5.65376 12.3673Z"
            fill="currentColor"
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-6 top-0 flex items-center gap-2 whitespace-nowrap"
        >
          <div className={`${color} text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2`}>
            <Avatar className="w-5 h-5 border-2 border-white">
              <AvatarImage src={cursor.userAvatar} alt={cursor.userName} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span>{cursor.userName}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

interface LiveCursorsOverlayProps {
  cursors: CursorPosition[]
}

export function LiveCursorsOverlay({ cursors }: LiveCursorsOverlayProps) {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {cursors.map(cursor => (
          <LiveCursor key={cursor.userId} cursor={cursor} />
        ))}
      </AnimatePresence>
    </div>
  )
}
