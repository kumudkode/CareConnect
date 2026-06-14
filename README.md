# 🏥 CareConnect — AI-Powered Intelligent Health Platform

> **Live Production URL**: [https://careconnectweb.vercel.app](https://careconnectweb.vercel.app)

CareConnect is a world-class, premium **Next.js 16** web platform that bridges the gap between patient care and clinical intelligence. It empowers individuals to manage treatment courses, understand prescriptions, analyze medical reports, and consult an AI companion — all in one place.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features & Pages](#-features--pages)
- [Environment Configuration](#-environment-configuration)
- [Running Locally](#-running-locally)
- [Test Credentials (Demo Mode)](#-test-credentials-demo-mode)
- [Deployment](#-deployment)
- [What We Built — Full Changelog](#-what-we-built--full-changelog)
- [Connecting to a Real Database](#-connecting-to-a-real-database)

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Full-stack React framework |
| **React 19** | UI component library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **Lucide React** | Premium icon set |
| **Firebase** (Auth + Firestore + Storage) | Backend-as-a-service (production) |
| **Google Gemini AI** (`@google/genai`) | AI prescription parsing, report analysis, chat |
| **Recharts** | Health data charts & visualisations |
| **Vercel** | Hosting & CI/CD |

---

## 📁 Project Structure

```
careconnect_web/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page (public)
│   │   ├── layout.tsx             # Root layout + metadata
│   │   ├── globals.css            # Global styles & design tokens
│   │   ├── login/page.tsx         # Sign in page
│   │   ├── register/page.tsx      # Register/signup page
│   │   ├── dashboard/page.tsx     # Main patient dashboard
│   │   ├── chat/page.tsx          # AI Clinical Chat Interface
│   │   ├── prescriptions/page.tsx # Prescription scanner & extractor
│   │   ├── medicines/page.tsx     # Medication inventory management
│   │   ├── analysis/page.tsx      # Health analytics & report archive
│   │   ├── reports/page.tsx       # Medical reports viewer
│   │   ├── reminders/page.tsx     # Medication & appointment reminders
│   │   ├── profile/page.tsx       # Patient profile & medical history
│   │   ├── admin/page.tsx         # Admin metrics dashboard
│   │   └── api/
│   │       ├── chat/route.ts      # Gemini AI chat API endpoint
│   │       ├── prescription/route.ts  # Prescription parsing API
│   │       └── report/route.ts    # Medical report analysis API
│   ├── components/
│   │   └── DashboardLayout.tsx    # Authenticated layout shell + navigation
│   ├── context/
│   │   └── AuthContext.tsx        # Auth state management (login/register/logout)
│   └── lib/
│       ├── firebase.ts            # Firebase SDK setup + mock mode toggle
│       ├── gemini.ts              # Gemini AI helper & system prompts
│       └── data-service.ts        # Firestore / localStorage data layer
├── public/                        # Static assets
├── .env.local                     # Environment variables (not committed)
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── package.json
```

---

## ✨ Features & Pages

### 🌐 Public Pages

#### Landing Page (`/`)
- Stunning hero section with animated gradient background and grid overlay
- Live interactive demo widget (Chat, Prescription Scan, Report Analyse tabs)
- Stats bar: 50K+ patients, 200K prescriptions, 15+ AI models
- Feature cards: AI Prescriptions, Report Analysis, Medication Management, Clinical Chat, Cloud Records, Voice Assistant
- Step-by-step "How it Works" section (Create → Scan → Analyse)
- **Premium multi-column footer** with brand identity, inspirational slogan, solutions links, and compliance information

#### Login Page (`/login`)
- Warm Organic Wellness design theme (cream background, forest green accents)
- **Clickable Sandbox Presets** — two cards that auto-fill credentials on click:
  - Patient View → `patient@careconnect.com` / `123456`
  - Doctor / Admin → `admin@careconnect.com` / `123456`
- Google OAuth login button
- "Remember me" and "Forgot password?" options

#### Register Page (`/register`)
- Account creation with Name, Email, and Password fields
- Google sign-up option
- Matching Warm Wellness design theme

---

### 🔐 Authenticated Pages (Post-Login)

All authenticated pages are wrapped in `DashboardLayout` with a responsive navigation sidebar.

#### Dashboard (`/dashboard`)
- Welcome banner with patient name and quick-action shortcuts
- Metric cards: Active Medications, Upcoming Reminders, Reports Analysed, Doctor Visits
- Patient journey timeline with colour-coded event types
- Recent prescriptions and upcoming reminders at a glance

#### AI Clinical Chat (`/chat`)
- ChatGPT-style conversational interface
- Multi-session sidebar history with session titles
- Voice input simulator with animated soundwave
- File and image attachment support
- AI responses powered by **Google Gemini** on the backend
- Typing indicator and streaming-style message display

#### Prescription Scanner (`/prescriptions`)
- Drag-and-drop image upload area with a camera/file picker
- Real-time scan progress animation
- Extracted medicine table with:
  - Drug Name, Generic Name, Dosage, Frequency, Duration, Instructions
  - AI Confidence Score (colour-coded badge)
- Save to database and export buttons

#### Medication Inventory (`/medicines`)
- Full CRUD management for patient medications
- Search, filter, and sort by name, category, or status
- Dosage reminder toggle per medicine
- Manual medicine builder form

#### Health Analysis & Reports (`/analysis`)
- Interactive health trend charts powered by **Recharts**:
  - Blood Glucose, Blood Pressure, Cholesterol, Treatment Adherence
- Medical report file drop target (PDF / image upload)
- AI-generated summaries for uploaded reports
- Historical report archive list

#### Medical Reports Viewer (`/reports`)
- Dedicated page for viewing saved medical reports
- Side-by-side original file view with AI summary overlay
- Colour-highlighted key risk values

#### Reminders (`/reminders`)
- Medication and appointment reminder management
- Calendar-style view by date
- Status updates: Mark Complete / Missed
- Add custom reminders with category (Medication, Doctor, Lab, Other)

#### Patient Profile (`/profile`)
- Patient identity editing: Name, Age, Blood Group
- Medical history fields: Allergies, Chronic Conditions, Surgeries
- Profile picture upload with avatar selector
- Persistent storage via `localStorage` (syncs with Firestore in production)
- Privacy preferences and notification toggles

#### Admin Dashboard (`/admin`)
- Platform-wide metrics: Total Registrations, Reports Analysed, Prescriptions Scanned
- Live server/activity log viewer
- Active clinician list
- Clinical query volume charts

---

## ⚙️ Environment Configuration

Create a `.env.local` file inside `careconnect_web/` with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google Gemini AI (server-side only)
GEMINI_API_KEY=your-gemini-api-key
```

> **Note**: If `.env.local` is missing or the Firebase API key is not set, the app automatically switches to **Mock / Demo Mode** — all data is stored in `localStorage` and AI responses use rich pre-built templates. No setup needed to preview the full experience.

---

## 🚀 Running Locally

```bash
# 1. Navigate to the web project directory
cd careconnect_web

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🧪 Test Credentials (Demo Mode)

When Firebase credentials are not configured (or on the live demo site), the app runs in **Mock Mode**. Use these accounts to test different user journeys:

| Role | Email | Password |
|---|---|---|
| 👤 Patient | `patient@careconnect.com` | `123456` |
| 🔑 Doctor / Admin | `admin@careconnect.com` | `123456` |

> On the [Login page](https://careconnectweb.vercel.app/login), just **click either preset card** and the fields will be auto-populated. Then click Sign In.

---

## 📦 Deployment

This project is deployed on **Vercel** under the project name `careconnect_web`.

### Deploy Manually

```bash
# Install Vercel CLI globally (first time only)
npm install -g vercel

# Login (follow browser prompt)
npx vercel login

# Deploy to production
npx vercel --prod --yes
```

**Live Website**: [https://careconnectweb.vercel.app](https://careconnectweb.vercel.app)

---

## 📝 What We Built — Full Changelog

### Phase 1 — Project Foundation
- Initialized **Next.js 16** project inside `careconnect_web/` with TypeScript, Tailwind CSS v4, ESLint, and the App Router.
- Installed all dependencies: `firebase`, `framer-motion`, `lucide-react`, `recharts`, `@google/genai`.
- Configured `globals.css` with a custom design system including:
  - Glassmorphic panel utility classes (`glass-panel`)
  - Glowing container shadows (`glow-primary`)
  - Slim custom scrollbars
  - Browser autofill style overrides

### Phase 2 — Backend Services & Auth
- Built `src/lib/firebase.ts` with automatic **Mock Mode** detection — if `NEXT_PUBLIC_FIREBASE_API_KEY` is missing the whole app falls back gracefully.
- Built `src/lib/data-service.ts` as a unified data layer — reads/writes from Firestore in production and from `localStorage` in Demo Mode.
- Built `src/lib/gemini.ts` with system prompts for:
  - Medical Q&A chat
  - Structured prescription drug extraction
  - Pathology report analysis and summarisation
  - Offline mock response templates for demo use
- Built `src/context/AuthContext.tsx` handling full auth lifecycle: login, register, Google OAuth, logout, and `updateUser()` profile sync.

### Phase 3 — API Route Handlers
- `api/chat/route.ts` — Streams conversational responses from Gemini with a healthcare system prompt.
- `api/prescription/route.ts` — Accepts base64 encoded prescription images, returns structured JSON of extracted medicines.
- `api/report/route.ts` — Accepts medical report files, returns diagnostic summary, findings, and recommendations.

### Phase 4 — Public Page Design
- **Landing Page** (`page.tsx`): Hero with animated grid background, interactive 3-tab demo playground (Chat / Scan / Report), statistics panel, feature cards, step-by-step guide, and a premium multi-column footer.
- **Footer Refactoring**: Removed plain navigation links ("Sign In", "Register", "Clinical Dashboard"). Added a 4-column premium layout with brand section, inspirational slogan, solutions links, and compliance note.
- **Login Page** (`login/page.tsx`): Warm Organic Wellness theme (cream, forest green, terracotta accents), clickable sandbox credential cards, Google OAuth, error states.
- **Register Page** (`register/page.tsx`): Matching design with email, name, and password fields.

### Phase 5 — Authenticated App Shell
- **DashboardLayout**: Warm Wellness-themed sidebar navigation with forest green active indicators, responsive mobile drawer, and top navigation bar with user avatar and logout.

### Phase 6 — Feature Pages
- **Dashboard**: Metric cards, patient journey timeline, recent prescriptions, upcoming reminders.
- **AI Chat**: Multi-session history, voice input simulation, file attachments, animated typing indicator, Gemini AI integration.
- **Prescription Scanner**: Drag-and-drop scanner, animated scan progress, extracted medicines table with confidence scores.
- **Medication Inventory**: Full CRUD, search/filter/sort, dosage reminder toggles.
- **Health Analysis**: Interactive Recharts visualisations (4 health metrics), report file upload target, AI summaries list.
- **Reports Viewer**: Archive list, AI summary overlay, colour-coded risk value highlights.
- **Reminders**: Calendar view, status marking (Complete / Miss), custom reminder builder.
- **Patient Profile**: Name, Age, Blood Group, Allergies, Chronic Conditions, Surgery history, profile picture upload, persistent localStorage sync.
- **Admin Dashboard**: System log viewer, clinician list, platform volume charts.

### Phase 7 — Deployment to Vercel
- Authenticated Vercel CLI and linked the project.
- Deployed the app under a unique project name to avoid namespace conflicts.
- Aliased the deployment to: **[https://careconnectweb.vercel.app](https://careconnectweb.vercel.app)**
- All 18 routes build and deploy as static or server-rendered pages successfully.

---

## 🔌 Connecting to a Real Database

Currently the app runs in **Mock Mode** (localStorage). To connect to a real Firebase backend:

1. **Create a Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable:
   - **Authentication** → Email/Password provider + Google provider
   - **Firestore Database** → Create in production mode
   - **Storage** → For profile pictures and prescription image uploads
3. Copy your Firebase config keys into `.env.local` (see [Environment Configuration](#-environment-configuration))
4. Set Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. **Get a Gemini API Key** at [aistudio.google.com](https://aistudio.google.com) and add it as `GEMINI_API_KEY` in `.env.local`.
6. Restart the dev server — the app will automatically detect real credentials and switch from Mock Mode to Firebase mode.

---

## 🤝 Contributing

This project is structured as a monorepo inside a larger `CareConnect` repository. The web platform lives entirely inside the `careconnect_web/` subdirectory.

---

*Built with ❤️ using Next.js, Google Gemini AI, and Firebase.*
