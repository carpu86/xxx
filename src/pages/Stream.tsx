import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, VideoOff } from 'lucide-react';
import { useChat } from '../lib/store';
import { Send } from 'lucide-react';

export default function Stream() {
  const { girlId = '' } = useParams<{ girlId: string }>();
  const navigate = useNavigate();
  const { messages, send, isTyping } = useChat(girlId);
  const [input, setInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleCamera = async () => {
    if (cameraActive) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError('');
      } catch {
        setCameraError('Kamera nicht verfügbar.');
      }
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    send(input.trim());
    setInput('');
  };

  return (
    <div
      className="flex flex-col bg-[#0a0a0a]"
      style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold flex-1 capitalize">Live: {girlId}</h1>
        <button
          onClick={toggleCamera}
          className={`p-2 rounded-full transition-colors ${cameraActive ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          {cameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: camera + avatar placeholder */}
        <div className="md:w-1/2 flex flex-col gap-3 p-4 shrink-0">
          {/* Webcam */}
          <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Video className="w-8 h-8" />
                <p className="text-sm">Kamera inaktiv</p>
                {cameraError && <p className="text-xs text-red-400">{cameraError}</p>}
              </div>
            )}
          </div>

          {/* Girl avatar placeholder */}
          <div className="aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center">
            <div className="text-center text-zinc-500">
              <div className="w-20 h-20 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-2 text-3xl">
                💜
              </div>
              <p className="text-sm capitalize">{girlId}</p>
              <p className="text-xs text-zinc-600 mt-1">Avatar-Video (demnächst)</p>
            </div>
          </div>
        </div>

        {/* Right: chat */}
        <div className="flex-1 flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-zinc-800">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-zinc-400 rounded-full block animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-zinc-800 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nachricht…"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center shrink-0 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
