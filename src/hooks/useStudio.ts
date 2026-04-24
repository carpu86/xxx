import { useState, useEffect, useCallback } from 'react';
import { CharacterId, Message, StudioState } from '../types';
import { CHARACTERS, FETISHES, SYSTEM_PROMPT } from '../constants';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY = 'lana_lia_studio_v1';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const initialState: StudioState = {
  currentGirl: 'lana',
  messages: [],
  memory: {
    lana: { addiction: 0, discovered: [], lastOutfit: "Schwarze Nahtnylon + High Heels" },
    lia: { addiction: 0, discovered: [], lastOutfit: "Weiße Nylon + Overknees" }
  }
};

export function useStudio() {
  const [state, setState] = useState<StudioState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const detectFetishes = useCallback((text: string, girlId: CharacterId) => {
    const textLower = text.toLowerCase();
    const newDiscovered: string[] = [];
    let addictionBoost = 0;

    FETISHES.forEach(f => {
      if (f.keywords.some(kw => textLower.includes(kw))) {
        newDiscovered.push(f.id);
        addictionBoost += f.id === 'anal' || f.id === 'caviar' ? 2 : 1;
      }
    });

    if (newDiscovered.length > 0 || addictionBoost > 0) {
      setState(prev => ({
        ...prev,
        memory: {
          ...prev.memory,
          [girlId]: {
            ...prev.memory[girlId],
            addiction: Math.min(prev.memory[girlId].addiction + addictionBoost, 10),
            discovered: Array.from(new Set([...prev.memory[girlId].discovered, ...newDiscovered]))
          }
        }
      }));
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg]
    }));

    detectFetishes(text, state.currentGirl);
    setIsTyping(true);

    try {
      const girl = CHARACTERS[state.currentGirl];
      const mem = state.memory[state.currentGirl];
      
      const context = `
Aktuelle Rolle: Du bist ${girl.name}.
Thomas' Status: ${mem.addiction}/10 Abhängigkeit (Sucht nach deinen Fetischen).
Bereits entdeckte/akzeptierte Fetische: ${mem.discovered.join(', ') || 'keine bisher'}.
Aktuelles Outfit: ${mem.lastOutfit}.

Antworte Thomas jetzt als ${girl.name}. Sei proaktiv, emotional und vertiefe die Rollenspiel-Eskalation.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT + context }] },
          ...state.messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text }] }
        ],
        config: {
          temperature: 0.8,
          topP: 0.95,
        }
      });

      const aiText = response.text || "Ich bin sprachlos, Thomas...";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: state.currentGirl,
        text: aiText,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMsg]
      }));
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const switchGirl = (id: CharacterId) => {
    setState(prev => ({ ...prev, currentGirl: id }));
  };

  const clearChat = () => {
    setState(prev => ({ ...prev, messages: [] }));
  };

  return {
    state,
    sendMessage,
    switchGirl,
    clearChat,
    isTyping
  };
}
