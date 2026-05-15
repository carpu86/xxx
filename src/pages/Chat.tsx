import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Image as ImageIcon, Send } from 'lucide-react'
import { ChatMessage } from '@/src/lib/store'
import { GirlSlot } from '@/src/lib/api'
import { TypingIndicator } from '@/src/components/TypingIndicator'

interface ChatProps {
  girl: GirlSlot | undefined
  messages: ChatMessage[]
  isTyping: boolean
  onBack: () => void
  onSend: (message: string) => Promise<void>
  onGenerateImage: (prompt: string) => Promise<void>
}

export function Chat({ girl, messages, isTyping, onBack, onSend, onGenerateImage }: ChatProps) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isTyping, messages])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!input.trim()) return
    const message = input
    setInput('')
    await onSend(message)
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-neutral-950">
      <header className="flex items-center gap-3 border-b border-neutral-800 p-4">
        <button onClick={onBack} className="rounded-lg p-1 text-neutral-300 hover:bg-neutral-800 md:hidden">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-semibold text-white">
          {(girl?.name?.[0] ?? 'L').toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-100">{girl?.name ?? 'Companion'}</p>
          <p className="text-xs text-neutral-400">
            {girl?.online ? 'Online' : 'Offline'} · Mood {girl?.moodEmoji ?? '✨'}
          </p>
        </div>
      </header>

      <section className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                message.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-neutral-800 text-neutral-100'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </section>

      <form onSubmit={submit} className="border-t border-neutral-800 p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nachricht schreiben..."
            className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
          <button
            type="button"
            onClick={() => onGenerateImage(input || 'Portrait von Lana KI Companion')}
            className="rounded-xl border border-neutral-700 p-2 text-neutral-300 hover:border-violet-500 hover:text-violet-300"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button type="submit" className="rounded-xl bg-violet-600 p-2 text-white hover:bg-violet-500">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
