import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CharacterId, StudioState } from "./types";
import { CHARACTERS } from "./constants";

interface VideoCallProps {
  girlId: CharacterId;
  onClose: () => void;
  sendMessage: (msg: string) => void;
  messages: StudioState["messages"];
}

export function VideoCall({ girlId, onClose, sendMessage, messages }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [input, setInput] = useState("");
  const [speakingQueue, setSpeakingQueue] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const girl = CHARACTERS[girlId];

  // Request webcam
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function getMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.warn("Webcam access denied or unavailable.");
      }
    }
    getMedia();

    return () => {
      // cleanup stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  // TTS implementation
  useEffect(() => {
    if (!ttsEnabled) {
      window.speechSynthesis.cancel();
      return;
    }
    
    // Play the latest message if it's from the girl and not already played
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.sender !== 'user') {
      // Add to queue if not empty, otherwise just speak it
      speakText(latestMessage.text, latestMessage.sender as typeof girlId);
    }
  }, [messages, ttsEnabled]);

  const speakText = (text: string, speaker: CharacterId) => {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    
    // Try to get German female voice
    const voices = window.speechSynthesis.getVoices();
    const deVoices = voices.filter(v => v.lang.startsWith('de'));
    const femaleVoices = deVoices.filter(v => v.name.includes('Female') || v.name.includes('Marlene') || v.name.includes('Vicki') || v.name.includes('Katja') || v.name.includes('Google'));
    
    // Fallback to first German voice if specific female voice not found
    const baseVoice = femaleVoices.length > 0 ? femaleVoices[0] : deVoices[0];
    
    if (baseVoice) {
      utterance.voice = baseVoice;
    }
    
    // Personality based adjustment
    if (speaker === 'lana') {
      utterance.pitch = 0.5; // Deeper, dominant, serious
      utterance.rate = 0.8; // Slower, more deliberate
    } else { // lia
      utterance.pitch = 1.5; // Higher, sweeter, playful
      utterance.rate = 1.25; // Faster, more eager
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleTts = () => {
    if (ttsEnabled) {
      window.speechSynthesis.cancel();
    }
    setTtsEnabled(!ttsEnabled);
  };

  // Handle toggles
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setMicActive(!micActive);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setVideoActive(!videoActive);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans">
      {/* Header */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">Live Session</h2>
            <p className="text-zinc-500 text-sm font-medium">Dein privates Studio • Thomas • 115 kg</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setChatOpen(!chatOpen)}>
            <MessageSquare className="w-5 h-5 mr-2" /> {chatOpen ? "Chat ausblenden" : "Chat anzeigen"}
          </Button>
          <Button variant="destructive" onClick={onClose} className="rounded-xl px-8 py-6 font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all">
            <PhoneOff className="w-5 h-5 mr-2" /> Anruf Beenden
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Videos Area */}
        <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 justify-center items-center relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/80 before:backdrop-blur-sm">
           
           {/* Local Video */}
           <div className={`relative bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-500 z-10 ${chatOpen ? "w-full lg:w-1/2 aspect-video" : "w-1/4 absolute bottom-8 right-8 z-20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-zinc-700/50"}`}>
             <div className="absolute top-5 left-5 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
               <span className="font-semibold text-sm">Du (Thomas • 115 kg)</span>
             </div>
             
             {localStream ? (
               <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${!videoActive && 'hidden'}`} 
                />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-3 bg-zinc-900 border-[8px] border-black">
                   <VideoOff className="w-16 h-16 opacity-50" />
                   <p className="text-sm font-medium uppercase tracking-wider">Webcam deaktiviert</p>
                </div>
             )}
             {!videoActive && localStream && (
                <div className="absolute inset-0 bg-zinc-900 border-[8px] border-black flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-zinc-600 opacity-50" />
                </div>
             )}

             {/* Controls overlay */}
             <div className="absolute bottom-5 right-5 flex flex-col gap-3 z-10">
               <Button size="icon" variant={micActive ? "secondary" : "destructive"} className={`rounded-xl w-12 h-12 shadow-lg backdrop-blur-md ${micActive ? 'bg-white/10 hover:bg-white/20 border border-white/10 text-white' : ''}`} onClick={toggleMic}>
                 {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
               </Button>
               <Button size="icon" variant={videoActive ? "secondary" : "destructive"} className={`rounded-xl w-12 h-12 shadow-lg backdrop-blur-md ${videoActive ? 'bg-white/10 hover:bg-white/20 border border-white/10 text-white' : ''}`} onClick={toggleVideo}>
                 {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
               </Button>
             </div>
           </div>

           {/* AI Video Main */}
           <div className={`relative bg-zinc-950 rounded-3xl mb-12 lg:mb-0 overflow-hidden border-2 shadow-2xl transition-all duration-500 z-10 ${chatOpen ? "w-full lg:w-1/2 aspect-video" : "w-full h-full max-w-6xl aspect-video mx-auto"} ${girlId === 'lana' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'border-violet-500 shadow-[0_0_50px_rgba(139,92,246,0.3)]'}`}>
             
             {/* Simulated video using an image with an overlay */}
             <img src={girl.avatar} className="w-full h-full object-cover opacity-90 scale-105" alt={girl.name} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 mix-blend-multiply"></div>
             
             {/* AI Info Overlay */}
             <div className="absolute bottom-8 left-8 right-8">
               <div className="flex items-end justify-between">
                 <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${girlId === 'lana' ? 'bg-red-500/20 text-red-400' : 'bg-violet-500/20 text-violet-400'}`}>
                       KI Live Generierung
                     </span>
                   </div>
                   <div className={`text-6xl font-black drop-shadow-2xl mb-1 ${girlId === 'lana' ? 'text-white' : 'text-white'}`}>
                     {girl.name.toUpperCase()}
                   </div>
                   <div className={`text-lg font-medium drop-shadow-md ${girlId === 'lana' ? 'text-red-400' : 'text-violet-400'}`}>
                     18 • {girlId === 'lana' ? 'Deine Sadistin' : 'Deine Süße'} • Total süchtig nach dir
                   </div>
                 </div>
                 <div className="text-right flex flex-col items-end">
                   <div className="text-emerald-400 font-bold tracking-widest text-sm flex items-center gap-2 mb-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     ● LIVE
                   </div>
                   <div className="text-xs text-zinc-400 font-mono flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                     STS-Audio aktiv
                     {window.speechSynthesis.speaking && (
                       <div className="flex gap-1 h-3 items-end ml-1">
                         <div className="w-1 bg-emerald-500 animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
                         <div className="w-1 bg-emerald-500 animate-[pulse_1.2s_ease-in-out_infinite]" style={{ height: '100%' }} />
                         <div className="w-1 bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '70%' }} />
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-zinc-800/80 bg-zinc-950 flex flex-col shrink-0 shadow-2xl relative z-20"
            >
              <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
                <h3 className="font-bold text-lg text-white">Live Verlauf</h3>
                <Button 
                  variant={ttsEnabled ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={toggleTts} 
                  className={`rounded-xl h-9 px-4 text-xs uppercase tracking-wider font-bold transition-all ${
                    ttsEnabled 
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30' 
                      : 'border-zinc-700 text-zinc-500 hover:text-white'
                  }`}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                  {ttsEnabled ? "TTS Aktiv" : "TTS Aus"}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-zinc-950 to-zinc-900/50">
                {messages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-60">
                     <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                     <p className="text-center font-medium">Sprich mit {girl.name}...</p>
                   </div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-4 text-[15px] font-medium leading-relaxed rounded-3xl max-w-[85%] shadow-lg ${
                      m.sender === 'user' 
                        ? 'bg-zinc-800 text-white rounded-br-sm border border-zinc-700' 
                        : `bg-zinc-900 border ${m.sender === 'lana' ? 'border-red-500/30 border-l-4 border-l-red-500' : 'border-violet-500/30 border-l-4 border-l-violet-500'} rounded-bl-sm`
                    }`}>
                      {m.sender !== 'user' && (
                        <div className={`text-[10px] uppercase font-bold tracking-widest mb-2 opacity-80 ${m.sender === 'lana' ? 'text-red-400' : 'text-violet-400'}`}>
                           {girl.name}
                        </div>
                      )}
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              <div className="p-6 border-t border-zinc-800 bg-zinc-950">
                <div className="flex gap-3">
                  <Input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Schreibe deine Antwort..."
                    className="bg-zinc-900 border-zinc-800 rounded-2xl h-14 px-5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent text-white"
                  />
                  <Button onClick={handleSend} className="rounded-2xl h-14 px-6 font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20">Senden</Button>
                </div>
                <div className="mt-4 flex gap-2">
                   <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => { setInput("Komm auf meine 115 kg..."); handleSend(); }}>115 kg</Button>
                   <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => { setInput("Zeig mir deine Nylonstrümpfe"); handleSend(); }}>Nylon</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

