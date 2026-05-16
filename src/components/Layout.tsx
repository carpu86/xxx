import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Plus, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/chat', label: 'Chat', Icon: MessageCircle },
  { path: '/create', label: 'Erstellen', Icon: Plus },
  { path: '/profile', label: 'Profil', Icon: User },
];

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0a0a0a] sticky top-0 z-20">
        <button onClick={() => navigate('/')} className="text-xl font-bold text-white tracking-tight">
          Lana KI
        </button>
        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`text-sm font-medium transition-colors ${
                pathname === path ? 'text-violet-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-sm">
          💜
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-zinc-800 flex items-center z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              pathname === path ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
