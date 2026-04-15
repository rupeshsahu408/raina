# Evara AI — Replit Project

## Overview
A multi-platform AI suite with four AI systems:
- **Evara AI** — emotionally intelligent personal companion (Simi / Loa personalities)
- **Bihar AI** — Bihar-focused knowledge assistant (education, jobs, politics, culture, etc.)
- **Business AI** — hub at `/business-ai` routing to WhatsApp AI (`/whatsapp-ai`) and Website AI/IBARA (`/ibara`)
- **Plyndrox Inbox AI** — Gmail-connected email intelligence with AI summaries, intent detection, and smart reply generation

## Architecture
- **Frontend** (`frontend/`) — Next.js 16 PWA, port 5000
- **Backend** (`backend/`) — Express API, port 8080

## Workflows
- `Start application` — Next.js frontend (port 5000, webview)
- `Backend API` — Express backend (port 8080, console)

## Key Environment Configuration

### Backend (`backend/.env`)
- `PORT=8080`
- `CORS_ORIGIN=true` (allows all origins in Replit)
- `MONGODB_URI` — MongoDB Atlas connection string
- `NVIDIA_API_KEY` — NVIDIA AI API key
- `SERPER_API_KEY` — Serper web search API key
- `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`
- `WHATSAPP_CREDENTIALS_SECRET` — preferred encryption secret for WhatsApp credential vault records

### Frontend (`frontend/.env.local`)
- Firebase config (`NEXT_PUBLIC_FIREBASE_*`)
- `NEXT_PUBLIC_API_BASE_URL=""` — empty string; API calls go through Next.js rewrites proxy

## API Routing
Frontend proxies all `/v1/*` and `/health` requests to the backend via Next.js rewrites in `next.config.ts`. This avoids cross-origin issues on Replit.

## Key Features
- Firebase Auth (email/password + Google)
- MongoDB memory system (short-term + long-term profile)
- NVIDIA AI API integration (`openai/gpt-oss-20b`)
- Serper web search integration
- WhatsApp AI Business Assistant flow: premium 3D product landing page at `/whatsapp-ai`, authenticated business dashboard at `/whatsapp-ai/dashboard`, login/signup redirect support through `?next=/whatsapp-ai/dashboard`, and hybrid OAuth-style “Connect WhatsApp” onboarding backed by manual credential collection
- Encrypted WhatsApp credential vault in MongoDB using `WhatsAppCredential`, with credentials stored server-side only and never returned to the frontend
- Persistent WhatsApp business profiles and chat logs in MongoDB
- Mode system: Personal, Web Search, Study, Thinking, Business (Evara); Education, Politics, News, Culture, Student Help, Jobs, Agriculture, District (Bihar)
- Personality switching: Simi (calm/caring) and Loa (confident/playful)
- PWA (installable on mobile/desktop)
- Three.js 3D background with WebGL graceful fallback

## Components
- `VoiceRecordingBar` — live waveform during voice recording (MediaRecorder + AudioContext + SpeechRecognition)
- `CookiePreferencesModal` — full cookie consent modal (Essential/Analytics/Marketing toggles, Accept All / Reject All / Save, success toast)

## Hooks
- `useCookiePreferences` — loads/saves cookie prefs to localStorage, applies analytics/marketing script logic reactively

## Notes
- The ThreeBackground 3D animation requires WebGL — it gracefully skips if WebGL is unavailable
- Backend runs `tsx watch` for hot-reload in dev mode
- Cookie preferences are stored in localStorage under `evara_cookie_prefs`
- Voice transcription uses browser SpeechRecognition API (works best in Chrome on direct URL, not inside Replit iframe)
- WhatsApp assistant credentials can be configured either as server-side environment variables/secrets (`WHATSAPP_CLOUD_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`) or through the dashboard’s encrypted credential vault. The frontend only receives readiness/status booleans and metadata, never secret values.
- WhatsApp webhook callback URL is `https://raina-1.onrender.com/v1/whatsapp/webhook`; default verify token fallback is `evara_ai_secure_2026`.
- WhatsApp business setup uses a browser-stored `businessId` and persists profiles/logs in MongoDB collections `WhatsAppBusinessProfile` and `WhatsAppChatLog`. Set `EVARA_WHATSAPP_BUSINESS_ID` to choose which saved profile the production WhatsApp webhook uses.
- **Inbox AI** Gmail OAuth flow: `GET /inbox/auth-url` → Google OAuth → `GET /inbox/callback` → stores tokens in MongoDB `InboxToken` → redirects to `/inbox/dashboard`. Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI=https://raina-1.onrender.com/inbox/callback` env vars on Render. Also set `FRONTEND_URL=https://www.plyndrox.app`.
- Inbox AI dashboard at `/inbox/dashboard` is a three-pane layout (thread list | email view | AI reply panel). Intent labels: Lead/Support/Payment/Meeting/FYI/Spam. Reply tones: Formal/Casual/Sales/Empathetic/Short.
- Inbox AI thread rendering preserves Gmail HTML bodies, renders inline `cid:` images returned by Gmail, falls back to plain text when needed, and displays email content inside a sandboxed frame for safer client/server separation.
- `InboxToken` MongoDB model stores uid (Firebase UID), email, accessToken, refreshToken, expiresAt.
- Cross-platform session (`platformSession.ts`) supports: evara | whatsapp-ai | ibara | inbox. `PlatformSwitcher` floating component allows one-tap switching between all four platforms.
