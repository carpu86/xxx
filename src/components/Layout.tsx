import { Home, MessageCircle, PlusCircle, Radio } from 'lucide-react'
import { ReactNode } from 'react'

export type NavPage = 'home' | 'chat' | 'create' | 'stream'

interface LayoutProps {
  page: NavPage
  setPage: (page: NavPage) => void
  children: ReactNode
}

const navItems: Array<{ key: NavPage; label: string; icon: typeof Home }> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'create', label: 'Neu', icon: PlusCircle },
  { key: 'stream', label: 'Stream', icon: Radio },
]

export function Layout({ page, setPage, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-neutral-800 bg-neutral-900/40 p-4 md:block">
        <div className="mb-6 text-lg font-semibold">Lana KI</div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = page === item.key
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  active ? 'bg-violet-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="pb-16 md:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-neutral-800 bg-neutral-900/95 p-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = page === item.key
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs ${
                active ? 'text-violet-400' : 'text-neutral-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
