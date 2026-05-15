import { useState, useEffect, useCallback, useRef } from 'react';
import {
  authLogin,
  fetchGirls,
  sendChat,
  createCompanionWS,
  getToken,
  setToken,
  removeToken,
} from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthState {
  userId: string | null;
  tier: string | null;
  token: string | null;
}

export interface Girl {
  id: string;
  name: string;
  isOnline: boolean;
  lastMessage?: string;
  age?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'girl';
  text: string;
  timestamp: number;
}

// ─── useAuth ──────────────────────────────────────────────────────────────────

const AUTH_KEY = 'lana_auth';

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { userId: null, tier: null, token: getToken() };
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(loadAuth);

  const login = useCallback(async (token: string) => {
    const result = await authLogin(token);
    setToken(token);
    const newAuth: AuthState = { userId: result.userId, tier: result.tier, token };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newAuth));
    setAuth(newAuth);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem(AUTH_KEY);
    setAuth({ userId: null, tier: null, token: null });
  }, []);

  return { ...auth, login, logout };
}

// ─── useGirls ─────────────────────────────────────────────────────────────────

export function useGirls() {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGirls();
      setGirls(data);
    } catch {
      // keep existing list on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { girls, loading, refresh };
}

// ─── useChat ──────────────────────────────────────────────────────────────────

export function useChat(girlId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { userId } = useAuth();

  const connect = useCallback(() => {
    if (!userId || !girlId) return;
    const ws = createCompanionWS(userId, girlId);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'typing') {
          setIsTyping(true);
        } else if (data.type === 'reply') {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender: 'girl', text: data.content, timestamp: Date.now() },
          ]);
        } else if (data.type === 'error') {
          setIsTyping(false);
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 3 seconds
      reconnectTimer.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => ws.close();
  }, [userId, girlId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'message', girl_id: girlId, content: text }));
      } else {
        // Fallback to HTTP if WS not connected
        setIsTyping(true);
        try {
          const result = await sendChat(girlId, text);
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), sender: 'girl', text: result.reply, timestamp: Date.now() },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), sender: 'girl', text: '…', timestamp: Date.now() },
          ]);
        } finally {
          setIsTyping(false);
        }
      }
    },
    [girlId]
  );

  return { messages, send, isTyping, connected };
}
