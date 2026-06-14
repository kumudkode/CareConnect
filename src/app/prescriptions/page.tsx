"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { dataService, Medicine } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ScanLine, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Trash2,
  Sparkles,
  Download,
  Bot
} from "lucide-react";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [scanning, setScanning] = useState(false);
  const [extractedMeds, setExtractedMeds] = useState<Medicine[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
        setImagePreview(URL.createObjectURL(droppedFile));
        setSavedSuccess(false);
        setErrorState(null);
      } else {
        setErrorState("Please upload an image file (PNG, JPG, WEBP).");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setSavedSuccess(false);
      setErrorState(null);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setImagePreview(null);
    setExtractedMeds([]);
    setSavedSuccess(false);
    setErrorState(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Convert file to Base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip out metadata prefix (e.g. data:image/png;base64,)
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleScan = async () => {
    if (!file || !user) return;
    setScanning(true);
    setErrorState(null);
    setExtractedMeds([]);

    try {
      const base64 = await fileToBase64(file);
      
      const response = await fetch("/api/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          mimeType: file.type
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process scan query. Backend response error.");
      }

      const data = await response.json();
      const meds = data.medicines || [];
      
      if (meds.length === 0) {
        throw new Error("No medicine details could be extracted. Please upload a clearer image.");
      }

      setExtractedMeds(meds);
      
      // Calculate overall average confidence
      const avgConf = meds.reduce((acc: number, m: any) => acc + (m.confidence || 0.9), 0) / meds.length;
      setConfidence(avgConf);

      // Save prescription record to DB
      await dataService.addPrescription(user.uid, {
        fileName: file.name,
        extractedMedicines: meds,
        confidenceScore: avgConf,
        createdAt: new Date().toISOString()
      });
      
    } catch (err: any) {
      console.error(err);
      setErrorState(err.message || "Failed to analyze prescription using Google Gemini.");
    } finally {
      setScanning(false);
    }
  };

  const handleSaveToInventory = async () => {
    if (extractedMeds.length === 0 || !user) return;
    try {
      // Add each medicine to user's dashboard inventory
      await Promise.all(
        extractedMeds.map(med => 
          dataService.addMedicine(user.uid, {
            name: med.name,
            genericName: med.genericName || "",
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions || "",
            confidence: med.confidence || 0.95,
            reminderEnabled: true,
            createdAt: new Date().toISOString()
          })
        )
      );
      setSavedSuccess(true);
      setExtractedMeds([]);
    } catch (err) {
      console.error(err);
      setErrorState("Failed to commit medicines to database.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Upload Container */}
        {!imagePreview ? (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer flex flex-col items-center justify-center p-12 sm:p-16 border-2 border-dashed rounded-2xl bg-slate-900/10 hover:bg-slate-900/30 transition-all duration-200 ${
              dragActive ? "border-teal-500 bg-teal-500/5" : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleChange}
              accept="image/*"
              className="hidden" 
            />
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 text-teal-400 mb-6">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-200">Upload Prescription Scan</h3>
            <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
              Drag and drop your prescription image here, or click to browse files from your computer.
            </p>
            <span className="text-[10px] text-slate-600 mt-4 uppercase font-semibold tracking-wider">Supports PNG, JPG, WEBP</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Image Preview & Scanner Visual */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center">
              <div className="flex items-center justify-between w-full border-b border-slate-900 pb-3 mb-6">
                <span className="text-xs text-slate-400 font-bold">{file?.name}</span>
                <button 
                  onClick={clearSelection}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  disabled={scanning}
                >
                  Clear Selection
                </button>
              </div>

              <div className="relative w-full max-h-[450px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img 
                  src={imagePreview} 
                  alt="Prescription" 
                  className={`w-full h-auto max-h-[450px] object-contain ${scanning ? "opacity-45" : ""}`}
                />
                
                {/* Visual scanline bar */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 animate-bounce shadow-[0_0_15px_rgba(20,184,166,0.8)] z-10"></div>
                )}
              </div>

              {!scanning && extractedMeds.length === 0 && (
                <button
                  onClick={handleScan}
                  className="w-full mt-6 py-3.5 bg-gradient-to-tr from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/10"
                >
                  <ScanLine className="w-5 h-5 animate-pulse" />
                  Initiate AI Prescription Scan
                </button>
              )}

              {scanning && (
                <div className="w-full mt-6 text-center py-4 bg-slate-950/40 rounded-xl border border-slate-900">
                  <span className="text-xs font-bold text-teal-400 animate-pulse tracking-widest uppercase">
                    Analyzing handwritten details...
                  </span>
                </div>
              )}
            </div>

            {/* Extracted Details Table */}
            <div className="space-y-6">
              {errorState && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorState}</span>
                </div>
              )}

              {savedSuccess && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-200">
                  <div className="flex items-center gap-3 mb-2 text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                    <h4 className="font-heading font-bold">Medicines Saved Successfully</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All scanned medication records have been successfully added to your medication inventory dashboard. Reminders have been activated.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link href="/medicines" className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                      Go to Inventory
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {extractedMeds.length > 0 && (
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-200">Scanned Ingredients</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Identified via Google Gemini Vision API</p>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      confidence > 0.9 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      Confidence: {(confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 text-xs text-slate-500 uppercase font-bold">
                          <th className="pb-3 pr-2">Medicine</th>
                          <th className="pb-3 pr-2">Dosage</th>
                          <th className="pb-3 pr-2">Frequency</th>
                          <th className="pb-3">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-xs text-slate-300">
                        {extractedMeds.map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30">
                            <td className="py-3.5 pr-2">
                              <p className="font-bold text-slate-200">{med.name}</p>
                              {med.genericName && (
                                <p className="text-[10px] text-slate-500 mt-0.5 italic">{med.genericName}</p>
                              )}
                            </td>
                            <td className="py-3.5 pr-2 font-mono text-slate-400">{med.dosage}</td>
                            <td className="py-3.5 pr-2 text-slate-400">{med.frequency}</td>
                            <td className="py-3.5 font-mono text-slate-400">{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-6">
                    <button
                      onClick={handleSaveToInventory}
                      className="py-3 bg-gradient-to-tr from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl transition-all"
                    >
                      Save to Dashboard
                    </button>
                    
                    <button
                      onClick={handlePrint}
                      className="py-3 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
