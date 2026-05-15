import { useMemo, useState } from 'react'
import { CharacterSheet } from '@/src/lib/api'

interface CreateGirlProps {
  onCreate: (sheet: CharacterSheet) => Promise<void>
  onCancel: () => void
}

const templates = ['Freundlich & verspielt', 'Empathisch & ruhig', 'Mutig & direkt']

export function CreateGirl({ onCreate, onCancel }: CreateGirlProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sheet, setSheet] = useState<CharacterSheet>({
    name: '',
    age: 18,
    description: '',
    appearance: { hair: '', eyes: '', bodyType: '' },
    personality: '',
    voice: 'kerstin',
  })

  const canNext = useMemo(() => {
    if (step === 1) return Boolean(sheet.name && sheet.description && sheet.age >= 18)
    if (step === 2) return Boolean(sheet.appearance.hair && sheet.appearance.eyes && sheet.appearance.bodyType)
    if (step === 3) return Boolean(sheet.personality)
    return true
  }, [sheet, step])

  const submit = async () => {
    if (sheet.age < 18) {
      setError('Alter muss mindestens 18 sein.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onCreate(sheet)
    } catch {
      setError('Erstellen fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <h2 className="text-xl font-semibold">Character Creator</h2>
      <p className="text-sm text-neutral-400">Schritt {step} von 4</p>

      {step === 1 && (
        <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <input
            value={sheet.name}
            onChange={(event) => setSheet((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Name"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Alter: {sheet.age}</label>
            <input
              type="range"
              min="18"
              max="99"
              value={sheet.age}
              onChange={(event) => setSheet((prev) => ({ ...prev, age: Number(event.target.value) }))}
              className="w-full accent-violet-500"
            />
            <input
              type="number"
              min="18"
              max="99"
              value={sheet.age}
              onChange={(event) => setSheet((prev) => ({ ...prev, age: Number(event.target.value) || 18 }))}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={sheet.description}
            onChange={(event) => setSheet((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Beschreibung"
            className="h-24 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <input
            value={sheet.appearance.hair}
            onChange={(event) => setSheet((prev) => ({ ...prev, appearance: { ...prev.appearance, hair: event.target.value } }))}
            placeholder="Haare"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
          <input
            value={sheet.appearance.eyes}
            onChange={(event) => setSheet((prev) => ({ ...prev, appearance: { ...prev.appearance, eyes: event.target.value } }))}
            placeholder="Augen"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
          <input
            value={sheet.appearance.bodyType}
            onChange={(event) => setSheet((prev) => ({ ...prev, appearance: { ...prev.appearance, bodyType: event.target.value } }))}
            placeholder="Körperbau"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template}
                onClick={() => setSheet((prev) => ({ ...prev, personality: template }))}
                className="rounded-full border border-violet-500/40 px-3 py-1 text-xs text-violet-300"
              >
                {template}
              </button>
            ))}
          </div>
          <textarea
            value={sheet.personality}
            onChange={(event) => setSheet((prev) => ({ ...prev, personality: event.target.value }))}
            placeholder="Persönlichkeit"
            className="h-24 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
          <label className="text-sm text-neutral-300">Voice-Model</label>
          <select
            value={sheet.voice}
            onChange={(event) =>
              setSheet((prev) => ({ ...prev, voice: event.target.value === 'thorsten' ? 'thorsten' : 'kerstin' }))
            }
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          >
            <option value="kerstin">kerstin</option>
            <option value="thorsten">thorsten</option>
          </select>

          <div className="rounded-xl border border-neutral-700 bg-neutral-950/60 p-3 text-sm text-neutral-300">
            <p className="font-semibold text-neutral-100">Vorschau</p>
            <p>{sheet.name || 'Unbenannt'} · {sheet.age} Jahre</p>
            <p>{sheet.description || 'Keine Beschreibung'}</p>
            <p>{sheet.personality || 'Keine Persönlichkeit gesetzt'}</p>
            <p>Voice: {sheet.voice}</p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="rounded-xl border border-neutral-700 px-4 py-2 text-sm">
          Abbrechen
        </button>
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm"
            >
              Zurück
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep((prev) => prev + 1)}
              disabled={!canNext}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              Weiter
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? 'Erstelle...' : 'Erstellen'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
