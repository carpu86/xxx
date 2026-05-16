const GATEWAY = 'https://gateway.lana-ki.de';
const TOKEN_KEY = 'lana_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function authLogin(token: string): Promise<{ ok: boolean; tier: string; userId: string }> {
  const res = await fetch(`${GATEWAY}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Auth failed');
  return res.json();
}

export async function fetchGirls(): Promise<
  Array<{ id: string; name: string; isOnline: boolean; lastMessage?: string; age?: number }>
> {
  const res = await fetch(`${GATEWAY}/api/girls`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch girls');
  return res.json();
}

export async function sendChat(
  girlId: string,
  message: string,
  temperature?: number
): Promise<{ reply: string; tokens_used: number }> {
  const res = await fetch(`${GATEWAY}/api/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ girl_id: girlId, message, temperature }),
  });
  if (!res.ok) throw new Error('Chat request failed');
  return res.json();
}

export async function createGirl(data: {
  name: string;
  age: number;
  personality: string;
  appearance: string;
  voiceModel: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${GATEWAY}/api/girls`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create girl');
  return res.json();
}

export function createCompanionWS(userId: string, girlId: string): WebSocket {
  const wsBase = GATEWAY.replace(/^https?/, (p) => (p === 'https' ? 'wss' : 'ws'));
  return new WebSocket(`${wsBase}/ws/session?userId=${encodeURIComponent(userId)}&girlId=${encodeURIComponent(girlId)}`);
}
