import { useCallback, useEffect, useMemo, useState } from 'react'
import { Layout, NavPage } from '@/src/components/Layout'
import { Login } from '@/src/pages/Login'
import { Home } from '@/src/pages/Home'
import { Chat } from '@/src/pages/Chat'
import { CreateGirl } from '@/src/pages/CreateGirl'
import { Stream } from '@/src/pages/Stream'
import { api } from '@/src/lib/api'
import { useAuth, useChat, useGirls, useWebSocket } from '@/src/lib/store'

type Page = NavPage | 'login' | 'admin'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const { token, userId, tier, login, logout } = useAuth()
  const { girls, createGirl, updateGirl, activeGirlId, setActiveGirl } = useGirls()
  const { messages, sendMessage, isTyping, pushMessage } = useChat(activeGirlId)

  useEffect(() => {
    if (token) {
      setPage('home')
    }
  }, [token])

  useWebSocket(userId, pushMessage)

  const activeGirl = useMemo(() => girls.find((girl) => girl.id === activeGirlId), [activeGirlId, girls])

  const setShellPage = useCallback((next: NavPage) => {
    setPage(next)
  }, [])

  if (!token || page === 'login') {
    return (
      <Login
        onLogin={async (nextToken) => {
          await login(nextToken)
          setPage('home')
        }}
      />
    )
  }

  return (
    <Layout page={(page === 'admin' ? 'home' : page) as NavPage} setPage={setShellPage}>
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 md:px-6">
        <div>
          <p className="text-sm font-semibold">Lana KI Companion</p>
          <p className="text-xs text-neutral-400">Tier: {tier ?? 'free'}</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:border-violet-500">
          Logout
        </button>
      </div>

      {page === 'home' && (
        <Home
          girls={girls}
          onCreateGirl={() => setPage('create')}
          onSelectGirl={(girlId) => {
            setActiveGirl(girlId)
            updateGirl(girlId, { unreadCount: 0 })
            setPage('chat')
          }}
        />
      )}

      {page === 'chat' && (
        <Chat
          girl={activeGirl}
          messages={messages}
          isTyping={isTyping}
          onBack={() => setPage('home')}
          onSend={async (message) => {
            await sendMessage(message)
            if (activeGirlId) {
              updateGirl(activeGirlId, { lastMessage: message })
            }
          }}
          onGenerateImage={async (prompt) => {
            await api.generateImage(prompt, activeGirlId ?? undefined)
          }}
        />
      )}

      {page === 'create' && (
        <CreateGirl
          onCancel={() => setPage('home')}
          onCreate={async (sheet) => {
            const created = await createGirl(sheet)
            if (created) {
              setPage('chat')
            }
          }}
        />
      )}

      {page === 'stream' && <Stream />}

      {page === 'admin' && <div className="p-6 text-sm text-neutral-300">Admin Seite folgt.</div>}
    </Layout>
  )
}
