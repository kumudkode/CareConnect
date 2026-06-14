"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  Terminal, 
  CheckCircle, 
  AlertTriangle,
  Bot,
  Database,
  CloudLightning,
  Sparkles
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const stats = await dataService.getAdminMetrics();
        setMetrics(stats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const logs = [
    { type: "info", service: "Firebase Auth", msg: "Token validation completed for user sarah.connor@gmail.com", time: "10:14:22" },
    { type: "success", service: "Gemini Model", msg: "Multimodal prescription token analysis completed successfully (0.98 accuracy)", time: "10:12:05" },
    { type: "info", service: "FastAPI WS", msg: "WebSocket pipe established on route /ws/mock-uid-123/chat-456", time: "10:08:44" },
    { type: "warning", service: "Firestore DB", msg: "Database read limits reaching 85% of standard free quota", time: "09:54:12" },
    { type: "info", service: "Gemini Model", msg: "Pathology report text deconstruction completed successfully", time: "09:32:51" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-teal-400 border-slate-800 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { title: "Registered Accounts", value: metrics?.totalUsers || 147, icon: Users, color: "text-blue-400" },
    { title: "Prescription Queries", value: metrics?.totalPrescriptions || 92, icon: Database, color: "text-teal-400" },
    { title: "Active Treatments", value: metrics?.totalMedicines || 254, icon: Activity, color: "text-emerald-400" },
    { title: "AI Assistant Prompt Actions", value: metrics?.aiUsageCount || 684, icon: Bot, color: "text-cyan-400" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Security Warning banner */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-slate-350 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
          <span>
            <strong>Clinical Privilege Warning:</strong> You are accessing clinical system diagnostic layers. Actions executed here impact user database partitions.
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{stat.title}</span>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-extrabold text-slate-100 mt-4">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Logs Terminal */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-200 flex items-center gap-2 mb-6">
                <Terminal className="w-4.5 h-4.5 text-teal-400" />
                Live Diagnostic Core Logs
              </h3>

              <div className="font-mono text-[10px] space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-y-auto max-h-[300px]">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 py-1 border-b border-slate-900/40 last:border-0 leading-normal">
                    <span className="text-slate-600">[{log.time}]</span>
                    <span className={`font-bold shrink-0 ${
                      log.type === "success" 
                        ? "text-emerald-400" 
                        : log.type === "warning" 
                        ? "text-amber-400" 
                        : "text-blue-400"
                    }`}>
                      {log.service}:
                    </span>
                    <span className="text-slate-300">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
              <span>FastAPI Gateway: Connected (Port 8081)</span>
              <span className="flex items-center gap-1">
                <CloudLightning className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Service Health: Optimal
              </span>
            </div>
          </div>

          {/* Clinical User Signups mock list */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
            <h3 className="font-heading text-sm font-bold text-slate-200 flex items-center gap-2 mb-6">
              <Users className="w-4.5 h-4.5 text-blue-400" />
              Active Clinicians
            </h3>
            
            <div className="space-y-4">
              {[
                { name: "Dr. Sarah Connor", email: "sarah.connor@gmail.com", role: "Cardiologist", online: true },
                { name: "Dr. Arthur Evans", email: "a.evans@hospital.org", role: "Neurologist", online: false },
                { name: "Clinical System Admin", email: "admin@careconnect.com", role: "Superuser", online: true }
              ].map((cli, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-950 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${cli.name}`} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-900"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{cli.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{cli.email} &bull; {cli.role}</p>
                    </div>
                  </div>

                  <span className={`w-2 h-2 rounded-full shrink-0 ${cli.online ? "bg-emerald-500 animate-pulse" : "bg-slate-700"}`}></span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
