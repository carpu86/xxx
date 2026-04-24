import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  User, 
  Heart, 
  Activity, 
  Settings, 
  LogOut, 
  MessageSquare,
  Sparkles,
  Zap,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStudio } from "./hooks/useStudio";
import { CHARACTERS, THOMAS } from "./constants";
import { CharacterId } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function App() {
  const { state, sendMessage, switchGirl, clearChat, isTyping } = useStudio();
  const [input, setInput] = useState("");
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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden studio-grid">
      {/* Sidebar - Character Profile & Stats */}
      <aside className="w-80 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Lana & Lia</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Private Audio Studio</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <Avatar className="w-full h-48 rounded-lg border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-500">
                <AvatarImage src={currentGirl.avatar} className="object-cover" />
                <AvatarFallback>{currentGirl.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                <div className="recording-dot" />
                <span className="text-[10px] font-mono text-white/80">LIVE</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{currentGirl.name}, {currentGirl.age}</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {currentGirl.personality}
              </p>
            </div>

            <Separator className="bg-border/50" />

            {/* Stats */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                    <Heart className="w-3 h-3 text-primary" /> Addiction Level
                  </label>
                  <span className="text-xs font-mono text-primary">{memory.addiction}/10</span>
                </div>
                <Progress value={memory.addiction * 10} className="h-1.5 bg-primary/10" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" /> Discovered Fetishes
                </label>
                <div className="flex flex-wrap gap-2">
                  {memory.discovered.length > 0 ? (
                    memory.discovered.map(f => (
                      <Badge key={f} variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase">
                        {f}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">None discovered yet...</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-400" /> Current Outfit
                </label>
                <p className="text-[11px] text-white/70 italic">"{memory.lastOutfit}"</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{THOMAS.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{THOMAS.weight}kg • {THOMAS.age} Jahre</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground ml-auto cursor-pointer hover:text-white transition-colors" />
            </CardContent>
          </Card>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-500 transition-colors" onClick={() => window.location.reload()}>
            <LogOut className="w-4 h-4 mr-2" /> Session beenden
          </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Chat Header */}
        <header className="h-16 border-b border-border/50 flex items-center px-6 justify-between bg-card/10 backdrop-blur-md">
          <div className="md:hidden flex items-center gap-3">
             <Avatar className="w-8 h-8 rounded-full border border-primary/30">
                <AvatarImage src={currentGirl.avatar} />
                <AvatarFallback>{currentGirl.name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-sm font-bold">{currentGirl.name}</h2>
          </div>
          
          <Tabs value={state.currentGirl} onValueChange={(v) => switchGirl(v as CharacterId)} className="mx-auto">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="lana" className="data-[state=active]:bg-primary data-[state=active]:text-white uppercase text-[10px] px-6">Lana</TabsTrigger>
              <TabsTrigger value="lia" className="data-[state=active]:bg-primary data-[state=active]:text-white uppercase text-[10px] px-6">Lia</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={clearChat}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-8 pb-10">
            {state.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-white">Das Studio ist bereit</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {currentGirl.name} wartet auf deine Befehle, Thomas. Begrüße sie und teile ihr deine Wünsche mit.
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {state.messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={`w-8 h-8 ${message.sender === 'user' ? 'border-primary/30' : 'border-white/10'}`}>
                      {message.sender !== 'user' ? (
                        <AvatarImage src={CHARACTERS[message.sender as CharacterId].avatar} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-[10px]">T</AvatarFallback>
                      )}
                      <AvatarFallback>{message.sender !== 'user' ? message.sender[0].toUpperCase() : 'T'}</AvatarFallback>
                    </Avatar>
                    
                    <div className={`space-y-1.5 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        message.sender === 'user' 
                          ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
                          : 'bg-secondary/80 backdrop-blur-md text-white/90 rounded-tl-none border border-white/5'
                      }`}>
                        {message.text}
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 items-center">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={CHARACTERS[state.currentGirl].avatar} className="object-cover" />
                  </Avatar>
                  <div className="flex gap-1.5 px-3 py-2 bg-secondary/40 backdrop-blur-sm rounded-full rounded-tl-none border border-white/5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 bg-card/20 backdrop-blur-xl border-t border-border/50">
          <div className="max-w-3xl mx-auto flex gap-3">
            <div className="flex-1 relative group">
              <Input
                placeholder={`Schreib ${currentGirl.name} etwas...`}
                className="bg-black/40 border-white/10 h-12 pr-12 focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/50 transition-all group-focus-within:border-primary/50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Zap className={`w-4 h-4 transition-colors ${input.length > 0 ? 'text-yellow-500' : 'text-muted-foreground/20'}`} />
              </div>
            </div>
            <Button 
              onClick={handleSend}
              className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all shadow-lg shadow-primary/20 group"
              disabled={isTyping}
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
          <div className="max-w-3xl mx-auto mt-4 grid grid-cols-3 gap-2">
             <Button variant="ghost" size="sm" className="text-[10px] uppercase text-muted-foreground bg-white/5 border border-white/5 hover:border-primary/30 h-8 gap-2">
               <Camera className="w-3 h-3" /> Foto anfordern
             </Button>
             <Button variant="ghost" size="sm" className="text-[10px] uppercase text-muted-foreground bg-white/5 border border-white/5 hover:border-primary/30 h-8 gap-2">
               <Activity className="w-3 h-3" /> Status Prüfen
             </Button>
             <Button variant="ghost" size="sm" className="text-[10px] uppercase text-muted-foreground bg-white/5 border border-white/5 hover:border-primary/30 h-8 gap-2">
               <Heart className="w-3 h-3" /> Fetisch-Idee
             </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

