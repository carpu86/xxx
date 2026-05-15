import { useCallback, useEffect, useRef, useState } from 'react'
import { api, CharacterSheet, createWebSocket, GirlSlot } from './api'

export interface AuthState {
  token: string | null
  userId: string | null
  tier: string | null
}

export interface ChatMessage {
  id: string
  girlId: string
  sender: 'user' | 'girl'
  text: string
  timestamp: number
}

const uid = () => Math.random().toString(36).slice(2)

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: localStorage.getItem('lana_token'),
    userId: localStorage.getItem('lana_user_id'),
    tier: localStorage.getItem('lana_tier'),
  }))

  const login = useCallback(async (token: string) => {
    const response = await api.login(token)
    if (!response.ok) {
      throw new Error('Login fehlgeschlagen')
    }

    const data = await response.json().catch(() => ({}))
    const userId = data.user_id ?? data.userId ?? 'lana-user'
    const tier = data.tier ?? 'free'

    localStorage.setItem('lana_token', token)
    localStorage.setItem('lana_user_id', userId)
    localStorage.setItem('lana_tier', tier)
    setAuth({ token, userId, tier })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('lana_token')
    localStorage.removeItem('lana_user_id')
    localStorage.removeItem('lana_tier')
    setAuth({ token: null, userId: null, tier: null })
  }, [])

  return { ...auth, login, logout }
}

export function useGirls() {
  const [girls, setGirls] = useState<GirlSlot[]>([])
  const [activeGirlId, setActiveGirl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    api.getGirls()
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!mounted) return
        const list = Array.isArray(data) ? data : data.girls ?? []
        const mapped = list.map((girl: Partial<GirlSlot>) => ({
          id: girl.id ?? uid(),
          name: girl.name ?? 'Neue Begleiterin',
          moodEmoji: girl.moodEmoji ?? '✨',
          online: Boolean(girl.online),
          lastMessage: girl.lastMessage ?? 'Sag hallo 👋',
          unreadCount: girl.unreadCount ?? 0,
        }))
        setGirls(mapped)
        if (mapped.length > 0) {
          setActiveGirl((current) => current ?? mapped[0].id)
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  const createGirl = useCallback(async (sheet: CharacterSheet) => {
    if (sheet.age < 18) return null

    const response = await api.createGirl(sheet)
    const data = await response.json().catch(() => ({}))
    const created: GirlSlot = {
      id: data.id ?? uid(),
      name: data.name ?? sheet.name,
      moodEmoji: data.moodEmoji ?? '💜',
      online: Boolean(data.online ?? true),
      lastMessage: data.lastMessage ?? 'Ich bin bereit ✨',
      unreadCount: 0,
    }

    setGirls((prev) => [...prev.slice(0, 8), created])
    setActiveGirl(created.id)
    return created
  }, [])

  const updateGirl = useCallback((id: string, patch: Partial<GirlSlot>) => {
    setGirls((prev) => prev.map((girl) => (girl.id === id ? { ...girl, ...patch } : girl)))
  }, [])

  return { girls, createGirl, updateGirl, activeGirlId, setActiveGirl }
}

export function useChat(activeGirlId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = useCallback(
    async (message: string) => {
      if (!activeGirlId || !message.trim()) return

      const userMessage: ChatMessage = {
        id: uid(),
        girlId: activeGirlId,
        sender: 'user',
        text: message,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMessage])

      setIsTyping(true)
      try {
        const response = await api.sendMessage(activeGirlId, message)
        const data = await response.json().catch(() => ({}))
        const girlMessage: ChatMessage = {
          id: uid(),
          girlId: activeGirlId,
          sender: 'girl',
          text: data.reply ?? data.message ?? 'Ich bin bei dir 💜',
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, girlMessage])
      } finally {
        setIsTyping(false)
      }
    },
    [activeGirlId],
  )

  return {
    messages: messages.filter((message) => message.girlId === activeGirlId),
    sendMessage,
    isTyping,
    pushMessage: (message: ChatMessage) => setMessages((prev) => [...prev, message]),
  }
}

export function useWebSocket(userId: string | null, onMessage: (message: ChatMessage) => void) {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    let active = true

    const connect = () => {
      const socket = createWebSocket(userId)
      socketRef.current = socket

      socket.onopen = () => {
        reconnectRef.current = 0
        setIsConnected(true)
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (!data?.girl_id || !data?.message) return
          onMessage({
            id: uid(),
            girlId: data.girl_id,
            sender: 'girl',
            text: data.message,
            timestamp: Date.now(),
          })
        } catch {
          // ignore malformed payloads
        }
      }

      socket.onclose = () => {
        setIsConnected(false)
        if (!active) return

        const delay = Math.min(1000 * 2 ** reconnectRef.current, 30000)
        reconnectRef.current += 1
        timeoutRef.current = window.setTimeout(connect, delay)
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    connect()

    return () => {
      active = false
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [onMessage, userId])

  return { isConnected }
}
