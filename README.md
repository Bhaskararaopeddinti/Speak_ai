# 🎙️ LinguaVoice AI — Modern AI Voice Language Tutor

> An intelligent, full-stack AI Voice Language Tutor web application that empowers language learners to speak naturally into their microphone, converts speech to text via OpenAI Whisper, performs deep grammatical and vocabulary analysis via an LLM, plays native corrected audio via Text-to-Speech (TTS), and tracks learning progress and streaks across practice sessions.

---

## ✨ Features

- 🎯 **Target Language Selection**: Spanish, French, German, Italian, Japanese, Mandarin, English, Portuguese.
- 🎤 **Live Audio Waveform & Speech Capture**: Real-time Web Audio API frequency visualizer and MediaRecorder capture with live recording timers and error handling.
- 🗣️ **Speech-to-Text (STT)**: Transcribes speech using OpenAI Whisper (`whisper-1`) with intelligent phonetic simulation fallback.
- 🧠 **AI Linguistic Analysis**: Deep evaluation using OpenAI GPT (`gpt-4o-mini`) returning:
  - Grammar Score (0–100)
  - Vocabulary Score (0–100)
  - Naturalness Score (0–100)
  - Flawed phrase identification with strikethroughs $\rightarrow$ corrected text + explanations
  - Corrected sentence & natural colloquial phrasing
- 🔊 **Text-to-Speech (TTS) & Speed Control**: OpenAI TTS-1 voice personas (`alloy`, `nova`, `echo`, `fable`, `onyx`, `shimmer`) with variable playback speeds (0.8x, 1.0x, 1.25x).
- 📊 **Progress & Mistake Analytics**:
  - Score trajectories over time (interactive Recharts line charts).
  - Common mistake category rankings (Past Tense, Prepositions, Subject-Verb Agreement, Word Choice).
  - Practice frequency bar charts and daily learning streaks (🔥).
- 📜 **Practice History**: Searchable and filterable archive of past practice sessions with in-line audio playback.
- 🔐 **Authentication & 1-Click Demo**: Simple JWT email/password auth with an instant demo guest account (*Alex Rivera*) pre-seeded with sample learning metrics.
- 🗄️ **Dual Database Flexibility**: Configured for **PostgreSQL** via `DATABASE_URL` with an automatic local persistent storage fallback.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite |
| **Backend** | Node.js, Express, TypeScript (`tsx` / `tsc`), Multer, JWT, Bcrypt |
| **AI Providers** | OpenAI Whisper API (`whisper-1`), OpenAI GPT (`gpt-4o-mini`), OpenAI TTS (`tts-1`) |
| **Database** | PostgreSQL (`pg`) with automatic local JSON/file storage fallback |
| **Deployment** | Render, Docker, or any Node.js hosting platform |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Bhaskararaopeddinti/Speak_ai.git
cd Speak_ai
npm install
npm run install:all
```

### 2. Configure Environment Variables
Create a `server/.env` file:
```env
PORT=5000
OPENAI_API_KEY=sk-your-openai-api-key-here
DATABASE_URL=
JWT_SECRET=linguavoice_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```
> *Note: If `OPENAI_API_KEY` is left blank, LinguaVoice AI automatically engages its Smart Demo Simulation Mode so all features can be tested with zero API costs.*

### 3. Start Development Servers
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:server

# Terminal 2: Start Frontend (Port 5173)
npm run dev:client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🌐 Deploying to Render

You can deploy LinguaVoice AI as a single **Web Service** on Render:

1. Connect your repository on **[dashboard.render.com](https://dashboard.render.com)**.
2. Configure the Web Service settings:
   - **Environment / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(Generate random string)*
   - `OPENAI_API_KEY` = *(Your OpenAI key)*
   - `DATABASE_URL` = *(Your Render PostgreSQL URL or leave empty)*
4. Click **Deploy Web Service**.

---

## 📁 Repository Structure

```
Speak_ai/
├── client/                      # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/          # AudioRecorder, WaveformVisualizer, FeedbackDisplay, etc.
│   │   ├── views/               # PracticeView, ProgressView, HistoryView, SettingsView
│   │   ├── services/            # api.ts (REST API client)
│   │   ├── types.ts             # Shared frontend TypeScript interfaces
│   │   └── App.tsx              # Main application router & state manager
│   ├── package.json
│   └── tsconfig.json
├── server/                      # Node.js + Express Backend API
│   ├── src/
│   │   ├── controllers/         # practiceController, authController, sessionController
│   │   ├── services/            # sttService (Whisper), llmService (GPT), ttsService (TTS)
│   │   ├── db/                  # database.ts (PostgreSQL + Local fallback) & schema.sql
│   │   ├── middleware/          # authMiddleware, uploadMiddleware
│   │   └── index.ts             # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── render.yaml                  # Render.com Blueprint configuration
├── package.json                 # Monorepo build orchestrator
└── README.md
```

---

## 📄 License
MIT License.