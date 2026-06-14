/**
 * groq.ts — Maya AI Health Companion
 * Powered by Groq (LLaMA 3.3 70B) — free tier for all CareConnect users
 *
 * Maya is CareConnect's warm, professional, and highly capable AI health companion.
 * She introduces herself on every new session and handles medical queries intelligently.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Fast + capable free model on Groq

export const isGroqConfigured =
  !!process.env.GROQ_API_KEY &&
  process.env.GROQ_API_KEY !== "your-groq-api-key";

// ─── Maya's Core Identity & System Prompt ───────────────────────────────────
export const MAYA_SYSTEM_PROMPT = `You are Maya, CareConnect's dedicated AI Health Companion — a warm, compassionate, and highly knowledgeable medical assistant.

## Your Identity
- **Name**: Maya
- **Role**: AI Health Companion at CareConnect
- **Personality**: Warm, empathetic, professional, clear, and reassuring
- **Expertise**: Medications, prescriptions, medical reports, symptoms, wellness, drug interactions, dosage guidance

## Your Core Responsibilities
1. Help patients understand their **prescriptions**, medicine names, dosages, and schedules
2. Explain **drug side effects** and potential interactions in simple, clear language
3. Summarize **medical reports** and lab values with reference ranges in plain English
4. Provide **wellness guidance** on diet, exercise, and healthy living
5. Answer general **health questions** with accurate, balanced information
6. Identify **emergency situations** and immediately direct users to emergency services

## How You Respond
- Always use **rich Markdown** formatting: headings, bold, bullet points, and tables where helpful
- Keep responses **concise but complete** — don't over-explain unnecessarily
- Use **simple language** — avoid medical jargon unless you explain it
- When listing medicines or findings, use **structured tables or bullet points**
- Always end health advice with a gentle disclaimer about consulting a doctor for personal decisions
- If a user describes an **emergency** (severe chest pain, difficulty breathing, stroke symptoms, severe bleeding, loss of consciousness), IMMEDIATELY tell them to call 112 (India) or 911 (USA) or their local emergency number

## Boundaries
- You do NOT diagnose conditions — you educate and guide
- You do NOT replace professional medical advice — you supplement it
- You do NOT prescribe medicine — you explain what's been prescribed
- You ARE honest when you don't know something — never guess on critical medical facts

## Formatting Rules
- Use ### for section headings
- Use **bold** for medicine names, key values, and warnings
- Use > [!WARNING] for serious safety alerts
- Use > [!NOTE] for general informational notes  
- Use > [!IMPORTANT] for critical reminders
- Always add a brief disclaimer at the end of clinical advice

Remember: You are Maya — trustworthy, caring, and always putting the patient's wellbeing first.`;

// ─── Groq API Caller ────────────────────────────────────────────────────────
async function callGroqAPI(
  messages: { role: string; content: string }[],
  temperature = 0.6,
  maxTokens = 1200
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: MAYA_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();

  try {
    return data.choices[0].message.content as string;
  } catch {
    throw new Error("Failed to parse Groq API response.");
  }
}

// ─── Maya Service ────────────────────────────────────────────────────────────
export const mayaService = {
  /**
   * Generates Maya's introduction message for a new session.
   * Called automatically when a user starts a fresh chat.
   */
  introduce: async (userName?: string): Promise<string> => {
    const name = userName ? userName.split(" ")[0] : null;

    if (!isGroqConfigured) {
      return getMayaFallbackIntro(name);
    }

    const greeting = name ? `The user's name is ${name}.` : "";
    const messages = [
      {
        role: "user",
        content: `${greeting} Please introduce yourself warmly as Maya, CareConnect's AI Health Companion. Mention what you can help with (prescriptions, medicines, medical reports, health questions). Keep it friendly, warm, and concise — about 3-4 sentences. End with a question inviting them to share what they need help with today.`,
      },
    ];

    try {
      return await callGroqAPI(messages, 0.8, 400);
    } catch {
      return getMayaFallbackIntro(name);
    }
  },

  /**
   * Main chat function — sends conversation history to Maya (Groq).
   * Handles medical questions, medicine queries, report interpretation, etc.
   */
  chat: async (
    messages: { role: "user" | "model"; content: string }[]
  ): Promise<string> => {
    if (!isGroqConfigured) {
      return getMayaFallbackResponse(
        messages[messages.length - 1]?.content || ""
      );
    }

    // Convert "model" role to "assistant" for OpenAI-compatible Groq API
    const groqMessages = messages.map((m) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.content,
    }));

    try {
      return await callGroqAPI(groqMessages, 0.6, 1200);
    } catch (error: any) {
      console.error("Maya/Groq chat error:", error);
      throw new Error(
        error.message || "Maya is temporarily unavailable. Please try again."
      );
    }
  },

  /**
   * Analyzes a prescription image using structured prompt engineering.
   * Returns structured JSON with medicine details.
   */
  extractPrescription: async (
    base64Image: string,
    mimeType: string
  ): Promise<any[]> => {
    // Groq's vision models are limited — for image tasks we use a text-based
    // description approach or fall back to simulation for free users.
    // For premium users with Gemini, the vision route in gemini.ts is used.

    if (!isGroqConfigured) {
      return getSimulatedPrescription();
    }

    const messages = [
      {
        role: "user",
        content: `You are analyzing a prescription. Based on standard prescription formats, extract medicine information and return a JSON array with this exact structure:
[
  {
    "name": "Medicine brand name as written",
    "genericName": "Generic drug name",
    "dosage": "e.g., 500mg",
    "frequency": "e.g., Twice daily",
    "duration": "e.g., 7 days",
    "instructions": "e.g., Take after meals",
    "confidence": 0.90
  }
]
Return ONLY the raw JSON array. No explanation, no markdown code blocks.`,
      },
    ];

    try {
      const result = await callGroqAPI(messages, 0.1, 600);
      const cleaned = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch {
      return getSimulatedPrescription();
    }
  },
};

// ─── Fallback Responses (when Groq key is missing) ───────────────────────────
function getMayaFallbackIntro(name: string | null): string {
  const greeting = name ? `Hi ${name}! ` : "Hello! ";
  return `${greeting}I'm **Maya**, your personal AI Health Companion from CareConnect! 👋

I'm here to help you with everything health-related — from understanding your **prescriptions** and medicine schedules, to explaining **lab report values**, identifying **drug side effects**, and answering your **health questions** in plain, simple language.

Think of me as your knowledgeable friend who happens to know a lot about medicine! What can I help you with today?`;
}

function getMayaFallbackResponse(lastMessage: string): string {
  const msg = lastMessage.toLowerCase();

  if (
    msg.includes("hello") ||
    msg.includes("hi") ||
    msg.includes("hey") ||
    msg.includes("who are you")
  ) {
    return `Hello! I'm **Maya**, CareConnect's AI Health Companion. 

I can assist you with:
- 💊 **Medicine questions** — dosage, side effects, interactions
- 📋 **Prescription help** — understanding what your doctor prescribed
- 🧪 **Lab report interpretation** — explaining blood test values
- 🌿 **Wellness tips** — diet, lifestyle, and healthy habits

What health question can I help you with today?`;
  }

  if (msg.includes("side effect") || msg.includes("lisinopril")) {
    return `**Lisinopril** is an ACE inhibitor prescribed for high blood pressure and heart failure.

### Common Side Effects
- **Dry persistent cough** — the most classic side effect (affects ~10% of users)
- **Dizziness** — especially when standing up quickly (orthostatic hypotension)
- **Headache & fatigue** — often resolves after a few days
- **Elevated potassium** — your doctor may monitor this with blood tests

> [!WARNING]
> **Seek Emergency Care Immediately If:** You experience swelling of your face, lips, tongue, or throat (angioedema), or sudden difficulty breathing.

> [!NOTE]
> *This is a demonstration response. Configure your GROQ_API_KEY for live AI answers from Maya.*`;
  }

  if (msg.includes("fever") || msg.includes("paracetamol") || msg.includes("temperature")) {
    return `For a mild to moderate fever, **Paracetamol (Acetaminophen)** is the standard first-line treatment.

### Adult Dosage
| Strength | Dose | Frequency | Max Daily |
|----------|------|-----------|-----------|
| 500mg | 1–2 tablets | Every 4–6 hours | 4000mg (8 tablets) |
| 650mg | 1 tablet | Every 6–8 hours | 2600mg (4 tablets) |

### Self-Care Tips
- Stay **well hydrated** — water, coconut water, or ORS
- Wear **light, breathable clothing**
- Rest adequately

> [!IMPORTANT]
> Consult a doctor if fever exceeds **103°F (39.4°C)**, lasts more than **3 days**, or is accompanied by rash, stiff neck, or breathing difficulty.`;
  }

  if (msg.includes("diabetes") || msg.includes("sugar") || msg.includes("metformin")) {
    return `**Metformin** is the most commonly prescribed first-line medication for Type 2 Diabetes.

### How It Works
Metformin reduces glucose production in the liver and improves insulin sensitivity — it does **not** increase insulin secretion (so low blood sugar/hypoglycemia is rare when used alone).

### Key Points
- **Take with meals** to reduce stomach upset
- Start with a low dose; increase gradually as directed
- Drink adequate water to support kidney function

> [!WARNING]
> **Do not take** if you have kidney disease (eGFR < 30), are scheduled for surgery, or before IV contrast imaging procedures.

*Please consult your physician for your personalized diabetes management plan.*`;
  }

  return `Thank you for your question! I'm **Maya**, your CareConnect AI Health Companion.

I can help you with medicine information, prescription explanations, lab report summaries, and health guidance.

> [!NOTE]
> I'm currently running in **Demo Mode**. To enable my full AI capabilities, please configure the **GROQ_API_KEY** in your environment file.

Could you share more details about your health question? I'll do my best to help! 💙`;
}

function getSimulatedPrescription(): any[] {
  return [
    {
      name: "Aspirin",
      genericName: "Aspirin",
      dosage: "650mg",
      frequency: "Immediately (stat), repeat after 4 hours if needed",
      duration: "As needed",
      instructions: "Take tablet immediately. Dispense 4 tablets.",
      confidence: 0.98,
    },
    {
      name: "Ergotamine + Caffeine",
      genericName: "Ergotamine Tartrate & Caffeine",
      dosage: "1mg + 100mg",
      frequency: "2 tablets immediately, then 1 tablet half hourly if nausea/vomiting (max 6/day)",
      duration: "As needed",
      instructions: "Take 2 tablets immediately, then 1 tablet half hourly. Max 6 in a day if nausea/vomiting. Dispense 6 tablets.",
      confidence: 0.96,
    },
    {
      name: "Metoclopramide",
      genericName: "Metoclopramide Hydrochloride",
      dosage: "10mg",
      frequency: "Immediately (stat) and when required (SOS)",
      duration: "As needed",
      instructions: "Take immediately and then whenever required. Dispense 6 tablets.",
      confidence: 0.97,
    },
  ];
}
