import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createGirl } from '../lib/api';

const VOICE_MODELS = [
  { value: 'kerstin-medium', label: 'Kerstin (Medium)' },
  { value: 'thorsten-medium', label: 'Thorsten (Medium)' },
];

const MIN_AGE = 18;

export default function CreateGirl() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    age: MIN_AGE,
    personality: '',
    appearance: '',
    voiceModel: 'kerstin-medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name ist erforderlich';
    if (form.age < MIN_AGE) errs.age = 'Mindestalter: 18 Jahre';
    if (form.age > 99) errs.age = 'Maximalalter: 99 Jahre';
    if (!form.personality.trim()) errs.personality = 'Persönlichkeit ist erforderlich';
    if (!form.appearance.trim()) errs.appearance = 'Aussehen ist erforderlich';
    return errs;
  };

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(MIN_AGE, Math.min(99, Number(e.target.value)));
    handleChange('age', val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await createGirl({
        name: form.name.trim(),
        age: form.age,
        personality: form.personality.trim(),
        appearance: form.appearance.trim(),
        voiceModel: form.voiceModel,
      });
      navigate('/');
    } catch {
      setErrors({ submit: 'Fehler beim Erstellen. Bitte erneut versuchen.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-[calc(env(safe-area-inset-bottom)+5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 sticky top-0 bg-[#0a0a0a] z-10">
        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold">Companion erstellen</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="z.B. Lena"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Alter (min. 18)
          </label>
          <input
            type="number"
            min={MIN_AGE}
            max={99}
            value={form.age}
            onChange={handleAgeChange}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
          {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
        </div>

        {/* Personality */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Persönlichkeit <span className="normal-case text-zinc-600">({form.personality.length}/500)</span>
          </label>
          <textarea
            value={form.personality}
            onChange={(e) => handleChange('personality', e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Beschreibe die Persönlichkeit…"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
          />
          {errors.personality && <p className="text-red-400 text-xs mt-1">{errors.personality}</p>}
        </div>

        {/* Appearance */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Aussehen <span className="normal-case text-zinc-600">({form.appearance.length}/500)</span>
          </label>
          <textarea
            value={form.appearance}
            onChange={(e) => handleChange('appearance', e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Beschreibe das Aussehen…"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
          />
          {errors.appearance && <p className="text-red-400 text-xs mt-1">{errors.appearance}</p>}
        </div>

        {/* Voice model */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Stimme</label>
          <select
            value={form.voiceModel}
            onChange={(e) => handleChange('voiceModel', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            {VOICE_MODELS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition-colors"
        >
          {submitting ? 'Erstelle…' : 'Companion erstellen'}
        </button>
      </form>
    </div>
  );
}
