"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Activity, 
  ArrowRight, 
  Bot, 
  ScanLine, 
  Pill, 
  FileText, 
  Calendar, 
  Shield, 
  Clock,
  Sparkles,
  Users,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  // Interactive Playground States
  const [demoTab, setDemoTab] = useState<"chat" | "scan" | "report">("chat");
  const [demoState, setDemoState] = useState<"idle" | "loading" | "success">("idle");
  const [demoChat, setDemoChat] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your CareConnect Companion. Click one of the quick prompts below to see how I help patients understand side effects and drug conflicts." }
  ]);
  const [demoScanResult, setDemoScanResult] = useState<any>(null);
  const [demoReportResult, setDemoReportResult] = useState<any>(null);

  const handleChatPrompt = (prompt: string, reply: string) => {
    if (demoState === "loading") return;
    setDemoChat(prev => [...prev, { sender: "user", text: prompt }]);
    setDemoState("loading");
    setTimeout(() => {
      setDemoChat(prev => [...prev, { sender: "ai", text: reply }]);
      setDemoState("idle");
    }, 1200);
  };

  const handleScanRun = () => {
    if (demoState === "loading") return;
    setDemoState("loading");
    setTimeout(() => {
      setDemoScanResult([
        { name: "Amoxicillin", generic: "Amoxicillin Hydrate", dosage: "500mg", freq: "3x daily", conf: "98%" },
        { name: "Lisinopril", generic: "Lisinopril Dihydrate", dosage: "10mg", freq: "Once daily", conf: "95%" }
      ]);
      setDemoState("success");
    }, 1800);
  };

  const handleReportRun = () => {
    if (demoState === "loading") return;
    setDemoState("loading");
    setTimeout(() => {
      setDemoReportResult({
        summary: "Blood panel shows elevated fasting glucose (104 mg/dL) and LDL (132 mg/dL). Renal functions are optimal.",
        risks: ["Borderline cardiovascular strain", "Pre-diabetes indicators"],
        recs: ["Reduce dietary sodium", "Re-evaluate HbA1c in 90 days"]
      });
      setDemoState("success");
    }, 1850);
  };

  const resetDemo = (tab: "chat" | "scan" | "report") => {
    setDemoTab(tab);
    setDemoState("idle");
    setDemoChat([
      { sender: "ai", text: `Welcome to the ${tab === "chat" ? "AI Chat" : tab === "scan" ? "Prescription Scanner" : "Report Analyzer"} playground. Test the interactive tools below!` }
    ]);
    setDemoScanResult(null);
    setDemoReportResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E2C22] overflow-x-hidden selection:bg-[#D97D64]/20 selection:text-[#1C4331] relative">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E6E2D8_1px,transparent_1px),linear-gradient(to_bottom,#E6E2D8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50 z-0"></div>

      {/* Decorative Blur Nodes */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D97D64]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#1C4331]/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Header Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-[#E6E2D8] bg-[#FAF7F2]/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C4331] to-[#D97D64] flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[10px] flex items-center justify-center">
              <Activity className="w-5.5 h-5.5 text-[#1C4331]" />
            </div>
          </div>
          <div>
            <span className="font-heading text-xl font-bold text-[#1E2C22] tracking-tight">
              CareConnect
            </span>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-[#1E2C22]/85 hover:text-[#1C4331] transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="text-sm font-semibold bg-[#1C4331] hover:bg-[#2C5E43] text-[#FAF7F2] px-4.5 py-2.5 rounded-xl shadow-md hover:shadow-[#1C4331]/10 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          className="flex-1 text-center lg:text-left z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1C4331]/5 text-[#1C4331] border border-[#1C4331]/10 mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Interactive Clinical Simulation Live
          </div>
          
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none text-[#1E2C22]">
            AI-Powered <br className="hidden sm:inline" />
            <span className="text-[#1C4331]">
              Intelligent Healthcare
            </span> <br />
            Companion
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-slate-650 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Understand prescriptions instantly, track medications seamlessly, analyze medical reports with expert insights, and receive personalized care guidelines in real-time.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link 
              href="/register" 
              className="flex items-center justify-center gap-2 font-semibold bg-[#1C4331] hover:bg-[#2C5E43] text-[#FAF7F2] px-6 py-3.5 rounded-xl shadow-xl hover:shadow-[#1C4331]/25 transition-all duration-200"
            >
              Get Started for Free
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 font-semibold bg-white hover:bg-[#FAF7F2] text-[#1E2C22] px-6 py-3.5 rounded-xl border border-[#E6E2D8] hover:border-[#D97D64]/30 transition-all duration-200"
            >
              Try AI Assistant
            </Link>
          </div>
        </motion.div>

        {/* Hero Interactive Playground Mockup */}
        <motion.div 
          className="flex-1 w-full relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl border border-[#E6E2D8] bg-white p-4 shadow-xl shadow-[#1E2C22]/3 overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1C4331]/3 to-transparent pointer-events-none rounded-2xl"></div>
            
            {/* Mock Dashboard UI Header */}
            <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#BD483A]"></span>
                <span className="w-3 h-3 rounded-full bg-[#CF7C53]"></span>
                <span className="w-3 h-3 rounded-full bg-[#3C7A5A]"></span>
                <span className="text-xs text-slate-400 font-mono ml-2">careconnect-interactive-demo.clinic</span>
              </div>
              <span className="text-[10px] bg-[#1C4331]/5 text-[#1C4331] px-2 py-0.5 rounded-full border border-[#1C4331]/10 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Live Demo Mode
              </span>
            </div>

            {/* Interactive Tab Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-[#FAF7F2] p-1 rounded-xl border border-[#E6E2D8]">
              <button 
                onClick={() => resetDemo("chat")}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  demoTab === "chat" ? "bg-white text-[#1C4331] shadow-sm border border-[#E6E2D8]" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                AI Assistant
              </button>
              <button 
                onClick={() => resetDemo("scan")}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  demoTab === "scan" ? "bg-white text-[#1C4331] shadow-sm border border-[#E6E2D8]" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Scanner
              </button>
              <button 
                onClick={() => resetDemo("report")}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  demoTab === "report" ? "bg-white text-[#1C4331] shadow-sm border border-[#E6E2D8]" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Report Analyzer
              </button>
            </div>

            {/* Tab content 1: AI Chat */}
            {demoTab === "chat" && (
              <div className="space-y-3">
                <div className="bg-[#FAF7F2]/45 border border-[#E6E2D8] rounded-xl p-3.5 max-h-[220px] overflow-y-auto space-y-3 text-left">
                  {demoChat.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2.5 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 border ${
                        msg.sender === "ai" ? "bg-[#1C4331]/10 border-[#1C4331]/20 text-[#1C4331]" : "bg-slate-100 border-slate-200 text-slate-650"
                      }`}>
                        {msg.sender === "ai" ? "AI" : "Us"}
                      </div>
                      <p className={`text-[11px] p-2.5 rounded-xl border ${
                        msg.sender === "ai" ? "bg-white border-[#E6E2D8] text-slate-700" : "bg-[#1C4331]/5 border-[#1C4331]/10 text-[#1E2C22]"
                      } max-w-[80%] leading-relaxed`}>
                        {msg.text}
                      </p>
                    </div>
                  ))}
                  
                  {demoState === "loading" && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-6 h-6 rounded-md bg-[#1C4331]/10 border border-[#1C4331]/20 flex items-center justify-center text-[10px] text-[#1C4331] animate-pulse">AI</div>
                      <div className="p-2.5 bg-white border border-[#E6E2D8] rounded-xl flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#1C4331] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[#1C4331] rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-[#1C4331] rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Predefined prompt pills */}
                <div className="flex gap-2 flex-wrap justify-start py-1">
                  <button
                    onClick={() => handleChatPrompt(
                      "What side effects does Lisinopril have?",
                      "Lisinopril is an ACE inhibitor used to treat hypertension. Common side effects include a dry, persistent cough, dizziness, and headaches. Alert your doctor immediately if you experience facial swelling."
                    )}
                    className="text-[10px] bg-white border border-[#E6E2D8] hover:border-[#D97D64]/50 px-2.5 py-1.5 rounded-lg text-[#1E2C22] font-semibold transition-all cursor-pointer"
                    disabled={demoState === "loading"}
                  >
                    💊 Lisinopril Side Effects
                  </button>
                  <button
                    onClick={() => handleChatPrompt(
                      "Paracetamol dosage?",
                      "For adults, the typical dosage is 500mg to 1000mg every 4-6 hours as needed. Do not exceed 4000mg (4 grams) in any 24-hour period to avoid liver strain."
                    )}
                    className="text-[10px] bg-white border border-[#E6E2D8] hover:border-[#D97D64]/50 px-2.5 py-1.5 rounded-lg text-[#1E2C22] font-semibold transition-all cursor-pointer"
                    disabled={demoState === "loading"}
                  >
                    📋 Paracetamol Dose
                  </button>
                </div>
              </div>
            )}

            {/* Tab content 2: Scanner */}
            {demoTab === "scan" && (
              <div className="space-y-4">
                {!demoScanResult && demoState !== "loading" && (
                  <div className="flex items-center gap-3 bg-[#FAF7F2]/45 border border-[#E6E2D8] rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1C4331]/10 border border-[#1C4331]/20 flex items-center justify-center shrink-0">
                      <ScanLine className="w-5 h-5 text-[#1C4331]" />
                    </div>
                    <div className="flex-grow min-w-0 text-left">
                      <p className="text-xs font-bold text-[#1E2C22] truncate">prescription_june.png</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Ready to scan & deconstruct</p>
                    </div>
                    <button
                      onClick={handleScanRun}
                      className="px-3.5 py-1.5 bg-[#1C4331] hover:bg-[#2C5E43] text-[#FAF7F2] text-[10px] font-extrabold rounded-lg hover:shadow-lg transition-all cursor-pointer"
                    >
                      Run AI Scan
                    </button>
                  </div>
                )}

                {demoState === "loading" && (
                  <div className="p-8 bg-[#FAF7F2]/45 border border-[#E6E2D8] rounded-xl text-center relative overflow-hidden">
                    <div className="absolute inset-x-0 h-0.5 bg-[#D97D64] animate-bounce shadow-md"></div>
                    <span className="text-[10px] font-bold text-[#1C4331] animate-pulse uppercase tracking-wider">Analyzing handwriting...</span>
                  </div>
                )}

                {demoScanResult && demoState === "success" && (
                  <div className="bg-[#FAF7F2]/45 border border-[#E6E2D8] rounded-xl p-3.5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] border-b border-[#E6E2D8] pb-2">
                      <span className="font-bold text-slate-550">Scanned Ingredients</span>
                      <span className="text-[#1C4331] font-semibold">97% confidence score</span>
                    </div>
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="text-slate-500 border-b border-[#E6E2D8] font-bold uppercase">
                          <th className="pb-1">Medicine</th>
                          <th className="pb-1">Dose</th>
                          <th className="pb-1">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E2D8] text-slate-650">
                        {demoScanResult.map((med: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2">
                              <p className="font-bold text-[#1E2C22]">{med.name}</p>
                              <p className="text-[8px] text-slate-500 italic">{med.generic}</p>
                            </td>
                            <td className="py-2 text-[#1C4331] font-mono">{med.dosage}</td>
                            <td className="py-2 text-[#1C4331]">{med.freq}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab content 3: Report Analyzer */}
            {demoTab === "report" && (
              <div className="space-y-4">
                {!demoReportResult && demoState !== "loading" && (
                  <div className="flex items-center gap-3 bg-[#FAF7F2]/45 border border-[#E6E2D8] rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-[#D97D64]/10 border border-[#D97D64]/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#D97D64]" />
                    </div>
                    <div className="flex-grow min-w-0 text-left">
                      <p className="text-xs font-bold text-[#1E2C22] truncate">blood_test_results.pdf</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Ready to compile findings</p>
                    </div>
                    <button
                      onClick={handleReportRun}
                      className="px-3.5 py-1.5 bg-[#1C4331] hover:bg-[#2C5E43] text-[#FAF7F2] text-[10px] font-extrabold rounded-lg hover:shadow-lg transition-all cursor-pointer"
                    >
                      Run AI Analysis
                    </button>
                  </div>
                )}

                {demoState === "loading" && (
                  <div className="p-8 bg-[#FAF7F2]/45 border border-[#E6E2D8] rounded-xl text-center flex flex-col items-center justify-center gap-2">
                    <div className="w-5.5 h-5.5 border-2 border-t-[#1C4331] border-slate-200 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold text-[#1C4331] animate-pulse uppercase tracking-wider">Compiling lab indicators...</span>
                  </div>
                )}

                {demoReportResult && demoState === "success" && (
                  <div className="bg-[#FAF7F2]/45 border border-[#E6E2D8] rounded-xl p-3.5 text-left space-y-3">
                    <div>
                      <span className="text-[8px] font-extrabold uppercase bg-[#1C4331]/10 text-[#1C4331] border border-[#1C4331]/25 px-1.5 py-0.5 rounded-full">AI Summary</span>
                      <p className="text-[10px] text-[#1E2C22]/85 mt-1.5 leading-relaxed">{demoReportResult.summary}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-[#E6E2D8] pt-2 text-[10px]">
                      <div>
                        <span className="text-[#BD483A] font-extrabold text-[8px] uppercase tracking-wide">Risks</span>
                        <ul className="list-disc pl-3 mt-1 space-y-0.5 leading-normal">
                          {demoReportResult.risks.map((r: string, idx: number) => (
                            <li key={idx} className="text-slate-650">{r}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[#3C7A5A] font-extrabold text-[8px] uppercase tracking-wide">Suggestions</span>
                        <ul className="list-disc pl-3 mt-1 space-y-0.5 leading-normal">
                          {demoReportResult.recs.map((r: string, idx: number) => (
                            <li key={idx} className="text-slate-650">{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Premium Overlapping Floating Badges */}
            <div className="absolute bottom-16 -right-10 bg-white border border-[#E6E2D8] p-3 rounded-xl shadow-lg shadow-[#1E2C22]/5 flex items-center gap-3 animate-float-slow max-w-[210px] hidden sm:flex z-25">
              <div className="w-8 h-8 rounded-lg bg-[#3C7A5A]/15 border border-[#3C7A5A]/20 flex items-center justify-center text-[#3C7A5A] shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">Reminder Active</p>
                <p className="text-[10px] font-bold text-[#1E2C22] mt-0.5 truncate">Lisinopril 10mg - 8:00 AM</p>
              </div>
            </div>
            
            <div className="absolute top-16 -left-10 bg-white border border-[#E6E2D8] p-2.5 rounded-xl shadow-lg shadow-[#1E2C22]/5 flex items-center gap-2 animate-float-slow max-w-[190px] hidden sm:flex z-25" style={{ animationDelay: "1.5s" }}>
              <div className="w-7.5 h-7.5 rounded-lg bg-[#BD483A]/15 border border-[#BD483A]/20 flex items-center justify-center text-[#BD483A] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wide">Safety Check</p>
                <p className="text-[9.5px] font-bold text-[#BD483A] mt-0.5">0 Drug Conflicts</p>
              </div>
            </div>

          </div>
        </motion.div>
      </header>

      {/* Stats Section */}
      <section className="bg-white border-y border-[#E6E2D8] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { metric: "10K+", label: "Prescriptions Processed", icon: ScanLine },
            { metric: "5K+", label: "Active Users", icon: Users },
            { metric: "98%", label: "Extraction Accuracy", icon: CheckCircle },
            { metric: "24/7", label: "AI Assistance", icon: Clock },
          ].map((stat, idx) => (
            <div key={idx} className="text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E6E2D8] flex items-center justify-center mb-3">
                <stat.icon className="w-5 h-5 text-[#1C4331]" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1E2C22]">{stat.metric}</span>
              <span className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#1E2C22]">
            Comprehensive Clinical Intelligence
          </h2>
          <p className="text-slate-500 mt-4">
            A full suite of healthcare tools built to manage treatments, scan documents, and support recovery.
          </p>
        </div>

        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            { title: "AI Healthcare Assistant", desc: "Interact via text, voice, or file attachments for immediate answers to medication questions.", icon: Bot },
            { title: "Prescription Intelligence", desc: "Scan physical prescriptions to extract dosages, chemical formulas, and verify confidence values.", icon: ScanLine },
            { title: "Medication Management", desc: "Track treatment courses, view historical reports, and maintain search-sort lists of chemicals.", icon: Pill },
            { title: "Medical Report Analysis", desc: "Deconstruct complex clinical blood sheets and pathology reports into plain, clear summaries.", icon: FileText },
            { title: "Cloud Healthcare Records", desc: "Securely store medical histories, scans, and doctor schedules in a centralized cloud vault.", icon: Shield },
            { title: "Voice Healthcare Assistant", desc: "Dictate queries or transcribe clinical comments during medical follow-ups.", icon: Activity },
          ].map((feat, idx) => (
            <motion.div 
              key={idx} 
              className="group relative p-6 rounded-2xl border border-[#E6E2D8] bg-white hover:border-[#1C4331]/25 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E6E2D8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feat.icon className="w-6 h-6 text-[#1C4331]" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-[#1E2C22] group-hover:text-[#1C4331] transition-colors duration-200">{feat.title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="bg-white border-t border-[#E6E2D8] py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#1E2C22]">How CareConnect Works</h2>
            <p className="text-slate-500 mt-4">Simple steps to activate continuous AI medical monitoring.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", title: "Create Account", desc: "Register a clinical or personal account using Google or secure credentials." },
              { step: "02", title: "Scan & Upload", desc: "Take a picture of a script or drag-and-drop clinical reports onto the screen." },
              { step: "03", title: "AI Analytics", desc: "Our Gemini model identifies drugs, extracts dosage dates, and flags potential risks." },
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 bg-[#FAF7F2]/30 border border-[#E6E2D8] rounded-2xl flex flex-col">
                <span className="text-4xl font-extrabold text-[#1C4331]/25 font-mono mb-4">{step.step}</span>
                <h3 className="text-lg font-bold text-[#1E2C22] mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E6E2D8] bg-[#FAF7F2] pt-16 pb-12 relative z-10 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E6E2D8]">
            {/* Column 1: Brand & Logo */}
            <div className="md:col-span-4 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#1C4331]" />
                <span className="font-heading text-xl font-bold text-[#1E2C22] tracking-tight">CareConnect</span>
              </Link>
              <p className="text-slate-500 leading-relaxed text-sm max-w-sm">
                Empowering patients and clinical teams with AI-driven prescription insights, treatment tracking, and immediate healthcare support.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" className="p-2 rounded-lg bg-white border border-[#E6E2D8] hover:border-[#1C4331]/30 hover:bg-white text-[#1C4331]/75 hover:text-[#1C4331] transition-all duration-200 shadow-sm">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="p-2 rounded-lg bg-white border border-[#E6E2D8] hover:border-[#1C4331]/30 hover:bg-white text-[#1C4331]/75 hover:text-[#1C4331] transition-all duration-200 shadow-sm">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: How We Help Slogan */}
            <div className="md:col-span-3 space-y-4">
              <h3 className="font-heading font-bold text-[#1E2C22] tracking-wider uppercase text-xs">How We Help</h3>
              <p className="text-slate-650 italic leading-relaxed text-sm">
                "Bridging the gap between patient care and clinical intelligence, empowering individuals to manage treatment courses with complete clarity and confidence."
              </p>
            </div>

            {/* Column 3: Features Links */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-heading font-bold text-[#1E2C22] tracking-wider uppercase text-xs">Solutions</h3>
              <ul className="space-y-2.5 text-slate-500">
                <li><a href="#features" className="hover:text-[#1C4331] transition-colors">AI Prescriptions</a></li>
                <li><a href="#features" className="hover:text-[#1C4331] transition-colors">Report Analysis</a></li>
                <li><a href="#features" className="hover:text-[#1C4331] transition-colors">Clinical Copilot</a></li>
                <li><a href="#features" className="hover:text-[#1C4331] transition-colors">Treatment Tracker</a></li>
              </ul>
            </div>

            {/* Column 4: Compliance */}
            <div className="md:col-span-3 space-y-4">
              <h3 className="font-heading font-bold text-[#1E2C22] tracking-wider uppercase text-xs">Clinical Standards</h3>
              <p className="text-slate-550 leading-relaxed text-xs">
                Utilizes enterprise-grade Gemini models with structured clinical constraints. All user profile records are stored securely with zero public exposure.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-[#1C4331]">
                <Shield className="w-3.5 h-3.5" />
                <span>SECURE ARCHITECTURE</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} CareConnect Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#1C4331] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#1C4331] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#1C4331] transition-colors">Security Overview</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
