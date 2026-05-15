export const GATEWAY = 'https://gateway.lana-ki.de'

export interface CharacterSheet {
  name: string
  age: number
  description: string
  appearance: {
    hair: string
    eyes: string
    bodyType: string
  }
  personality: string
  voice: 'kerstin' | 'thorsten'
}

export interface GirlSlot {
  id: string
  name: string
  moodEmoji: string
  online: boolean
  lastMessage: string
  unreadCount: number
}

const authHeader = () => {
  const token = localStorage.getItem('lana_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const jsonHeaders = () => ({
  ...authHeader(),
  'Content-Type': 'application/json',
})

export const api = {
  login: (token: string) =>
    fetch(`${GATEWAY}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }),

  getGirls: () => fetch(`${GATEWAY}/api/girls`, { headers: authHeader() }),

  createGirl: (sheet: CharacterSheet) =>
    fetch(`${GATEWAY}/api/girls`, {
      method: 'POST',
      body: JSON.stringify(sheet),
      headers: jsonHeaders(),
    }),

  sendMessage: (girlId: string, message: string) =>
    fetch(`${GATEWAY}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ girl_id: girlId, message }),
      headers: jsonHeaders(),
    }),

  generateImage: (prompt: string, girlId?: string) =>
    fetch(`${GATEWAY}/api/image`, {
      method: 'POST',
      body: JSON.stringify({ prompt, girl_id: girlId }),
      headers: jsonHeaders(),
    }),
}

export function createWebSocket(_userId: string): WebSocket {
  const token = localStorage.getItem('lana_token')
  return new WebSocket(`wss://gateway.lana-ki.de/ws?token=${encodeURIComponent(token ?? '')}`)
}
