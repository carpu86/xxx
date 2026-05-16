import { motion } from 'motion/react'
import { GirlCard } from '@/src/components/GirlCard'
import { GirlSlot } from '@/src/lib/api'

interface HomeProps {
  girls: GirlSlot[]
  onSelectGirl: (id: string) => void
  onCreateGirl: () => void
}

export function Home({ girls, onSelectGirl, onCreateGirl }: HomeProps) {
  const emptySlots = Math.max(0, 9 - girls.length)

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Deine Begleiterinnen</h2>
          <p className="text-sm text-neutral-400">Bis zu 9 Slots verfügbar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {girls.map((girl, index) => (
          <motion.div
            key={girl.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <GirlCard girl={girl} onClick={() => onSelectGirl(girl.id)} />
          </motion.div>
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <button
            key={`slot-${index}`}
            onClick={onCreateGirl}
            className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/40 text-sm text-neutral-300 hover:border-violet-500 hover:text-violet-300"
          >
            + Neue Begleiterin
          </button>
        ))}
      </div>
    </div>
  )
}
