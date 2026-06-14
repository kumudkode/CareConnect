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
  Eye, 
  FileCheck,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    if (!user) return;
    try {
      const list = await dataService.getReports(user.uid);
      setReports(list);
      if (list.length > 0) {
        setSelectedReportId(list[0].id);
      }
    } catch (e) {
      console.error(e);
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
    
    // Support image or PDF files
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

      // Save report
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

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-180px)] flex flex-col lg:flex-row gap-6 overflow-hidden">
        
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
            <h4 className="text-xs font-bold text-slate-200">Upload Report</h4>
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
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left text-xs transition-all duration-200 ${
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
        <div className="flex-1 flex bg-slate-900/20 border border-slate-900 rounded-2xl overflow-y-auto p-6 relative">
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
            <div className="w-full space-y-8">
              
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
            <div className="m-auto text-center py-20 text-slate-500 text-xs">
              Select or scan a report file to preview health intelligence diagnostics.
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
