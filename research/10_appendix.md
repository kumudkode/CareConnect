# Appendix — CareConnect Research Paper

---

## Appendix A: Application Screenshots
*(Insert screenshots from the live app at https://careconnectweb.vercel.app)*

| Screen | Description |
|--------|-------------|
| A1 | Landing Page — Hero section with CTA buttons |
| A2 | Login Page — Warm wellness theme with preset credentials |
| A3 | Dashboard — Patient overview with metric cards |
| A4 | Maya AI Chat — Conversation with formatted response |
| A5 | Prescription Scanner — Upload + extracted medicines table |
| A6 | Medicine Inventory — List with reminder toggles |
| A7 | Health Analysis — Recharts vitals visualization |
| A8 | Reminders — Calendar view with status badges |

---

## Appendix B: API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | Maya AI chat (Groq LLaMA 3.3) |
| POST | `/api/prescription` | Prescription image extraction (Gemini Vision) |
| POST | `/api/report` | Medical report analysis |
| GET | `/health` | FastAPI backend health check |
| WS | `/ws/{uid}/{session_id}` | WebSocket streaming (FastAPI backend) |

---

## Appendix C: Database Schema (Firestore)

```
users/{uid}/
├── medicines/        → { name, genericName, dosage, frequency, 
│                          duration, instructions, reminderEnabled, createdAt }
├── prescriptions/    → { fileName, imageUrl, extractedMedicines[], 
│                          confidenceScore, createdAt }
├── reports/          → { fileName, summary, keyFindings[], 
│                          riskFactors[], recommendations[], createdAt }
├── reminders/        → { type, title, time, date, status, createdAt }
└── chat_sessions/    → { title, createdAt, 
                           messages: [{id, sender, text, timestamp}] }
```

---

## Appendix D: Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | Next.js | 16.2 | Full-stack React framework |
| Language | TypeScript | 5.x | Type-safe development |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| Icons | Lucide React | Latest | UI icon library |
| Mobile App | Flutter | 3.x | Cross-platform mobile |
| Auth & DB | Firebase | 11.x | Authentication + Firestore |
| AI (free tier) | Groq LLaMA 3.3 | 70B | Maya AI assistant |
| AI (vision) | Google Gemini | 2.5 Flash | Prescription + report analysis |
| Backend | FastAPI (Python) | 0.115 | WebSocket + ADK runtime |
| Deployment | Vercel | Latest | Web hosting + CI/CD |
| Cloud | Google Cloud Run | Latest | Backend microservices |

---

## Appendix E: Functional Testing Results

| # | Test Case | Expected | Result | Status |
|---|-----------|----------|--------|--------|
| 1 | User registration | Account created | Account created | ✅ Pass |
| 2 | Email + password login | Dashboard loads | Dashboard loaded | ✅ Pass |
| 3 | Google OAuth login | Dashboard loads | Dashboard loaded | ✅ Pass |
| 4 | Maya AI chat response | Reply within 3s | Avg 1.2s | ✅ Pass |
| 5 | Prescription image upload | Medicines extracted | 3 medicines found | ✅ Pass |
| 6 | Medicine add/edit/delete | CRUD works | All operations pass | ✅ Pass |
| 7 | Reminder creation | Saved and listed | Saved correctly | ✅ Pass |
| 8 | Report analysis upload | AI summary returned | Summary returned | ✅ Pass |
| 9 | Mock mode fallback | App runs without Firebase | Runs with localStorage | ✅ Pass |
| 10 | Mobile responsiveness | Usable on mobile screen | All pages responsive | ✅ Pass |

**Overall Pass Rate: 10/10 (100%)**
