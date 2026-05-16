# AGENTS.md — Codex-Anweisungen für carpu86/xxx

## Projekt-Übersicht
**Lana KI Companion PWA** — installierbar auf Handy und Browser, Mobile-First.
Deployed auf **Cloudflare Pages** als `lana-ki.de`.

## API-Gegenstelle
Alle API-Calls gehen ausschließlich an:
```
https://gateway.lana-ki.de
```
(Cloudflare Worker, Repo `carpu86/workflows-lana`)

**Kein direkter LLM-Call vom Frontend.** Kein Ollama. Keine API-Keys im Frontend-Code.

### API-Endpunkte
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth` | `{ token }` | `{ ok, tier, userId }` |
| POST | `/api/chat` | `{ girl_id, message, temperature? }` | `{ reply, tokens_used }` |
| GET | `/api/girls` | — | `[{ id, name, isOnline, ... }]` |
| POST | `/api/girls` | `{ name, age, personality, appearance, voiceModel }` | `{ id }` |
| WS | `/ws/session?userId=&girlId=` | — | WebSocket |

WS Events: `{ type: "message"|"reply"|"typing"|"error", girl_id, content }`

## Stack
- React 19, TypeScript, Vite, Tailwind 4, shadcn/ui
- motion (Framer Motion), lucide-react
- react-router-dom (BrowserRouter)
- `@google/genai` SDK vorhanden (nicht direkt verwenden)

## Design-Regeln
- **Mobile-First:** Alle Komponenten primär für 375px Breite
- **Dark Theme:** Background `#0a0a0a`, Accent `#8b5cf6` (Violett)
- Safe-Area-Insets für iOS: `env(safe-area-inset-bottom/top)` nutzen
- Bottom Navigation auf Mobile, Top Navigation auf Desktop

## Kritische Regel: Alter
**`age`-Feld immer `min=18`, hartkodiert.**
- Kein User kann ein Alter unter 18 eingeben
- Nicht als konfigurierbar freilassen
- Client-seitige Validierung: age < 18 → Error "Mindestalter: 18 Jahre"
- Server-seitige Validierung wird vom Gateway übernommen

```tsx
// Korrekt — immer so:
<input type="number" min={18} max={99} value={age} onChange={...} />

// Und in der Validierung:
if (age < 18) return 'Mindestalter: 18 Jahre';
```

## Token-Storage
- Key: `lana_token` in `localStorage`
- Auth-State zusätzlich unter `lana_auth`

## Routen
| Path | Seite | Auth-Guard |
|------|-------|-----------|
| `/` | Home | ✅ |
| `/login` | Login | ❌ |
| `/chat/:girlId` | Chat | ✅ |
| `/create` | CreateGirl | ✅ |
| `/stream/:girlId` | Stream | ✅ |
| `*` | → `/` | — |

## Verzeichnisstruktur
```
src/
  App.tsx           — Router-Root
  lib/
    api.ts          — HTTP/WS-Client für gateway.lana-ki.de
    store.ts        — useAuth, useGirls, useChat Hooks
  pages/
    Login.tsx
    Home.tsx
    Chat.tsx
    CreateGirl.tsx
    Stream.tsx
  components/
    Layout.tsx      — Shell mit Navigation
    GirlCard.tsx    — Wiederverwendbare Girl-Karte
public/
  manifest.json     — PWA Manifest
  sw.js             — Service Worker
  icon-192.png      — PWA Icon
```
