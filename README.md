# 🌙 Dream Journal & AI Dream Visualizer

An interactive dream journaling platform and **AI Dream Interpreter & Visualizer** built with React, Node.js/Express, MongoDB, and generative AI. Capture fleeting nighttime narratives, decode Jungian archetypes and recurring symbols, generate bespoke dream artwork, and track long-term mood patterns.

🔗 **Live Demo (GitHub Pages):** https://muqtabis.github.io/my-dream-journal/  
👤 **Author:** [Muqtabis Ahmar](https://muqtabis.github.io/)

---

## ✨ Key Features

- **🎨 AI Dream Interpreter & Visualizer (`/visualizer`)**
  - Enter any dream narrative and choose from 7 visual art styles (*Surrealism, Ethereal Watercolor, Cyberpunk Neon, Studio Ghibli, Dark Gothic Fantasy, Vintage Oil Painting, Cosmic Psychedelic*) and 5 emotional tones.
  - Produces structured psychological analysis: Core Meaning overview, Jungian Archetypes, decoded Dream Symbols, reflective journaling prompts, and a curated hex color palette.
  - Synthesizes an optimized text-to-image prompt and renders custom dream artwork via Pollinations AI (`image.pollinations.ai`).
  - Supports backend Google Gemini `gemini-2.5-flash` inference, an optional user-supplied Gemini key in browser **AI Engine Settings**, and a zero-config built-in Depth Psychology analyzer fallback for static hosting.

- **📖 Dream Journal Archive (`/journal`)**
  - Create, search, filter (by category, minimum mood score, lucid flag), edit, and delete dream entries.
  - Save visualized artwork (`imageUrl`) and AI summaries directly alongside journal entries.
  - Export your dream archive as a formatted `.txt` file and switch seamlessly between **Dark** and **Light** themes.

- **📊 Deep Dream Insights & Analytics (`/stats`)**
  - Summary cards for Total Dreams, Average Mood, Most Common Dream Type, and Lucid Dream count.
  - Annual **Calendar Heatmap** (`react-calendar-heatmap`) visualizing logging consistency and daily mood scores.
  - **Tag Cloud** highlighting recurring themes and **Mood Trend Line Chart** (`chart.js` / `react-chartjs-2`).

- **📘 Editorial Guide & Trust Pages**
  - Searchable **Dream Symbolism Encyclopedia**, 3-step Depth Psychology guide, and interactive **FAQ** on the visualizer page.
  - Dedicated **About & Methodology** (`/about`), **Contact & Support** (`/contact`), **Privacy Policy** (`/privacy`), and **Terms of Service** (`/terms`) pages.

- **⚡ Dual Static + Cloud Architecture**
  - Runs seamlessly on static **GitHub Pages** with browser-local persistence (`src/utils/localDreamStore.js`) and static HTTP `200` SPA entrypoints (`scripts/generate-spa-routes.js` + `public/404.html`).
  - Automatically connects to Express + MongoDB REST endpoints (`/api/*`) when deployed full-stack locally or on Vercel (`vercel.json` + `api/index.js`).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Chart.js, `react-chartjs-2`, `react-calendar-heatmap`, CSS3 Glassmorphism (Dark/Light themes) |
| **Backend API** | Node.js, Express 5, CORS, dotenv, IP Rate Limiting |
| **Database & Auth** | MongoDB, Mongoose 8, JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing |
| **AI & Visualization** | Google Gemini 2.5 Flash API (`generativelanguage.googleapis.com`), Pollinations AI Image Rendering, Built-in Jungian Archetype Engine |
| **Deployment** | GitHub Pages (Static SPA + `postbuild` route generator), Vercel Serverless ready (`vercel.json`, `api/index.js`) |

---

## 📁 Project Structure

```text
my-dream-journal/
├── api/
│   └── index.js                  # Vercel serverless Express entry point
├── backend/
│   ├── middleware/
│   │   └── requireAuth.js        # JWT auth middleware
│   ├── models/
│   │   ├── dreamModel.js         # Mongoose Dream schema
│   │   └── userModel.js          # Mongoose User schema
│   ├── routes/
│   │   ├── aiRoutes.js           # /api/ai/visualize (public) & /api/ai/interpret (auth)
│   │   ├── dreamRoutes.js        # Protected Dream CRUD + query filters
│   │   └── userRoutes.js         # Signup & login routes with validation
│   ├── package.json
│   └── server.js                 # Express app, DB connection, /api/health & /api/contact
├── public/
│   ├── 404.html                  # GitHub Pages SPA redirect fallback
│   ├── index.html                # SEO meta tags, OpenGraph, JSON-LD schema
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   └── generate-spa-routes.js    # Postbuild script generating HTTP 200 SPA entrypoints
├── src/
│   ├── components/               # Navbar, Footer, DreamGuideSection, Modals, MoodChart
│   ├── context/                  # AuthContext provider
│   ├── hooks/                    # useAuthContext, useDreamsData, useLogin, useLogout, useSignup
│   ├── pages/                    # VisualizerPage, HomePage, StatsPage, About, Contact, Privacy, Terms, Auth
│   ├── utils/
│   │   ├── dreamAnalyzer.js      # Client-side Gemini (BYOK) + Depth Psychology fallback
│   │   └── localDreamStore.js    # LocalStorage persistence & auth fallback for static mode
│   ├── App.js
│   ├── config.js                 # Centralized API_BASE_URL configuration
│   └── index.css
├── package.json
└── vercel.json                   # Unified SPA + /api/* serverless rewrites
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas connection URI *(optional — static/local browser mode works without a database)*
- Google Gemini API Key *(optional — only needed for server-side Gemini inference)*

### 1. Clone the repository
```bash
git clone https://github.com/Muqtabis/my-dream-journal.git
cd my-dream-journal
```

### 2. Frontend Setup (Static / Browser Mode)
```bash
npm install
npm start
```
The React app starts on `http://localhost:3000`. Without a backend server running, the app automatically operates in local browser storage mode.

### 3. Full-Stack Backend Setup *(Optional)*
Create a `.env` file inside `backend/`:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

Install backend dependencies and start the server:
```bash
cd backend
npm install
npm start
```
The Express API runs on `http://localhost:8000` (configured in `src/config.js` for local development, or override via `REACT_APP_API_URL`).

---

## 🔌 Backend API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server & database connectivity check |
| `POST` | `/api/users/signup` | Public | Register account & receive JWT |
| `POST` | `/api/users/login` | Public | Authenticate & receive JWT |
| `POST` | `/api/ai/visualize` | Public | Rate-limited dream analysis, prompt & artwork generation |
| `POST` | `/api/ai/interpret` | Auth | Quick modal interpretation for saved dreams |
| `GET` | `/api/dreams` | Auth | Fetch user dreams (filters: `category`, `mood`, `isLucid`, `q`) |
| `POST` | `/api/dreams` | Auth | Create a new dream entry |
| `PUT` | `/api/dreams/:id` | Auth | Update an existing dream owned by the user |
| `DELETE` | `/api/dreams/:id` | Auth | Delete a dream owned by the user |
| `POST` | `/api/contact` | Public | Validate and accept contact form inquiries |

---

## 📦 Production Build & Deployment

- **GitHub Pages (Static SPA):**
  ```bash
  npm run build
  ```
  Generates the optimized bundle in `build/` and executes `postbuild` (`scripts/generate-spa-routes.js`) to emit HTTP `200` `index.html` entrypoints for all client routes before publishing `build/` to the `gh-pages` branch.

- **Vercel (Full-Stack Serverless):**
  Configured via `vercel.json` and `api/index.js`. Set `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` in Vercel project environment variables for full cloud persistence and server-side Gemini inference.
