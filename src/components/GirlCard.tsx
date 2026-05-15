import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Girl } from '../lib/store';

interface Props {
  girl: Girl;
}

export default function GirlCard({ girl }: Props) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/chat/${girl.id}`)}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex flex-col items-center gap-3 text-left w-full hover:border-violet-500/50 transition-colors"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-2xl shrink-0">
          💜
        </div>
        {/* Online indicator */}
        <span
          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-zinc-900 ${
            girl.isOnline ? 'bg-green-500' : 'bg-zinc-600'
          }`}
        />
      </div>

      {/* Info */}
      <div className="w-full text-center">
        <p className="text-white font-semibold text-sm truncate">{girl.name}</p>
        {girl.lastMessage && (
          <p className="text-zinc-500 text-xs mt-0.5 truncate max-w-[12ch] mx-auto">
            {girl.lastMessage.length > 60 ? girl.lastMessage.slice(0, 60) + '…' : girl.lastMessage}
          </p>
        )}
      </div>
    </motion.button>
  );
}
