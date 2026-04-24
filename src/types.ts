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
}

export interface StudioState {
  currentGirl: CharacterId;
  messages: Message[];
  memory: {
    [key in CharacterId]: {
      addiction: number;
      discovered: string[];
      lastOutfit: string;
    };
  };
}

export interface ThomasProfile {
  name: string;
  age: number;
  weight: number;
  traits: string[];
}
