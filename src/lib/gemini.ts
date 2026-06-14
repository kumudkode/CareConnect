export const isGeminiConfigured = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-api-key";

// System prompts
const CHAT_SYSTEM_INSTRUCTION = `You are CareConnect, a professional, compassionate, and highly intelligent AI medical companion. 
Your goal is to help patients understand prescriptions, drug side effects, medical report summaries, and healthy living guidelines.
Guidelines:
1. Provide reliable, clear, clinical explanations in simple language.
2. Highlight that your answers are for educational purposes and do not replace professional medical advice.
3. If asked about emergency symptoms (severe chest pain, breathing difficulty, severe bleeding), immediately urge the user to call emergency services.
4. Use rich Markdown formatting (bullet points, bold text, alerts) for readability.`;

// Rest API calling function
async function callGeminiAPI(payload: any, model = "gemini-2.5-flash"): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  return await response.json();
}

// Extract text from Gemini output
function getResponseText(apiResponse: any): string {
  try {
    return apiResponse.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Failed to parse Gemini response text:", error);
    return "Error generating response.";
  }
}

export const geminiService = {
  chat: async (
    messages: { role: "user" | "model"; content: string }[]
  ): Promise<string> => {
    if (!isGeminiConfigured) {
      // Simulate premium chat responses based on user message keywords
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
      
      if (lastMsg.includes("side effect") || lastMsg.includes("lisinopril")) {
        return `**Lisinopril** is an ACE (Angiotensin-Converting Enzyme) inhibitor commonly prescribed for high blood pressure and heart failure. 

### Common Side Effects
* **Dry Cough:** A tickling, dry cough is the most classic side effect. It is harmless but can be annoying.
* **Dizziness:** Especially when standing up quickly.
* **Headache & Fatigue:** Often subsides after a few days of starting the medication.

> [!WARNING]
> **Seek Immediate Care If:** You experience swelling of your face, lips, tongue, or throat (angioedema), or have difficulty breathing.

*Note: This is a simulation. For live answers, please configure the Gemini API key.*`;
      }
      
      if (lastMsg.includes("fever") || lastMsg.includes("paracetamol")) {
        return `For a mild fever, **Paracetamol (Acetaminophen)** is generally recommended as a first-line treatment.

### Dosage Guidelines
* **Adults:** 500mg to 1000mg every 4 to 6 hours as needed. Do not exceed 4000mg (4g) in any 24-hour period.
* **Children:** Dosage must be calculated based on weight, not age. Consult a pediatrician.

### Practical Tips
1. Stay well hydrated by drinking water, herbal teas, or clear broths.
2. Rest and wear lightweight clothing.

> [!IMPORTANT]
> If your fever exceeds 103°F (39.4°C) or lasts more than 3 days, consult a physician promptly.`;
      }

      return `Hello! I am your **CareConnect Companion**. 

I can assist you with:
* Explaining medicine dosages and interactions.
* Summarizing complex blood test or MRI reports.
* Health and wellness guidelines.

What questions can I answer for you today? 

*(Note: Currently running in Demo Mode with simulated responses).*`;
    }

    // Build the request contents payload
    const contents = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: CHAT_SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    };

    const response = await callGeminiAPI(payload);
    return getResponseText(response);
  },

  extractPrescription: async (
    base64Image: string,
    mimeType: string
  ): Promise<any> => {
    if (!isGeminiConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      // Return simulated prescription JSON
      return [
        {
          name: "Amoxicillin",
          genericName: "Amoxicillin Trihydrate",
          dosage: "500 mg",
          frequency: "3 times daily",
          duration: "7 days",
          instructions: "Take with food to avoid stomach upset. Complete full course.",
          confidence: 0.96
        },
        {
          name: "Ibuprofen",
          genericName: "Ibuprofen",
          dosage: "400 mg",
          frequency: "Every 6 hours as needed",
          duration: "5 days",
          instructions: "Take after meals for pain/swelling.",
          confidence: 0.94
        }
      ];
    }

    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Image
              }
            },
            {
              text: `Analyze this prescription image. Extract all medicine details and return them strictly in JSON format matching this schema:
              [
                {
                  "name": "Brand name or medicine name as written",
                  "genericName": "Generic drug name if identifiable, otherwise empty",
                  "dosage": "e.g., 500mg, 1 tablet",
                  "frequency": "e.g., Once daily, Three times a day",
                  "duration": "e.g., 7 days, 1 month",
                  "instructions": "Specific instructions like 'take after food' if listed",
                  "confidence": 0.95
                }
              ]
              Return ONLY the raw JSON block without markdown code blocks. Ensure correct JSON structure.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const response = await callGeminiAPI(payload);
    const text = getResponseText(response);
    try {
      // Clean potential JSON markdown blocks if any returned
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", text, e);
      return [];
    }
  },

  analyzeReport: async (
    base64File: string,
    mimeType: string,
    extractedText?: string
  ): Promise<any> => {
    if (!isGeminiConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      // Return simulated report analysis JSON
      return {
        summary: "CBC and Metabolic panel shows a general state of good health with minor elevations in fasting glucose and blood pressure indicators.",
        keyFindings: [
          "Fasting Glucose: 104 mg/dL (Reference range: 70-99 mg/dL) - Borderline elevated.",
          "Systolic Blood Pressure: 132 mmHg - Stage 1 Pre-hypertension.",
          "Hemoglobin: 14.2 g/dL - Optimal."
        ],
        riskFactors: [
          "Increased risk of type 2 diabetes if glucose trends upward.",
          "Mild cardiovascular strain due to blood pressure."
        ],
        recommendations: [
          "Reduce dietary sodium and processed sugar intake.",
          "Include 30 minutes of aerobic exercise daily.",
          "Recheck glucose and lipid levels in 90 days."
        ],
        notes: "No family history of heart disease reported. Recommended lifestyle adjustments before introducing therapeutic drugs."
      };
    }

    const contentParts: any[] = [];
    if (extractedText) {
      contentParts.push({ text: `Report Text Content:\n${extractedText}` });
    } else {
      contentParts.push({
        inlineData: {
          mimeType,
          data: base64File
        }
      });
    }

    contentParts.push({
      text: `Analyze this clinical report or lab document. Return a comprehensive breakdown matching this JSON structure:
      {
        "summary": "High-level summary of the health state shown in the report",
        "keyFindings": ["Finding 1 with reference range", "Finding 2"],
        "riskFactors": ["Identified risk 1", "Identified risk 2"],
        "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
        "notes": "Any other critical notices"
      }
      Return ONLY the raw JSON block without markdown code blocks. Ensure proper JSON formatting.`
    });

    const payload = {
      contents: [{ parts: contentParts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    const response = await callGeminiAPI(payload);
    const text = getResponseText(response);
    try {
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse report analysis JSON:", text, e);
      return {
        summary: "Could not parse medical report details.",
        keyFindings: [],
        riskFactors: [],
        recommendations: [],
        notes: "Please re-upload a clear copy of the report."
      };
    }
  }
};
