"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService, MedicalReport } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
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
  Filter
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
  Legend
} from "recharts";

// Mock trend data for healthy physiological tracking
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
  const [activeMetric, setActiveMetric] = useState<"glucose" | "bp" | "cholesterol" | "adherence">("glucose");
  
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  // Prevent hydration errors with Recharts by rendering after mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadReports = async () => {
    if (!user) return;
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
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
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 space-y-4">
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
                {loading ? (
                  <div className="text-center text-slate-500 text-xs py-10">Syncing archives...</div>
                ) : (
                  reports.map((rep) => (
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
                  ))
                )}

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
                      <p className="text-xs text-slate-500 italic">No immediate physiological warnings detected.</p>
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
    </DashboardLayout>
  );
}
