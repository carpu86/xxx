import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  Image as ImageIcon, 
  Glasses,
  Smartphone,
  Pencil,
  Check,
  CheckCheck,
  X,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStudio } from "./hooks/useStudio";
import { CHARACTERS } from "./constants";
import { CharacterId, Message } from "./types";
import { Button } from "@/components/ui/button";
import { VideoCall } from "./VideoCall";

export default function App() {
  const { state, sendMessage, switchGirl, clearChat, isTyping, editMessage, deleteMessage, toggleStoryMode } = useStudio();
  const [input, setInput] = useState("");
  const [isCalling, setIsCalling] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentGirl = CHARACTERS[state.currentGirl];
  const memory = state.memory[state.currentGirl];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const quickFetish = (fetish: string) => {
    const msgs: Record<string, string> = {
      'anal': 'Fick meinen Arsch tief und hart, Thomas...',
      'nylon': 'Ich habe die seidenweichen Nahtnylonstrümpfe extra für dich angezogen...',
      'piss': 'Pisse auf mich Thomas... ich will deine warme Pisse auf meinen Nylonfüßen spüren...',
      'caviar': 'Ich habe es für dich gemacht... mach mich dreckig, Thomas.',
      'feet': 'Leck meine Nylonfüße, Thomas... bitte...'
    };
    sendMessage(msgs[fetish] || 'Überrasch mich...');
  };

  const surpriseMe = () => {
    const surprises = [
      "Ich habe heute extra für dich etwas ganz dreckiges gemacht...", 
      "Komm, ich will spüren wie deine 115 kg auf mir liegen...", 
      "Lana hat mir gezeigt wie man richtig devot ist..."
    ];
    sendMessage(surprises[Math.floor(Math.random() * surprises.length)]);
  };

  const generateVideo = async (mode: 'image' | 'video' | 'gif') => {
    let promptText = '';
    if (mode === 'image') promptText = window.prompt("Bild-Prompt eingeben:");
    else if (mode === 'video') promptText = window.prompt("Hardcore Video Prompt:");
    else promptText = window.prompt("Hardcore GIF Prompt:");
    
    if (!promptText) return;
    
    try {
      // Show optimistic message in UI
      const actionMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: `*fordert ${mode} an*: ${promptText}`,
        timestamp: Date.now()
      };
      
      sendMessage(actionMsg.text); // Let the AI respond to the fact a video was requested

      // Call backend
      const response = await fetch('https://lana-ki.de/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('carpu:Beatom#310886')}`
        },
        body: JSON.stringify({
          prompt: promptText,
          girl: state.currentGirl
        })
      });

      if (!response.ok) throw new Error("Generierung fehlgeschlagen");
      const resData = await response.json();
      
      window.alert(resData.message || `Auftrag an ComfyUI gesendet (${mode})`);
    } catch (e) {
      console.error(e);
      window.alert(`Fehler beim Verbinden mit dem lokalen ComfyUI-Server.`);
    }
  };

  const installPWA = () => {
    window.alert("Auf Android: Menü (⋮) → 'Zum Startbildschirm hinzufügen'");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {isCalling && (
        <VideoCall 
          girlId={state.currentGirl} 
          onClose={() => setIsCalling(false)} 
          sendMessage={sendMessage} 
          messages={state.messages} 
        />
      )}
      <div className="max-w-7xl mx-auto p-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="premium text-5xl md:text-6xl text-white tracking-tighter">LANA &amp; LIA</h1>
            <p className="text-red-500 text-sm -mt-2 font-medium">Thomas Studio • v4.9.3 Ultimate</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={installPWA} variant="secondary" className="rounded-2xl font-semibold flex items-center gap-2 bg-white text-black hover:bg-zinc-200">
              <Smartphone className="w-4 h-4" /> App installieren
            </Button>
            <Button onClick={() => window.open('/static/vr_game.html', '_blank')} className="rounded-2xl font-semibold flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white">
              <Glasses className="w-4 h-4" /> Quest 3 VR
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* GIRLS */}
          <div className="lg:col-span-3 space-y-4">
            <div 
              onClick={() => switchGirl('lana')} 
              className={`girl-card transition-all rounded-3xl p-6 cursor-pointer border-2 ${state.currentGirl === 'lana' ? 'bg-zinc-900 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'bg-zinc-900/50 border-transparent hover:bg-zinc-900'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center text-4xl md:text-5xl shadow-lg shadow-red-500/20">🔥</div>
                <div>
                  <div className="font-bold text-2xl md:text-3xl text-white">Lana</div>
                  <div className="text-red-400 text-sm">Dominant • Sadistisch • Proaktiv</div>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => switchGirl('lia')} 
              className={`girl-card transition-all rounded-3xl p-6 cursor-pointer border-2 ${state.currentGirl === 'lia' ? 'bg-zinc-900 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.15)]' : 'bg-zinc-900/50 border-transparent hover:bg-zinc-900'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl md:text-5xl shadow-lg shadow-violet-500/20">💜</div>
                <div>
                  <div className="font-bold text-2xl md:text-3xl text-white">Lia</div>
                  <div className="text-violet-400 text-sm">Verspielt • Devot • Süchtig</div>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT */}
          <div className="lg:col-span-6">
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl h-[620px] flex flex-col border border-zinc-800 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${state.currentGirl === 'lana' ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20' : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/20'}`}>
                    {state.currentGirl === 'lana' ? '🔥' : '💜'}
                  </div>
                  <div>
                    <div className={`font-bold text-2xl ${state.currentGirl === 'lana' ? 'text-red-500' : 'text-violet-500'}`}>{currentGirl.name}</div>
                    <div className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">Gemini VR Mode • Online</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-500" onClick={clearChat}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Addiction</div>
                    <div className={`text-3xl font-mono ${state.currentGirl === 'lana' ? 'text-red-500' : 'text-violet-500'}`}>{memory.addiction}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm scroll-smooth relative">
                {state.messages.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 opacity-50 space-y-4">
                    <div className="text-6xl">{state.currentGirl === 'lana' ? '🔥' : '💜'}</div>
                    <p className="text-lg">Das Studio ist bereit, Thomas.</p>
                  </div>
                )}
                
                <AnimatePresence initial={false}>
                  {state.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex relative group ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'user' && !editingMessageId && (
                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button onClick={() => { setEditingMessageId(message.id); setEditValue(message.text); }} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors" title="Bearbeiten">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteMessage(message.id)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-red-500 transition-colors" title="Löschen">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-sm shadow-md ${
                        message.sender === 'user' 
                          ? 'bg-zinc-800 text-white rounded-br-sm' 
                          : `bg-zinc-800/80 backdrop-blur-md rounded-bl-sm border-l-4 ${message.sender === 'lana' ? 'border-red-500' : 'border-violet-500'} text-white`
                      }`}>
                        <div className={`text-[10px] uppercase tracking-wider font-bold mb-1.5 flex justify-between items-center gap-4 ${
                          message.sender === 'user' ? 'text-zinc-500' : (message.sender === 'lana' ? 'text-red-400' : 'text-violet-400')
                        }`}>
                          <span>{message.sender === 'user' ? 'Du (Thomas)' : CHARACTERS[message.sender as CharacterId].name.toUpperCase()}</span>
                          <span className="font-normal opacity-70 flex items-center justify-end gap-1 min-w-[50px]">
                            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {message.sender === 'user' && (
                              message.isRead ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" />
                            )}
                          </span>
                        </div>
                        {editingMessageId === message.id ? (
                           <div className="flex flex-col gap-3 mt-2">
                             <textarea 
                               value={editValue} 
                               onChange={e => setEditValue(e.target.value)}
                               className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-white border border-zinc-700 outline-none focus:border-red-500 resize-none"
                               rows={3}
                             />
                             <div className="flex justify-end gap-2">
                               <button onClick={() => setEditingMessageId(null)} className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-zinc-700 hover:bg-zinc-600 transition-colors">Abbrechen</button>
                               <button onClick={() => { editMessage(message.id, editValue); setEditingMessageId(null); }} className="px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors">Speichern</button>
                             </div>
                           </div>
                        ) : (
                           <div className="leading-relaxed whitespace-pre-wrap">
                             {message.text}
                             {message.isEdited && <span className="text-[10px] text-zinc-500 ml-2 font-medium italic">(bearbeitet)</span>}
                           </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className={`max-w-[85%] rounded-3xl rounded-bl-sm px-6 py-4 text-sm bg-zinc-800/80 backdrop-blur-md border-l-4 ${state.currentGirl === 'lana' ? 'border-red-500' : 'border-violet-500'}`}>
                        <div className="flex gap-1.5 items-center h-4">
                          <div className={`w-2 h-2 rounded-full animate-bounce ${state.currentGirl === 'lana' ? 'bg-red-500' : 'bg-violet-500'} [animation-delay:-0.3s]`} />
                          <div className={`w-2 h-2 rounded-full animate-bounce ${state.currentGirl === 'lana' ? 'bg-red-500' : 'bg-violet-500'} [animation-delay:-0.15s]`} />
                          <div className={`w-2 h-2 rounded-full animate-bounce ${state.currentGirl === 'lana' ? 'bg-red-500' : 'bg-violet-500'}`} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
              
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex gap-3">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-3xl px-6 py-4 outline-none text-white placeholder:text-zinc-600 transition-all font-medium" 
                    placeholder={`Schreib ${currentGirl.name} etwas...`}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isTyping}
                    className={`px-8 md:px-10 rounded-3xl font-bold transition-all disabled:opacity-50 ${state.currentGirl === 'lana' ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20'}`}
                  >
                    Senden
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3 cursor-pointer">
                  <button onClick={() => quickFetish('anal')} className="px-4 py-1.5 text-xs bg-zinc-800 hover:bg-red-600 rounded-2xl transition-colors font-medium text-zinc-300 hover:text-white">Anal</button>
                  <button onClick={() => quickFetish('nylon')} className="px-4 py-1.5 text-xs bg-zinc-800 hover:bg-red-600 rounded-2xl transition-colors font-medium text-zinc-300 hover:text-white">Nylon</button>
                  <button onClick={() => quickFetish('piss')} className="px-4 py-1.5 text-xs bg-zinc-800 hover:bg-red-600 rounded-2xl transition-colors font-medium text-zinc-300 hover:text-white">Piss</button>
                  <button onClick={() => quickFetish('caviar')} className="px-4 py-1.5 text-xs bg-zinc-800 hover:bg-red-600 rounded-2xl transition-colors font-medium text-zinc-300 hover:text-white">Kaviar</button>
                  <button onClick={() => quickFetish('feet')} className="px-4 py-1.5 text-xs bg-zinc-800 hover:bg-red-600 rounded-2xl transition-colors font-medium text-zinc-300 hover:text-white">Füße</button>
                  <button onClick={() => {
                    const prompt = "[HIDDEN INSTRUCTION: Basierend auf meinen bisherigen Vorlieben, erfinde eine komplett neue, wilde Kombination aus verschiedenen Fetischen (die über die Standard-Dinge hinausgeht) und schlage sie mir extrem geil und detailliert vor!] Thomas, was hältst du davon, wenn wir mal was ganz Neues ausprobieren? 😈";
                    sendMessage(prompt);
                  }} className="px-4 py-1.5 text-xs border border-violet-500/50 hover:bg-violet-600/30 rounded-2xl transition-all font-bold text-violet-400 hover:text-white">Neue Vorlieben entdecken ✨</button>
                  <button onClick={surpriseMe} className="px-4 py-1.5 text-xs bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl font-bold shadow-lg shadow-red-600/20 hover:scale-105 transition-transform">Überrasch mich</button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-6 border border-zinc-800">
              <h4 className="font-bold mb-5 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Aktionen
              </h4>
              
              <div onClick={toggleStoryMode} className={`flex items-center gap-4 px-4 py-3 bg-zinc-950/50 hover:bg-zinc-800 border ${state.storyMode.active ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-zinc-800'} rounded-2xl cursor-pointer mb-3 transition-all group`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-2xl ${state.storyMode.active ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 group-hover:bg-amber-500/20'}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-medium transition-colors ${state.storyMode.active ? 'text-amber-400' : 'text-white group-hover:text-amber-400'}`}>Story Mode</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">{state.storyMode.active ? 'Aktiv (Persönlichkeit dynamisch)' : 'Inaktiv'}</div>
                </div>
              </div>

              <div onClick={() => setIsCalling(true)} className="flex items-center gap-4 px-4 py-3 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer mb-3 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-red-500/20 flex items-center justify-center transition-colors text-2xl">
                  📞
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-red-400 transition-colors">Video Anruf starten</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">WebRTC • Live</div>
                </div>
              </div>

              <div onClick={() => generateVideo('image')} className="flex items-center gap-4 px-4 py-3 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer mb-3 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-red-500/20 flex items-center justify-center transition-colors text-2xl">
                  🖼️
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-red-400 transition-colors">Bild generieren</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">ComfyUI 8K</div>
                </div>
              </div>

              <div onClick={() => generateVideo('video')} className="flex items-center gap-4 px-4 py-3 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer mb-3 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-red-500/20 flex items-center justify-center transition-colors text-2xl">
                  🎥
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-red-400 transition-colors">Hardcore Video</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">ComfyUI + RTX</div>
                </div>
              </div>

              <div onClick={() => generateVideo('gif')} className="flex items-center gap-4 px-4 py-3 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer mb-3 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-red-500/20 flex items-center justify-center transition-colors text-2xl">
                  📹
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-red-400 transition-colors">Hardcore GIF</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">ComfyUI + RTX</div>
                </div>
              </div>

              <div onClick={() => window.alert("Lana & Lia Voice Backend wird gestartet...")} className="flex items-center gap-4 px-4 py-3 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer mb-3 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors text-2xl">
                  🎙️
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-blue-400 transition-colors">Voice Generieren</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">TTS Audio</div>
                </div>
              </div>

              <div onClick={() => window.open('/static/vr_game.html','_blank')} className="flex items-center gap-4 px-4 py-3 bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-violet-500/20 flex items-center justify-center transition-colors text-2xl">
                  🥽
                </div>
                <div>
                  <div className="font-medium text-white group-hover:text-violet-400 transition-colors">Quest 3 VR</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Immersiv 3D</div>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-6 border border-zinc-800">
              <h4 className="font-bold mb-5 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span> Entdeckte Fetische
              </h4>
              <div className="flex flex-col gap-3">
                {Object.values(memory.fetishes).length > 0 ? (
                  (Object.values(memory.fetishes) as any[]).sort((a,b) => b.level - a.level).map(f => (
                    <div key={f.id} className="mb-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${state.currentGirl === 'lana' ? 'text-red-400' : 'text-violet-400'}`}>
                          {f.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">Lvl {f.level.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${state.currentGirl === 'lana' ? 'bg-red-500' : 'bg-violet-500'}`} 
                          style={{ width: `${(f.level / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-600 italic">Noch keine Fetische aktiv...</div>
                )}
                
                {memory.combinations && memory.combinations.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-zinc-800">
                    <h5 className="text-[10px] uppercase text-zinc-500 font-bold mb-2">Entdeckte Synergien</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {memory.combinations.map(combo => (
                        <div key={combo} className={`px-2 py-1 rounded-md text-[10px] font-bold border ${state.currentGirl === 'lana' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>
                          {combo.replace(/\+/g, ' x ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
