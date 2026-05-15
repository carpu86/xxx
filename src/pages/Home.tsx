import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useGirls } from '../lib/store';
import GirlCard from '../components/GirlCard';

export default function Home() {
  const { girls, loading, refresh } = useGirls();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Lana KI</h1>
        <button
          onClick={refresh}
          className="text-xs text-zinc-400 hover:text-violet-400 transition-colors"
        >
          Aktualisieren
        </button>
      </div>

      {loading && girls.length === 0 && (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Girls grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {girls.map((girl) => (
          <GirlCard key={girl.id} girl={girl} />
        ))}

        {/* Create new girl slot */}
        {girls.length < 9 && (
          <button
            onClick={() => navigate('/create')}
            className="aspect-square flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-700 hover:border-violet-500/60 hover:bg-violet-500/5 transition-all gap-2 text-zinc-500 hover:text-violet-400"
          >
            <Plus className="w-8 h-8" />
            <span className="text-xs font-medium">Neu erstellen</span>
          </button>
        )}
      </div>

      {girls.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">Noch keine Companions erstellt.</p>
          <button
            onClick={() => navigate('/create')}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
          >
            Ersten Companion erstellen
          </button>
        </div>
      )}
    </div>
  );
}
