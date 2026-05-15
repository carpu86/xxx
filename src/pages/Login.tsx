import { useState } from 'react'
import { motion } from 'motion/react'

interface LoginProps {
  onLogin: (token: string) => Promise<void>
}

export function Login({ onLogin }: LoginProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!token.trim()) return
    setLoading(true)
    setError('')
    try {
      await onLogin(token.trim())
    } catch {
      setError('Verbindung fehlgeschlagen. Bitte Token prüfen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 text-neutral-100">
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 6 }}
      >
        <div className="absolute left-1/4 top-1/4 h-56 w-56 rounded-full bg-violet-600/40 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-700/30 blur-3xl" />
      </motion.div>

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl font-bold">
            L
          </div>
          <h1 className="text-2xl font-semibold">Lana KI</h1>
          <p className="text-sm text-neutral-400">Companion Verbindung starten</p>
        </div>

        <label className="mb-2 block text-sm text-neutral-300">API-Token / Telegram Login</label>
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Token eingeben"
          className="mb-3 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-violet-500"
        />
        {error && <p className="mb-3 text-xs text-rose-400">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Verbinde...' : 'Verbinden'}
        </button>
      </div>
    </div>
  )
}
