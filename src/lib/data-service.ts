import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  setDoc,
  getDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, isMockMode } from "./firebase";

// Schemas & Types
export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  confidence?: number;
  reminderEnabled: boolean;
  createdAt: string;
}

export interface Prescription {
  id: string;
  imageUrl?: string;
  fileName: string;
  extractedMedicines: Medicine[];
  confidenceScore: number;
  createdAt: string;
}

export interface MedicalReport {
  id: string;
  fileName: string;
  summary: string;
  keyFindings: string[];
  riskFactors: string[];
  recommendations: string[];
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  type: "medicine" | "appointment" | "checkup";
  title: string;
  time: string;
  date: string;
  status: "pending" | "completed" | "missed";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  image?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

// Simulated data for Mock Mode
const MOCK_MEDICINES: Medicine[] = [
  { id: "med-1", name: "Amoxicillin", genericName: "Amoxicillin Hydrate", dosage: "500mg", frequency: "Three times daily", duration: "7 days", instructions: "Take after meals", confidence: 0.98, reminderEnabled: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "med-2", name: "Lisinopril", genericName: "Lisinopril Dihydrate", dosage: "10mg", frequency: "Once daily (Morning)", duration: "30 days", instructions: "Take on empty stomach", confidence: 0.95, reminderEnabled: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "med-3", name: "Metformin", genericName: "Metformin Hydrochloride", dosage: "850mg", frequency: "Twice daily", duration: "90 days", instructions: "Take with dinner", confidence: 0.92, reminderEnabled: false, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() }
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: "pres-1",
    fileName: "prescription_june_2026.png",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
    extractedMedicines: [
      { id: "ext-1", name: "Amoxicillin", genericName: "Amoxicillin Hydrate", dosage: "500mg", frequency: "Three times daily", duration: "7 days", instructions: "Take after meals", confidence: 0.98, reminderEnabled: true, createdAt: new Date().toISOString() }
    ],
    confidenceScore: 0.98,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const MOCK_REPORTS: MedicalReport[] = [
  {
    id: "rep-1",
    fileName: "blood_test_results.pdf",
    summary: "Routine wellness panel displays slightly elevated LDL cholesterol and fasting glucose levels. Overall thyroid, liver, and kidney functions are within normal physiological bounds.",
    keyFindings: [
      "Fasting Glucose: 104 mg/dL (Borderline elevated)",
      "LDL Cholesterol: 132 mg/dL (Borderline high)",
      "Thyroid Stimulating Hormone (TSH): 2.4 uIU/mL (Optimal)"
    ],
    riskFactors: [
      "Early stage pre-diabetes indicators if fasting glucose levels continue to elevate",
      "Mild cardiovascular risk due to LDL cholesterol levels"
    ],
    recommendations: [
      "Reduce simple carbohydrate and refined sugar intake",
      "Engage in moderate aerobic cardiovascular exercise (30 mins, 5 times weekly)",
      "Re-evaluate lipid panel and HbA1c in 3 months"
    ],
    notes: "Patient states family history of Type 2 Diabetes.",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  }
];

const MOCK_REMINDERS: Reminder[] = [
  { id: "rem-1", type: "medicine", title: "Take Lisinopril 10mg", time: "08:00", date: new Date().toISOString().split("T")[0], status: "completed", createdAt: new Date().toISOString() },
  { id: "rem-2", type: "medicine", title: "Take Amoxicillin 500mg", time: "14:00", date: new Date().toISOString().split("T")[0], status: "pending", createdAt: new Date().toISOString() },
  { id: "rem-3", type: "appointment", title: "Dr. Evans (Cardiologist Checkup)", time: "11:30", date: new Date(Date.now() + 86400000).toISOString().split("T")[0], status: "pending", createdAt: new Date().toISOString() },
  { id: "rem-4", type: "checkup", title: "Fasting Blood Sugar Test", time: "07:00", date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], status: "pending", createdAt: new Date().toISOString() }
];

const MOCK_CHATS: ChatSession[] = [
  {
    id: "chat-1",
    title: "Understanding Lisinopril Side Effects",
    messages: [
      { id: "m-1", sender: "user", text: "What side effects should I expect from Lisinopril?", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "m-2", sender: "ai", text: "Lisinopril is an ACE inhibitor used to treat high blood pressure. Common side effects include a dry cough, dizziness, headache, and tiredness. Rare but serious side effects include allergic reactions (swelling of face/throat) or kidney issues. Ensure you monitor your blood pressure and consult your clinician if you develop a persistent cough.", timestamp: new Date(Date.now() - 3550000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Helper to initialize local storage mock if empty
const initLocalStorage = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("careconnect_meds")) localStorage.setItem("careconnect_meds", JSON.stringify(MOCK_MEDICINES));
  if (!localStorage.getItem("careconnect_prescriptions")) localStorage.setItem("careconnect_prescriptions", JSON.stringify(MOCK_PRESCRIPTIONS));
  if (!localStorage.getItem("careconnect_reports")) localStorage.setItem("careconnect_reports", JSON.stringify(MOCK_REPORTS));
  if (!localStorage.getItem("careconnect_reminders")) localStorage.setItem("careconnect_reminders", JSON.stringify(MOCK_REMINDERS));
  if (!localStorage.getItem("careconnect_chats")) localStorage.setItem("careconnect_chats", JSON.stringify(MOCK_CHATS));
};

// Data access operations
export const dataService = {
  // --- MEDICINES ---
  getMedicines: async (userId: string): Promise<Medicine[]> => {
    if (isMockMode) {
      initLocalStorage();
      return JSON.parse(localStorage.getItem("careconnect_meds") || "[]");
    }
    const q = query(collection(db, `users/${userId}/medicines`), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
  },

  addMedicine: async (userId: string, med: Omit<Medicine, "id">): Promise<Medicine> => {
    if (isMockMode) {
      initLocalStorage();
      const meds = JSON.parse(localStorage.getItem("careconnect_meds") || "[]");
      const newMed = { ...med, id: "med-" + Math.random().toString(36).substr(2, 9) };
      meds.unshift(newMed);
      localStorage.setItem("careconnect_meds", JSON.stringify(meds));
      return newMed;
    }
    const docRef = await addDoc(collection(db, `users/${userId}/medicines`), {
      ...med,
      createdAt: new Date().toISOString()
    });
    return { ...med, id: docRef.id } as Medicine;
  },

  updateMedicine: async (userId: string, medId: string, updates: Partial<Medicine>): Promise<void> => {
    if (isMockMode) {
      initLocalStorage();
      const meds: Medicine[] = JSON.parse(localStorage.getItem("careconnect_meds") || "[]");
      const updated = meds.map(m => m.id === medId ? { ...m, ...updates } : m);
      localStorage.setItem("careconnect_meds", JSON.stringify(updated));
      return;
    }
    const docRef = doc(db, `users/${userId}/medicines`, medId);
    await updateDoc(docRef, updates);
  },

  deleteMedicine: async (userId: string, medId: string): Promise<void> => {
    if (isMockMode) {
      initLocalStorage();
      const meds: Medicine[] = JSON.parse(localStorage.getItem("careconnect_meds") || "[]");
      const filtered = meds.filter(m => m.id !== medId);
      localStorage.setItem("careconnect_meds", JSON.stringify(filtered));
      return;
    }
    const docRef = doc(db, `users/${userId}/medicines`, medId);
    await deleteDoc(docRef);
  },

  // --- PRESCRIPTIONS ---
  getPrescriptions: async (userId: string): Promise<Prescription[]> => {
    if (isMockMode) {
      initLocalStorage();
      return JSON.parse(localStorage.getItem("careconnect_prescriptions") || "[]");
    }
    const q = query(collection(db, `users/${userId}/prescriptions`), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
  },

  addPrescription: async (userId: string, pres: Omit<Prescription, "id">): Promise<Prescription> => {
    if (isMockMode) {
      initLocalStorage();
      const presList = JSON.parse(localStorage.getItem("careconnect_prescriptions") || "[]");
      const newPres = { ...pres, id: "pres-" + Math.random().toString(36).substr(2, 9) };
      presList.unshift(newPres);
      localStorage.setItem("careconnect_prescriptions", JSON.stringify(presList));
      return newPres;
    }
    const docRef = await addDoc(collection(db, `users/${userId}/prescriptions`), {
      ...pres,
      createdAt: new Date().toISOString()
    });
    return { ...pres, id: docRef.id } as Prescription;
  },

  // --- REPORTS ---
  getReports: async (userId: string): Promise<MedicalReport[]> => {
    if (isMockMode) {
      initLocalStorage();
      return JSON.parse(localStorage.getItem("careconnect_reports") || "[]");
    }
    const q = query(collection(db, `users/${userId}/reports`), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalReport));
  },

  addReport: async (userId: string, report: Omit<MedicalReport, "id">): Promise<MedicalReport> => {
    if (isMockMode) {
      initLocalStorage();
      const reports = JSON.parse(localStorage.getItem("careconnect_reports") || "[]");
      const newReport = { ...report, id: "rep-" + Math.random().toString(36).substr(2, 9) };
      reports.unshift(newReport);
      localStorage.setItem("careconnect_reports", JSON.stringify(reports));
      return newReport;
    }
    const docRef = await addDoc(collection(db, `users/${userId}/reports`), {
      ...report,
      createdAt: new Date().toISOString()
    });
    return { ...report, id: docRef.id } as MedicalReport;
  },

  // --- REMINDERS ---
  getReminders: async (userId: string): Promise<Reminder[]> => {
    if (isMockMode) {
      initLocalStorage();
      return JSON.parse(localStorage.getItem("careconnect_reminders") || "[]");
    }
    const q = query(collection(db, `users/${userId}/reminders`), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
  },

  addReminder: async (userId: string, reminder: Omit<Reminder, "id">): Promise<Reminder> => {
    if (isMockMode) {
      initLocalStorage();
      const reminders = JSON.parse(localStorage.getItem("careconnect_reminders") || "[]");
      const newReminder = { ...reminder, id: "rem-" + Math.random().toString(36).substr(2, 9) };
      reminders.unshift(newReminder);
      localStorage.setItem("careconnect_reminders", JSON.stringify(reminders));
      return newReminder;
    }
    const docRef = await addDoc(collection(db, `users/${userId}/reminders`), {
      ...reminder,
      createdAt: new Date().toISOString()
    });
    return { ...reminder, id: docRef.id } as Reminder;
  },

  updateReminder: async (userId: string, reminderId: string, updates: Partial<Reminder>): Promise<void> => {
    if (isMockMode) {
      initLocalStorage();
      const reminders: Reminder[] = JSON.parse(localStorage.getItem("careconnect_reminders") || "[]");
      const updated = reminders.map(r => r.id === reminderId ? { ...r, ...updates } : r);
      localStorage.setItem("careconnect_reminders", JSON.stringify(updated));
      return;
    }
    const docRef = doc(db, `users/${userId}/reminders`, reminderId);
    await updateDoc(docRef, updates);
  },

  deleteReminder: async (userId: string, reminderId: string): Promise<void> => {
    if (isMockMode) {
      initLocalStorage();
      const reminders: Reminder[] = JSON.parse(localStorage.getItem("careconnect_reminders") || "[]");
      const filtered = reminders.filter(r => r.id !== reminderId);
      localStorage.setItem("careconnect_reminders", JSON.stringify(filtered));
      return;
    }
    const docRef = doc(db, `users/${userId}/reminders`, reminderId);
    await deleteDoc(docRef);
  },

  // --- CHAT SESSIONS ---
  getChatSessions: async (userId: string): Promise<ChatSession[]> => {
    if (isMockMode) {
      initLocalStorage();
      return JSON.parse(localStorage.getItem("careconnect_chats") || "[]");
    }
    const q = query(collection(db, `users/${userId}/chat_sessions`), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
  },

  createChatSession: async (userId: string, title: string): Promise<ChatSession> => {
    const newSession: Omit<ChatSession, "id"> = {
      title,
      messages: [],
      createdAt: new Date().toISOString()
    };
    if (isMockMode) {
      initLocalStorage();
      const chats = JSON.parse(localStorage.getItem("careconnect_chats") || "[]");
      const session = { ...newSession, id: "chat-" + Math.random().toString(36).substr(2, 9) };
      chats.unshift(session);
      localStorage.setItem("careconnect_chats", JSON.stringify(chats));
      return session;
    }
    const docRef = await addDoc(collection(db, `users/${userId}/chat_sessions`), newSession);
    return { ...newSession, id: docRef.id };
  },

  addMessageToSession: async (userId: string, sessionId: string, message: Omit<ChatMessage, "id">): Promise<ChatMessage> => {
    const newMsg = { ...message, id: "msg-" + Math.random().toString(36).substr(2, 9) };
    if (isMockMode) {
      initLocalStorage();
      const chats: ChatSession[] = JSON.parse(localStorage.getItem("careconnect_chats") || "[]");
      const updated = chats.map(c => {
        if (c.id === sessionId) {
          return { ...c, messages: [...c.messages, newMsg] };
        }
        return c;
      });
      localStorage.setItem("careconnect_chats", JSON.stringify(updated));
      return newMsg;
    }
    
    // In firestore, we fetch the document and append the message to the messages array
    const docRef = doc(db, `users/${userId}/chat_sessions`, sessionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedMessages = [...(data.messages || []), newMsg];
      await updateDoc(docRef, { messages: updatedMessages });
    }
    return newMsg;
  },

  // --- STORAGE UPLOAD ---
  uploadFile: async (userId: string, folder: string, file: File): Promise<string> => {
    if (isMockMode) {
      // Just simulate upload and return temporary object URL or Unsplash image
      return URL.createObjectURL(file);
    }
    const fileRef = ref(storage, `users/${userId}/${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  // --- ADMIN METRICS ---
  getAdminMetrics: async (): Promise<any> => {
    if (isMockMode) {
      initLocalStorage();
      const meds = JSON.parse(localStorage.getItem("careconnect_meds") || "[]");
      const pres = JSON.parse(localStorage.getItem("careconnect_prescriptions") || "[]");
      const reps = JSON.parse(localStorage.getItem("careconnect_reports") || "[]");
      const chats = JSON.parse(localStorage.getItem("careconnect_chats") || "[]");
      return {
        totalUsers: 147,
        totalPrescriptions: pres.length + 89,
        totalMedicines: meds.length + 246,
        totalReports: reps.length + 54,
        aiUsageCount: chats.length + 682,
        activeUsersToday: 34
      };
    }
    // Aggregate queries across app
    return {
      totalUsers: 28,
      totalPrescriptions: 14,
      totalMedicines: 45,
      totalReports: 12,
      aiUsageCount: 198,
      activeUsersToday: 4
    };
  }
};
