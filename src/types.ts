export type CharacterId = 'lana' | 'lia';

export interface Character {
  id: CharacterId;
  name: string;
  age: number;
  personality: string;
  avatar: string;
  description: string;
}

export interface Message {
  id: string;
  sender: 'user' | CharacterId;
  text: string;
  timestamp: number;
  isRead?: boolean;
  isEdited?: boolean;
}

export interface FetishData {
  id: string;
  name: string;
  level: number;
  lastTriggered: number;
  synergy?: string[]; // Fetishes this interacts with
}

export interface StudioState {
  currentGirl: CharacterId;
  messages: Message[];
  memory: {
    [key in CharacterId]: {
      addiction: number;
      discovered: string[]; // Keep for backward compatibility with backend
      fetishes: Record<string, FetishData>; // Detailed tracking
      combinations: string[]; // Newly discovered combos
      lastOutfit: string;
      personalityShift: string[];
      trustLevel: number;
      lastInteraction: number;
    };
  };
  storyMode: {
    active: boolean;
    chapter: number;
    variables: Record<string, number | string | boolean>;
  };
}

export interface ThomasProfile {
  name: string;
  age: number;
  weight: number;
  traits: string[];
}
