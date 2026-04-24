import { useState, useEffect, useCallback } from 'react';
import { CharacterId, Message, StudioState } from '../types';
import { CHARACTERS, FETISHES } from '../constants';

const STORAGE_KEY = 'lana_lia_studio_v1';

const BACKEND_URL = 'https://lana-ki.de';
// Credentials from the user's backend setup
const AUTH_TOKEN = btoa('carpu:Beatom#310886');

const initialState: StudioState = {
  currentGirl: 'lana',
  messages: [],
  memory: {
    lana: { addiction: 0, discovered: [], fetishes: {}, combinations: [], lastOutfit: "Schwarze Nahtnylon + High Heels", personalityShift: [], trustLevel: 50 },
    lia: { addiction: 0, discovered: [], fetishes: {}, combinations: [], lastOutfit: "Weiße Nylon + Overknees", personalityShift: [], trustLevel: 50 }
  },
  storyMode: {
    active: false,
    chapter: 1,
    variables: {}
  }
};

// Ensure old state structure is migrated properly
const migrateState = (state: any): StudioState => {
  const newState = { ...state };
  if (!newState.memory) newState.memory = initialState.memory;
  if (!newState.storyMode) newState.storyMode = initialState.storyMode;
  
  (['lana', 'lia'] as const).forEach(girl => {
    if (!newState.memory[girl]) newState.memory[girl] = initialState.memory[girl];
    if (!newState.memory[girl].fetishes) newState.memory[girl].fetishes = {};
    if (!newState.memory[girl].combinations) newState.memory[girl].combinations = [];
    if (!newState.memory[girl].personalityShift) newState.memory[girl].personalityShift = [];
    if (newState.memory[girl].trustLevel === undefined) newState.memory[girl].trustLevel = 50;
  });
  return newState;
};

export function useStudio() {
  const [state, setState] = useState<StudioState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? migrateState(JSON.parse(saved)) : initialState;
  });

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const processFetishes = (text: string, girl: CharacterId) => {
    const mem = state.memory[girl];
    const newFetishes = { ...mem.fetishes };
    const newCombinations = [...mem.combinations];
    let triggeredIds: string[] = [];

    const textLower = text.toLowerCase();

    FETISHES.forEach(f => {
      if (f.keywords.some(kw => textLower.includes(kw))) {
        triggeredIds.push(f.id);
        const existing = newFetishes[f.id] || { 
          id: f.id, 
          name: f.name, 
          level: 0, 
          lastTriggered: 0,
          synergy: []
        };
        
        // Increase intensity (diminishing returns, max level 10)
        const expGain = existing.level < 3 ? 1.0 : (existing.level < 7 ? 0.5 : 0.2);
        existing.level = Math.min(10, existing.level + expGain);
        existing.lastTriggered = Date.now();
        
        newFetishes[f.id] = existing;
      }
    });

    // Check for dynamic combinations (synergy)
    if (triggeredIds.length > 1) {
      // Find pairs
      for (let i = 0; i < triggeredIds.length; i++) {
        for (let j = i + 1; j < triggeredIds.length; j++) {
          const comboId = [triggeredIds[i], triggeredIds[j]].sort().join(' + ');
          
          // If combo not discovered yet
          if (!newCombinations.includes(comboId)) {
            newCombinations.push(comboId);
            
            // Boost synergy on the individual fetishes
            if (!newFetishes[triggeredIds[i]].synergy) newFetishes[triggeredIds[i]].synergy = [];
            if (!newFetishes[triggeredIds[i]].synergy!.includes(triggeredIds[j])) {
              newFetishes[triggeredIds[i]].synergy!.push(triggeredIds[j]);
            }
            
            if (!newFetishes[triggeredIds[j]].synergy) newFetishes[triggeredIds[j]].synergy = [];
            if (!newFetishes[triggeredIds[j]].synergy!.includes(triggeredIds[i])) {
              newFetishes[triggeredIds[j]].synergy!.push(triggeredIds[i]);
            }
          }
        }
      }
    }

    return { updatedFetishes: newFetishes, updatedCombinations: newCombinations };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Calculate updated fetishes locally before updating state and sending request
    const { updatedFetishes, updatedCombinations } = processFetishes(text, state.currentGirl);

    const uiText = text.replace(/\[HIDDEN[^\]]+\]\s*/i, '');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: uiText,
      timestamp: Date.now(),
      isRead: false
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      memory: {
        ...prev.memory,
        [state.currentGirl]: {
          ...prev.memory[state.currentGirl],
          fetishes: updatedFetishes,
          combinations: updatedCombinations
        }
      }
    }));

    setIsTyping(true);

    try {
      // Build an invisible context block to guide the backend prompt behavior
      const activeStats = (Object.values(updatedFetishes) as any[])
        .map(f => `${f.name} (Lvl ${f.level.toFixed(1)})`)
        .join(', ');
      
      const combos = updatedCombinations.join(', ');
      
      const storyInfo = state.storyMode.active ? `\n[STORY MODE AKTIVIERT: Kapitel ${state.storyMode.chapter}. Berücksichtige, dass jede Aktion die Persönlichkeit von dir und der jeweils anderen verändern kann. Variiere deine Antworten und zeige echte emotionale Entwicklung!]` : '';

      const hiddenContext = activeStats.length > 0 || state.storyMode.active
        ? `[HIDDEN SYSTEM INSTRUCTION: Berücksichtige diese Fetisch-Entwicklung: Intensität: ${activeStats || 'keine neu'}. Entdeckte Synergien: ${combos || 'keine'}. Passe deine Persönlichkeit an diese Intensitäten an und erwähne/spiele mit den kombinierten Vorlieben, falls relevant!${storyInfo}]\n\n`
        : '';

      const payloadText = hiddenContext + text;

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${AUTH_TOKEN}`
        },
        body: JSON.stringify({
          message: payloadText,
          girl: state.currentGirl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: state.currentGirl,
        text: data.response || "Ich bin sprachlos, Thomas...",
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages.map(m => m.id === userMsg.id ? { ...m, isRead: true } : m), aiMsg],
        memory: {
          ...prev.memory,
          [state.currentGirl]: {
            ...prev.memory[state.currentGirl],
            addiction: data.addiction_level || prev.memory[state.currentGirl].addiction,
            // Fallback for discovering via backend response
            discovered: data.discovered_fetishes || prev.memory[state.currentGirl].discovered,
            lastOutfit: data.outfit || prev.memory[state.currentGirl].lastOutfit
          }
        }
      }));
    } catch (error) {
      console.error("Backend Error:", error);
      
      // Fallback message if backend is unreachable
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: state.currentGirl,
        text: "Mein süßer Thomas... das Backend ist gerade offline. Bitte starte deinen lokalen Server.",
        timestamp: Date.now()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages.map(m => m.id === userMsg.id ? { ...m, isRead: true } : m), errorMsg]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const editMessage = (id: string, newText: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, text: newText, isEdited: true } : m)
    }));
  };

  const deleteMessage = (id: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== id)
    }));
  };

  const switchGirl = (id: CharacterId) => {
    setState(prev => ({ ...prev, currentGirl: id }));
  };

  const clearChat = () => {
    setState(prev => ({ ...prev, messages: [] }));
  };

  const toggleStoryMode = () => {
    setState(prev => ({
      ...prev,
      storyMode: {
        ...prev.storyMode,
        active: !prev.storyMode.active
      }
    }));
  };

  return {
    state,
    sendMessage,
    editMessage,
    deleteMessage,
    switchGirl,
    clearChat,
    toggleStoryMode,
    isTyping
  };
}
