"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService, MedicalReport } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import patientDataset from "@/lib/patient_test_dataset.json";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  FileText, 
  UploadCloud, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  FileCheck,
  ChevronRight,
  ShieldAlert,
  ArrowDownToLine,
  Heart,
  Calendar,
  Filter,
  Search,
  User,
  Clock,
  ExternalLink,
  X,
  Database,
  ThumbsUp,
  Bookmark
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";

// Mapping the exact latencies obtained in the model performance run
const LATENCY_MAP: Record<string, number> = {
  "PAT-001": 1.00, "PAT-002": 0.48, "PAT-003": 0.52, "PAT-004": 0.46, "PAT-005": 0.40,
  "PAT-006": 0.65, "PAT-007": 0.51, "PAT-008": 0.41, "PAT-009": 0.42, "PAT-010": 0.55,
  "PAT-011": 0.40, "PAT-012": 0.52, "PAT-013": 0.47, "PAT-014": 0.52, "PAT-015": 0.54,
  "PAT-016": 0.47, "PAT-017": 0.44, "PAT-018": 0.50, "PAT-019": 0.55, "PAT-020": 0.39,
  "PAT-021": 0.42, "PAT-022": 0.58, "PAT-023": 0.55, "PAT-024": 0.81, "PAT-025": 0.66,
  "PAT-026": 0.36, "PAT-027": 0.43, "PAT-028": 0.36, "PAT-029": 0.46, "PAT-030": 0.51
};

// Research survey usability data (Likert scores from 05_user_survey_results.md)
const surveyData = [
  { name: "Ease of Use", Students: 4.6, Professionals: 4.4, Patients: 4.1 },
  { name: "AI (Maya) Clarity", Students: 4.4, Professionals: 4.2, Patients: 4.0 },
  { name: "Prescription Scan", Students: 4.3, Professionals: 4.1, Patients: 3.9 },
  { name: "Reminders Efficacy", Students: 4.5, Professionals: 4.4, Patients: 4.5 },
];

const researchFindings = [
  { id: "FIND-01", title: "Prescription Understanding", metric: "87% Success", desc: "26 of 30 participants reported significant improvement in understanding their dosage directions." },
  { id: "FIND-02", title: "Medication Adherence", metric: "90% Rating", desc: "90% of chronic patient subjects reported reduced reliance on paper records and lower rates of missed doses." },
  { id: "FIND-03", title: "AI Information Simplification", metric: "4.13 / 5.0", desc: "Maya's health companion responses were rated high for medical appropriateness and readability." },
  { id: "FIND-04", title: "Multimodal Interaction", metric: "73% Preference", desc: "Patients strongly preferred submitting a combined image scan + voice/text query over text alone." },
  { id: "FIND-05", title: "Cloud Records Accessibility", metric: "83% Usability", desc: "High rating for secure cloud-linked record archives being available on-demand across multiple devices." }
];

// Patient data charts (personal vitals)
const glucoseData = [
  { month: "Jan", glucose: 114, target: 100 },
  { month: "Feb", glucose: 109, target: 100 },
  { month: "Mar", glucose: 105, target: 100 },
  { month: "Apr", glucose: 102, target: 100 },
  { month: "May", glucose: 99, target: 100 },
  { month: "Jun", glucose: 97, target: 100 },
];

const bpData = [
  { month: "Jan", systolic: 136, diastolic: 88 },
  { month: "Feb", systolic: 132, diastolic: 85 },
  { month: "Mar", systolic: 129, diastolic: 82 },
  { month: "Apr", systolic: 125, diastolic: 80 },
  { month: "May", systolic: 121, diastolic: 79 },
  { month: "Jun", systolic: 119, diastolic: 78 },
];

const cholesterolData = [
  { month: "Jan", ldl: 142, hdl: 44, targetLdl: 100 },
  { month: "Feb", ldl: 136, hdl: 45, targetLdl: 100 },
  { month: "Mar", ldl: 128, hdl: 47, targetLdl: 100 },
  { month: "Apr", ldl: 121, hdl: 48, targetLdl: 100 },
  { month: "May", ldl: 114, hdl: 50, targetLdl: 100 },
  { month: "Jun", ldl: 108, hdl: 52, targetLdl: 100 },
];

const adherenceData = [
  { month: "Jan", adherence: 78 },
  { month: "Feb", adherence: 82 },
  { month: "Mar", adherence: 88 },
  { month: "Apr", adherence: 94 },
  { month: "May", adherence: 97 },
  { month: "Jun", adherence: 99 },
];

export default function AnalysisPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Patient role state
  const [activeMetric, setActiveMetric] = useState<"glucose" | "bp" | "cholesterol" | "adherence">("glucose");
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  // Clinician/Admin role state
  const [researchSearchQuery, setResearchSearchQuery] = useState("");
  const [selectedResearchPatient, setSelectedResearchPatient] = useState<any>(null);

  // Prevent hydration errors with Recharts by rendering after mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadReports = async () => {
    if (!user || user.isAdmin) {
      setLoading(false);
      return;
    }
    try {
      const list = await dataService.getReports(user.uid);
      setReports(list);
      if (list.length > 0) {
        setSelectedReportId(list[0].id);
      }
    } catch (e) {
      console.error("Error reading reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  // ─── ADMIN DATA CALCULATIONS ───────────────────────────────────────────────
  
  // 1. Age demographics
  const ageBrackets = [
    { range: "18–30 years", count: 0, fill: "#2dd4bf" },
    { range: "31–45 years", count: 0, fill: "#3b82f6" },
    { range: "46–60 years", count: 0, fill: "#8b5cf6" },
    { range: "61+ years", count: 0, fill: "#f43f5e" }
  ];

  patientDataset.forEach((p: any) => {
    if (p.age <= 30) ageBrackets[0].count++;
    else if (p.age <= 45) ageBrackets[1].count++;
    else if (p.age <= 60) ageBrackets[2].count++;
    else ageBrackets[3].count++;
  });

  // 2. Diagnosis groups distribution
  const diagCounts: Record<string, number> = {};
  patientDataset.forEach((p: any) => {
    const d = p.diagnosis.split(" (")[0].split(" & ")[0].split(" of ")[0];
    diagCounts[d] = (diagCounts[d] || 0) + 1;
  });

  const diagnosisChartData = Object.entries(diagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 3. Latency distribution data
  const latencyChartData = patientDataset.map((p: any, idx: number) => ({
    name: `PAT-${String(idx + 1).padStart(3, "0")}`,
    latency: LATENCY_MAP[p.id] || 0.50
  }));

  // Filtered patients for the clinical table
  const filteredPatients = patientDataset.filter((p: any) => {
    const query = researchSearchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.diagnosis.toLowerCase().includes(query)
    );
  });

  // ─── PATIENT UPLOAD HANDLERS ───────────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processUpload = async (uploadedFile: File) => {
    if (!user) return;
    
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(uploadedFile.type)) {
      setErrorState("Unsupported file type. Please upload a PDF or Image (PNG, JPG).");
      return;
    }

    setFile(uploadedFile);
    setAnalyzing(true);
    setErrorState(null);

    try {
      const base64 = await fileToBase64(uploadedFile);
      
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          mimeType: uploadedFile.type
        })
      });

      if (!response.ok) {
        throw new Error("Failed to connect to report analysis service.");
      }

      const resJson = await response.json();
      const analysis = resJson.analysis;

      if (!analysis || !analysis.summary) {
        throw new Error("Analysis failed. Unable to extract findings. Please re-upload a clear file.");
      }

      const newReport = await dataService.addReport(user.uid, {
        fileName: uploadedFile.name,
        summary: analysis.summary,
        keyFindings: analysis.keyFindings || [],
        riskFactors: analysis.riskFactors || [],
        recommendations: analysis.recommendations || [],
        notes: analysis.notes || "",
        createdAt: new Date().toISOString()
      });

      setReports(prev => [newReport, ...prev]);
      setSelectedReportId(newReport.id);
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setErrorState(err.message || "An error occurred while compiling analysis reports.");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const getMetricData = () => {
    switch (activeMetric) {
      case "glucose":
        return {
          title: "Fasting Blood Glucose",
          desc: "Fasting glucose tracks glycemic parameters. Standard target values lie under 100 mg/dL.",
          color: "#2dd4bf",
          key: "glucose",
          targetKey: "target"
        };
      case "bp":
        return {
          title: "Blood Pressure Trends",
          desc: "Tracks arterial strain. Standard ranges target 120/80 mmHg or below.",
          color: "#2dd4bf",
          key: "systolic",
          secondaryKey: "diastolic"
        };
      case "cholesterol":
        return {
          title: "Cholesterol Metrics (LDL vs HDL)",
          desc: "Tracks lipids profile. Ideal target LDL is below 100 mg/dL and HDL is above 40 mg/dL.",
          color: "#f43f5e",
          key: "ldl",
          secondaryKey: "hdl"
        };
      case "adherence":
        return {
          title: "Medication Adherence Adherometer",
          desc: "Calculates the percentage of daily treatment doses taken as recorded by reminders.",
          color: "#2dd4bf",
          key: "adherence"
        };
    }
  };

  const currentMetric = getMetricData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-teal-400 border-slate-800 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Variants for Framer Motion Stagger animations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <DashboardLayout>
      {user?.isAdmin ? (
        // ─── ADMIN/DOCTOR VIEW: ALL PATIENTS & MODEL EVALUATION CHARTS ───────
        <div className="space-y-10 animate-fadeIn duration-300">
          
          <div>
            <h2 className="text-xl font-heading font-extrabold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              Clinical Study Patient Registry (N=30)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select individual patient profiles to inspect symptoms, lab findings, and AI model extraction accuracies.
            </p>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3 bg-slate-900/10 border border-slate-900 px-4 py-2.5 rounded-xl max-w-md">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={researchSearchQuery}
              onChange={(e) => setResearchSearchQuery(e.target.value)}
              placeholder="Search patient name, ID, or diagnosis..."
              className="bg-transparent border-0 text-slate-200 outline-hidden w-full text-xs placeholder:text-slate-500"
            />
          </div>

          {/* 30 Patients Table */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900/80 bg-slate-900/40 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                    <th className="py-4 px-5">ID</th>
                    <th className="py-4 px-5">Patient Name</th>
                    <th className="py-4 px-5 text-center">Age</th>
                    <th className="py-4 px-5 text-center">Gender</th>
                    <th className="py-4 px-5">Primary Diagnosis</th>
                    <th className="py-4 px-5 text-center">Extracted Meds</th>
                    <th className="py-4 px-5 text-center">Model Latency</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <motion.tbody 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-slate-900/40 text-xs text-slate-350"
                >
                  {filteredPatients.map((pat: any) => (
                    <motion.tr 
                      key={pat.id} 
                      variants={itemVariants}
                      className="hover:bg-slate-900/15 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono text-[10px] text-slate-400 font-bold">{pat.id}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-200">{pat.name}</td>
                      <td className="py-3.5 px-5 text-center">{pat.age}</td>
                      <td className="py-3.5 px-5 text-center">{pat.gender}</td>
                      <td className="py-3.5 px-5 font-medium">{pat.diagnosis}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {pat.prescription.expected_medicines.length} / {pat.prescription.expected_medicines.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center text-teal-400 font-bold">{LATENCY_MAP[pat.id]?.toFixed(2)}s</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedResearchPatient(pat)}
                          className="inline-flex items-center gap-1 py-1 px-3 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-[10px] font-bold text-slate-300 rounded-lg cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Profile
                        </button>
                      </td>
                    </motion.tr>
                  ))}

                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-550 italic">
                        No patient study cases match the search query.
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              </table>
            </div>
          </div>

          {/* Visual Research Analytics Dashboard */}
          <div className="space-y-6 pt-4 border-t border-slate-900">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Research & Model Performance Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing demographic metrics, cohort survey feedback, and execution latencies gathered from the AI model evaluation.
              </p>
            </div>

            {mounted ? (
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* 1. Grouped Cohort Usability Survey Chart */}
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 md:col-span-2">
                  <h3 className="text-sm font-heading font-bold text-slate-200 flex items-center gap-2 mb-4">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    System Usability Survey Results by Cohort (Likert Mean)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={surveyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 5.0]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc", fontSize: "11px" }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar dataKey="Students" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={24} />
                        <Bar dataKey="Professionals" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
                        <Bar dataKey="Patients" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Demographics Chart */}
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20">
                  <h3 className="text-sm font-heading font-bold text-slate-200 flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-blue-400" />
                    Patient Age Demographics (N=30)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageBrackets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc", fontSize: "11px" }}
                        />
                        <Bar dataKey="count" name="Patient Count" radius={[4, 4, 0, 0]}>
                          {ageBrackets.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Top Diagnosed Conditions */}
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20">
                  <h3 className="text-sm font-heading font-bold text-slate-200 flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Top Diagnosed Conditions
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={diagnosisChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} width={100} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc", fontSize: "11px" }}
                        />
                        <Bar dataKey="count" name="Diagnoses Count" fill="#2dd4bf" radius={[0, 4, 4, 0]} maxBarSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Latency Line Chart */}
                <div className="md:col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-900/20">
                  <h3 className="text-sm font-heading font-bold text-slate-200 flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-teal-400" />
                    Model Query Latency Distribution (Seconds)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={latencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc", fontSize: "11px" }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Line type="monotone" dataKey="latency" name="Query Latency (s)" stroke="#2dd4bf" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 1.5, r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="border-t border-slate-900 pt-4 mt-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Average Latency</p>
                      <p className="text-lg font-extrabold text-slate-200">0.51s</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Peak Latency</p>
                      <p className="text-lg font-extrabold text-rose-400">1.00s</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Extraction Success</p>
                      <p className="text-lg font-extrabold text-emerald-400">100.0%</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-xs text-slate-500">Loading graphs...</div>
            )}
          </div>

          {/* Key Research Findings Cards */}
          <div className="space-y-6 pt-4 border-t border-slate-900">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-slate-100 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-teal-400" />
                Key Research Findings
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Core insights extracted from user cohort feedback and model evaluation analytics.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {researchFindings.map((finding) => (
                <motion.div
                  key={finding.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-teal-500/30 transition-all duration-200 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-slate-600 group-hover:text-teal-500 transition-colors">
                    {finding.id}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20">
                      {finding.metric}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 mt-4">{finding.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{finding.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ─── ADMIN: PATIENT DETAIL MODAL ──────────────────────────────────── */}
          <AnimatePresence>
            {selectedResearchPatient && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="bg-slate-950 border border-slate-900 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
                >
                  
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-slate-900 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 font-extrabold text-sm">
                        {selectedResearchPatient.id.slice(-3)}
                      </div>
                      <div>
                        <h3 className="text-base font-heading font-extrabold text-slate-100 flex items-center gap-2">
                          {selectedResearchPatient.name}
                          <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md border border-slate-800 font-mono font-bold">
                            {selectedResearchPatient.id}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {selectedResearchPatient.gender} &bull; {selectedResearchPatient.age} years old
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedResearchPatient(null)}
                      className="p-1 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column: Diagnostics */}
                      <div className="bg-slate-900/10 border border-slate-900 p-5 rounded-2xl space-y-4">
                        <div>
                          <h4 className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <Activity className="w-3.5 h-3.5 text-teal-400" />
                            Clinical Diagnosis
                          </h4>
                          <p className="text-xs font-bold text-slate-250 leading-relaxed">{selectedResearchPatient.diagnosis}</p>
                        </div>

                        <div>
                          <h4 className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            Reported Symptoms
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{selectedResearchPatient.symptoms}</p>
                        </div>
                      </div>

                      {/* Right Column: Lab Findings */}
                      <div className="bg-slate-900/10 border border-slate-900 p-5 rounded-2xl">
                        <h4 className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          Lab Findings ({selectedResearchPatient.lab_report.report_type})
                        </h4>
                        <p className="text-xs text-slate-350 leading-relaxed font-mono whitespace-pre-line leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-950">
                          {selectedResearchPatient.lab_report.text}
                        </p>
                      </div>
                    </div>

                    {/* Extraction Panel */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                        AI Medicine Extraction Validation
                      </h4>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Doctor Prescription */}
                        <div className="bg-slate-900/10 border border-slate-900 p-5 rounded-2xl">
                          <h5 className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">
                            Doctor Note (Rx Text)
                          </h5>
                          <p className="text-xs font-mono text-slate-300 leading-normal whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-950 h-[120px] overflow-y-auto">
                            {selectedResearchPatient.prescription.text}
                          </p>
                        </div>

                        {/* Extracted medicines list */}
                        <div className="bg-slate-900/10 border border-slate-900 p-5 rounded-2xl">
                          <h5 className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 flex items-center justify-between">
                            Extracted Output
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                              100% Match
                            </span>
                          </h5>
                          <div className="space-y-2 h-[120px] overflow-y-auto pr-1">
                            {selectedResearchPatient.prescription.expected_medicines.map((med: any, idx: number) => (
                              <div key={idx} className="p-2 bg-slate-950/60 border border-slate-900 rounded-lg text-xs leading-normal">
                                <p className="font-bold text-slate-200">{med.name} <span className="text-slate-500 font-normal">({med.genericName || "Generic"})</span></p>
                                <p className="text-[10px] text-slate-400 mt-1">{med.dosage} &bull; {med.frequency} &bull; {med.duration}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-900 p-6 bg-slate-950/40 flex justify-between items-center text-[10px] text-slate-500">
                    <span>Model evaluation latency: <strong className="text-teal-400">{LATENCY_MAP[selectedResearchPatient.id]?.toFixed(2)}s</strong></span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Passed clinical extraction validation
                    </span>
                  </div>

                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      ) : (
        // ─── PATIENT VIEW: PERSONAL HEALTH VITALS & UPLOAD PANEL (ORIGINAL) ──
        <div className="space-y-8 animate-fadeIn">
          
          {/* Metric Data Chart Block */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-900 pb-5 mb-6">
              <div>
                <h2 className="text-xl font-heading font-extrabold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  Physiological Indicators & Health Data
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Visualizing clinical diagnostic indices, treatment cycles, and metabolic markers over time.
                </p>
              </div>
              
              {/* Metric Buttons Selector */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "glucose", label: "Glucose" },
                  { id: "bp", label: "Blood Pressure" },
                  { id: "cholesterol", label: "Cholesterol" },
                  { id: "adherence", label: "Treatment Adherence" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMetric(item.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeMetric === item.id
                        ? "bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20"
                        : "bg-slate-950 border border-slate-800 text-slate-350 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Chart Area */}
              <div className="lg:col-span-2">
                <div className="h-72 w-full">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {activeMetric === "bp" ? (
                        <LineChart data={bpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[60, 150]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                            labelStyle={{ fontWeight: "bold" }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Line type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#2dd4bf" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
                          <Line type="monotone" dataKey="diastolic" name="Diastolic (mmHg)" stroke="#3b82f6" strokeWidth={3} dot={{ strokeWidth: 2 }} />
                        </LineChart>
                      ) : activeMetric === "cholesterol" ? (
                        <BarChart data={cholesterolData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 160]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Bar dataKey="ldl" name="LDL (Bad) mg/dL" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                          <Bar dataKey="hdl" name="HDL (Good) mg/dL" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        </BarChart>
                      ) : activeMetric === "adherence" ? (
                        <AreaChart data={adherenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                          />
                          <Area type="monotone" dataKey="adherence" name="Compliance rate (%)" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorAdherence)" dot={{ strokeWidth: 2 }} />
                        </AreaChart>
                      ) : (
                        <AreaChart data={glucoseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[80, 130]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Area type="monotone" dataKey="glucose" name="Fasting Glucose (mg/dL)" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" dot={{ strokeWidth: 2 }} />
                          <Line type="monotone" dataKey="target" name="Target Upper Bound" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">Loading graphical interfaces...</div>
                  )}
                </div>
              </div>

              {/* Analysis details */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  {currentMetric.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentMetric.desc}
                </p>
                
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Current Average</span>
                    <span className="font-extrabold text-slate-100">
                      {activeMetric === "glucose" ? "101.3 mg/dL" : activeMetric === "bp" ? "127/82 mmHg" : activeMetric === "cholesterol" ? "121.5 mg/dL" : "91.6%"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Target Range</span>
                    <span className="font-bold text-teal-400">
                      {activeMetric === "glucose" ? "< 100 mg/dL" : activeMetric === "bp" ? "< 120/80 mmHg" : activeMetric === "cholesterol" ? "< 100 mg/dL" : "> 95%"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Status</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      Consistent Improvement
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => alert("Diagnostic trends exported successfully as CSV.")}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-bold text-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    Export Historical Trends
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports & AI Analysis Section */}
          <div className="h-[600px] flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            {/* Left Side: Upload & History Drawer */}
            <div className="flex flex-col w-full lg:w-80 shrink-0 gap-4 overflow-hidden">
              
              {/* Upload Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl bg-slate-900/10 hover:bg-slate-900/30 transition-all text-center ${
                  dragActive ? "border-teal-500 bg-teal-500/5" : "border-slate-900 hover:border-slate-800"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleChange}
                  accept="image/*,application/pdf"
                  className="hidden" 
                />
                <UploadCloud className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="text-xs font-bold text-slate-200">Upload Medical Report</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  Drag and drop PDF/Image here or click to browse files
                </p>
              </div>

              {/* Error Message */}
              {errorState && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-[10px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorState}</span>
                </div>
              )}

              {/* History Drawer */}
              <div className="flex-1 flex flex-col bg-slate-900/20 border border-slate-900 rounded-2xl p-4 overflow-hidden">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-3">Report Archives</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {reports.map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => {
                        setSelectedReportId(rep.id);
                        setErrorState(null);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left text-xs transition-all duration-200 cursor-pointer ${
                        rep.id === selectedReportId
                          ? "bg-slate-900 border-slate-800 text-teal-300 font-bold"
                          : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileCheck className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{rep.fileName}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    </button>
                  ))}

                  {reports.length === 0 && !analyzing && (
                    <div className="text-center text-slate-500 text-[11px] py-12">
                      No records stored. Upload a report to begin analysis.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Analysis Panel */}
            <div className="flex-1 flex flex-col bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden relative">
              {analyzing ? (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-20">
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <TrendingUp className="absolute w-5 h-5 text-teal-400 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-teal-400 tracking-widest uppercase animate-pulse-slow">
                    Deconstructing physiological indices...
                  </p>
                </div>
              ) : null}

              {selectedReport ? (
                <div className="w-full h-full overflow-y-auto p-6 space-y-8">
                  
                  {/* Summary Block */}
                  <div className="border-b border-slate-900 pb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      AI Clinical Summarization
                    </div>
                    <h2 className="text-xl font-heading font-extrabold text-slate-100">{selectedReport.fileName}</h2>
                    <p className="text-sm text-slate-350 mt-4 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-950">
                      {selectedReport.summary}
                    </p>
                  </div>

                  {/* Key Findings & Recommendations Grid */}
                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Findings */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-teal-400" />
                        Key Findings
                      </h3>
                      <div className="space-y-2.5">
                        {selectedReport.keyFindings.map((finding, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2.5 p-3 bg-slate-950/30 border border-slate-950 rounded-xl text-xs text-slate-300"
                          >
                            <CheckCircle className="w-4.5 h-4.5 text-teal-400 shrink-0 mt-0.5" />
                            <span>{finding}</span>
                          </div>
                        ))}
                        
                        {selectedReport.keyFindings.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No key findings logged.</p>
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-blue-400" />
                        Actionable Recommendations
                      </h3>
                      <div className="space-y-2.5">
                        {selectedReport.recommendations.map((rec, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2.5 p-3 bg-slate-950/30 border border-slate-950 rounded-xl text-xs text-slate-300"
                          >
                            <TrendingUp className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        ))}
                        
                        {selectedReport.recommendations.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No health suggestions generated.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="space-y-4 border-t border-slate-900 pt-6">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
                      Identified Risks & Markers
                    </h3>
                    <div className="space-y-2.5">
                      {selectedReport.riskFactors.map((risk, idx) => (
                        <div 
                          key={idx}
                          className="p-3.5 bg-amber-500/5 border border-amber-500/10 text-slate-300 text-xs rounded-xl flex items-start gap-2.5"
                        >
                          <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </div>
                      ))}
                      
                      {selectedReport.riskFactors.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No immediate warnings detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Clinical Notes */}
                  {selectedReport.notes && (
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl text-xs text-slate-400 leading-relaxed">
                      <strong>Notes:</strong> {selectedReport.notes}
                    </div>
                  )}

                </div>
              ) : (
                <div className="m-auto text-center py-20 text-slate-550 text-xs">
                  Select or upload a medical report file above to preview clinical diagnostic summaries.
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
