# Data Analysis Tools — CareConnect Research Paper

## Tools Used for Data Analysis

### 1. Functional Testing — Flutter / Next.js Test Frameworks
**Purpose**: Verify each feature works as expected (pass/fail).

| Test Case | Tool | Result |
|-----------|------|--------|
| User login/registration | Manual + Firebase | ✅ Pass |
| AI chat (Maya) response | Postman / browser | ✅ Pass |
| Prescription image scan | Manual upload test | ✅ Pass |
| Medicine CRUD operations | Manual UI testing | ✅ Pass |
| Reminder creation | Manual UI testing | ✅ Pass |
| Report analysis | Manual upload test | ✅ Pass |
| Google OAuth login | Manual browser test | ✅ Pass |
| Mock mode fallback | Env var removal test | ✅ Pass |
| Mobile responsiveness | Chrome DevTools | ✅ Pass |
| API error handling | Invalid input test | ✅ Pass |

---

### 2. Performance Evaluation — Browser DevTools + API Logs
**Purpose**: Measure system response times.

| Feature | Average Response Time |
|---------|-----------------------|
| Maya AI chat (Groq) | ~1.2 seconds |
| Prescription extraction | ~2.8 seconds |
| Report analysis | ~3.1 seconds |
| Firebase auth | ~0.4 seconds |
| Page load (dashboard) | ~0.9 seconds |

---

### 3. Statistical Analysis — Google Sheets
**Purpose**: Analyze Likert-scale survey responses from 30 participants.

Metrics calculated:
- Mean score per question
- Standard deviation
- Group comparison (students vs. professionals vs. patients)

---

### 4. Comparative Analysis — Feature Matrix
**Purpose**: Benchmark CareConnect against existing healthcare apps.

| Feature | CareConnect | Practo | 1mg | HealthifyMe |
|---------|-------------|--------|-----|-------------|
| AI chat assistant | ✅ | ❌ | ❌ | ✅ (limited) |
| Prescription scanning | ✅ | ❌ | ❌ | ❌ |
| Medical report analysis | ✅ | ❌ | ❌ | ❌ |
| Medication reminders | ✅ | ✅ | ✅ | ✅ |
| Cloud record storage | ✅ | ✅ | ✅ | ✅ |
| Doctor consultation | ❌ | ✅ | ✅ | ❌ |
| Free AI access | ✅ | ❌ | ❌ | ❌ |
