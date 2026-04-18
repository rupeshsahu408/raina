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
Frontend proxies `/v1/*` and health checks to the backend via Next.js rewrites in `next.config.ts`. Inbox API calls are bridged through Next.js route handlers under `frontend/src/app/inbox/[...path]/route.ts`, with a dedicated lead-intelligence bridge at `frontend/src/app/inbox/lead-intelligence/route.ts`, so `/inbox/leads` can remain a frontend page while `/inbox/lead-intelligence` returns backend JSON.

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
- Inbox AI dashboard at `/inbox/dashboard` is a responsive AI Priority Command Center with Gmail-synced message lists, priority badges/scores, a Today’s Mission side button, and an AI Action Plan card for opened threads. Intent labels: Lead/Support/Payment/Meeting/FYI/Spam. Priority categories: Urgent, Risk Detected, High-Value Lead, Payment, Support Issue, Needs Reply, Low Priority. Reply tones: Formal/Casual/Sales/Empathetic/Short. Thread summaries are generated only when the user clicks Summarize, while AI reply suggestions generate automatically after opening an email and open the New Message composer with recipient, reply subject, and body prefilled.
- Inbox AI thread rendering preserves Gmail HTML bodies, renders inline `cid:` images returned by Gmail, falls back to plain text when needed, and displays email content inside a sandboxed frame for safer client/server separation.
- **Real-time email sync**: Inbox auto-polls Gmail every 45 seconds while on the inbox folder. New emails are detected by comparing IDs against a known set. A pulsing purple banner ("X new emails — click to show") appears at the top of the list; clicking it prepends the new emails without disrupting the current view. Banner clears on manual refresh or folder switch.
- **Phase 2 — Smart Follow-Up System (fully upgraded)**: AI detects follow-up needs on email open. `FollowUp` model stores `intent` (Sales/Support/General), `confidence` (low/medium/high), `tag` (Urgent/Sales/Waiting/General). Detection is skipped if thread was previously dismissed (edge-case protection). Follow-ups auto-complete when a reply is received on the thread. Detection card shows tag chips, confidence badge, "Why this follow-up?" tooltip toggle, "Set Reminder" + "Send Follow-Up" buttons. "Send Follow-Up" calls `POST /inbox/followup/generate-draft` (tone-adapted by intent: Sales=persuasive, Support=empathetic, General=professional) and opens the compose panel pre-filled. Followups page upgraded: tag/confidence/intent badges on cards, "Why this follow-up?" toggle, "Send Follow-Up" button (stores draft in sessionStorage + navigates to dashboard where compose opens automatically). "Follow-Up Needed" panel in main inbox sidebar shows pending follow-ups as mini cards, collapsible, clickable to open the email. Backend routes: `POST /inbox/followup/auto-complete`, `POST /inbox/followup/generate-draft`, updated detect + create routes.
- **Phase 3 — Gmail Category Filters**: Three tabs in the inbox — Primary, Promotions, Social — matching Gmail's native category system. Backend adds `primary`, `promotions`, `social` folder configs using Gmail's `category:` query syntax. Each email response includes `gmailCategory` (detected from Gmail's `CATEGORY_*` label IDs) and `aiRescued` (true when an email sits in Promotions/Social but has a priority score ≥70, meaning AI flagged it as actually important). Frontend adds tab bar under the inbox stats panel; switching tabs loads the corresponding category from the backend. Emails flagged by AI show a purple "AI Rescued" badge. Real-time polling, refresh, retry, and load-more all respect the active tab. `switchGmailCategory` resets selection state cleanly.
- **Phase 5 — Waiting-for-Reply Tracker**: Tracks conversations where the user sent the last message and is waiting for a response. Backend: new `WaitingReply` MongoDB model (`uid`, `threadId`, `subject`, `to`, `toName`, `sentAt`, `status`). Routes: `GET /inbox/waiting-replies` (returns active items with `daysWaiting` + `urgency`, auto-resolves any threads where Gmail shows a reply from someone else), `POST /inbox/waiting-replies` (upsert by threadId), `POST /inbox/waiting-replies/:id/resolve`, `DELETE /inbox/waiting-replies/:id`, `POST /inbox/waiting-replies/draft` (NVIDIA AI generates a polite follow-up draft, with heuristic fallback). Auto-tracking: when the reply panel sends a reply (`handleSend`) or compose modal sends a new email (`handleComposeSent` via `ComposeSentMeta`), a waiting reply record is created. Frontend sidebar: "Waiting for Reply" collapsible panel (blue theme) shows cards with urgency badges — Normal (day 1), Follow-Up Suggested (day 3+), High Priority (day 7+). Cards change background colour by urgency. Actions per card: "✉ Send Follow-Up" (AI draft opens compose), "✓ Got Reply" (resolves), "×" (removes from tracker).
- **Phase 4 — Today's Mission Panel**: A full-screen AI daily briefing view replacing the email list + reading pane when commandView === "mission". Layout: dark gradient header (title + back-to-inbox button), AI Briefing card (NVIDIA-powered 2–3 sentence prose summary with animated skeleton loader and refresh button), 6 stat chips (Urgent / Leads / Payments / Support / Needs Reply / Can Wait), and email cards grouped by priority category with left-accent border, avatar, sender, subject, snippet, AI suggested action, Open and Reply buttons. Backend: `POST /inbox/mission-brief` accepts up to 20 email summaries, calls NVIDIA AI to generate a flowing chief-of-staff style briefing (falls back to heuristic summary when AI unavailable). Frontend: `loadMissionBrief` useCallback fetches the brief; `openEmailFromMission` switches to inbox and opens the email; `replyFromMission` opens compose panel pre-filled. Brief auto-loads when emails arrive while mission view is active.
- **Lead & Revenue Intelligence**: Dedicated `/inbox/leads` page scans recent Gmail conversations via `GET /inbox/lead-intelligence`, detects revenue opportunities, and ranks them as Hot/Warm/Cold with High/Medium/Low buying intent. Backend uses NVIDIA AI for top lead candidates with rule-based fallback, returning opportunity summary, suggested action, reply strategy, confidence, reason, a ready-to-send reply draft, and pipeline stats. UI shows pipeline snapshot metrics, score filters, lead cards, detail panel, Open Inbox action, and Reply Now through the existing Gmail compose modal. Inbox sidebar includes a Leads entry under AI Features.
- `InboxToken` MongoDB model stores uid (Firebase UID), email, accessToken, refreshToken, expiresAt.
- Cross-platform session (`platformSession.ts`) supports: evara | whatsapp-ai | ibara | inbox. `PlatformSwitcher` floating component allows one-tap switching between all four platforms.
- **Recruit AI — Phase 2 (Async Assessment + Hiring Decision Engine)**: Full async text assessment flow. Recruiter clicks "Send Assessment" on a candidate card → backend generates 5 AI role-specific questions + a unique token → assessment link is shown in modal for sharing via email/WhatsApp. Candidate accesses `/recruit/assessment/[token]` (no login required) — premium branded page with progress indicator, question timer, "answer in your own words" instruction. On submit, backend analyzes all answers with AI, adjusts score (-20 to +20 pts), sets hiring decision (Strong Yes / Maybe / No), and stores assessment impact (strengths/weaknesses/reasoning). Candidate card updated with: hiring decision badge (✅/🤔/❌), assessment status badge (Not Sent/Pending/Completed), score change indicator (previous % → new %), assessment impact panel. One-click "Reject" button generates AI personalized rejection email shown in copy modal. "Reminder" button re-surfaces the assessment link for pending candidates. Backend public routes: `GET /recruit-public/assessment/:token`, `POST /recruit-public/assessment/:token/submit`. Authenticated routes: `/recruit/jobs/:jobId/candidates/:candidateId/assessment/send`, `/reminder`, `/reject-email`. Anti-cheat: time-per-answer tracked and flagged in AI analysis if < 30 seconds.
- **Recruit AI — Phase 1 India-first job marketplace (Complete)**: LinkedIn-inspired white UI. /recruit is the landing page. /recruit/opportunities is a server-rendered public job board with deep filters: niche, work mode, job type, seniority, company type, min salary, notice period, education requirement, posted within, freshers allowed, verified company. /recruit/opportunities/[id] job detail page with improved apply form that pre-fills from localStorage and saves email/name for tracking. /recruit/saved-jobs is a localStorage-based bookmarked jobs page with bookmark toggle buttons on every job card. /recruit/my-applications tracks submitted applications by email via backend lookup, shows AI score progress bar, stage badges, and assessment status. /recruit/profile is an auth-required job seeker profile builder with sections for basic info + skills, work experience, education, job preferences, and resume text — stored in MongoDB via PUT/GET /recruit/seeker/profile. /recruit/company-profile is an auth-required recruiter page for company details, about section, benefits, and links stored in localStorage. Backend: new RecruitSeekerProfile mongoose model, GET/PUT /recruit/seeker/profile endpoints, GET /recruit-public/my-applications endpoint, enhanced buildPublicJobQuery with noticePeriod, educationRequirement, seniority, companyType, postedAfterDays filters. Recruiter dashboard header updated with Company Profile link. Public job APIs are under /recruit-public/*; authenticated recruiter/seeker APIs are under /backend/recruit/*.
- **Recruit AI — Free Growth Roadmap / Phase 2 seeker upgrade**: Monetization is intentionally paused until user growth exists. Phase 2 focuses on seeker experience upgrades with clean white responsive UI, stronger job search context, quick filters, improved empty states, trust labels, faster saved-profile apply behavior, job save/share actions, local recently viewed tracking, saved-jobs shortlist polish, application tracker polish, and profile completeness guidance. Seeker profile saves name/email/phone/resume into localStorage so apply forms can prefill safely on the client.
