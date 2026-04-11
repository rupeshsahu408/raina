# Evara AI — Replit Project

## Overview
A PWA AI companion app with two AI systems:
- **Evara AI** — emotionally intelligent personal companion (Simi / Loa personalities)
- **Bihar AI** — Bihar-focused knowledge assistant (education, jobs, politics, culture, etc.)

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
- Mode system: Personal, Web Search, Study, Thinking, Business (Evara); Education, Politics, News, Culture, Student Help, Jobs, Agriculture, District (Bihar)
- Personality switching: Simi (calm/caring) and Loa (confident/playful)
- PWA (installable on mobile/desktop)
- Three.js 3D background with WebGL graceful fallback

## Notes
- The ThreeBackground 3D animation requires WebGL — it gracefully skips if WebGL is unavailable
- Backend runs `tsx watch` for hot-reload in dev mode
