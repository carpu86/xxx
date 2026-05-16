import { motion } from 'motion/react'
import { GirlSlot } from '@/src/lib/api'

interface GirlCardProps {
  girl: GirlSlot
  onClick: () => void
}

export function GirlCard({ girl, onClick }: GirlCardProps) {
  const initials = girl.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-left"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-semibold text-white">
            {initials || 'LK'}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-neutral-900 ${
              girl.online ? 'bg-emerald-500' : 'bg-neutral-600'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-neutral-100">{girl.name}</div>
          <div className="text-xs text-neutral-400">Mood {girl.moodEmoji}</div>
        </div>
        {girl.unreadCount > 0 && (
          <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs font-semibold text-white">{girl.unreadCount}</span>
        )}
      </div>
      <p className="truncate text-xs text-neutral-400">{girl.lastMessage}</p>
    </motion.button>
  )
}
