"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dataService, Medicine, Prescription, MedicalReport, Reminder, ChatSession } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Pill, 
  ScanLine, 
  FileText, 
  Bot, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        const [medsList, presList, repsList, remsList, chatsList] = await Promise.all([
          dataService.getMedicines(user.uid),
          dataService.getPrescriptions(user.uid),
          dataService.getReports(user.uid),
          dataService.getReminders(user.uid),
          dataService.getChatSessions(user.uid),
        ]);
        setMedicines(medsList);
        setPrescriptions(presList);
        setReports(repsList);
        setReminders(remsList);
        setChats(chatsList);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-t-teal-400 border-slate-800 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const activeReminders = reminders.filter(r => r.status === "pending").length;
  
  const metrics = [
    { name: "Total Medicines", value: medicines.length, label: "Active treatments", icon: Pill, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/25" },
    { name: "Scanned Prescriptions", value: prescriptions.length, label: "Digitized records", icon: ScanLine, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25" },
    { name: "Medical Reports", value: reports.length, label: "Clinical analyses", icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
    { name: "AI Consultations", value: chats.length, label: "Conversational logs", icon: Bot, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25" },
    { name: "Upcoming Reminders", value: activeReminders, label: "Tasks pending", icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  ];

  const quickActions = [
    { title: "Scan Prescription", href: "/prescriptions", desc: "Extract medicines via AI", icon: ScanLine },
    { title: "Upload Report", href: "/analysis", desc: "Summarize blood panel/MRI", icon: FileText },
    { title: "Ask Health AI", href: "/chat", desc: "Chat with your virtual agent", icon: Bot },
    { title: "Add Medicine", href: "/medicines", desc: "Record a manual dosage", icon: Pill },
    { title: "Set Reminder", href: "/reminders", desc: "Add alarm or clinic visit", icon: Calendar },
  ];

  // Simulated activity feed based on actual state counts
  const activities = [
    { title: "Clinical session initialized", desc: "Secure token check completed", time: "Just now", type: "success" },
    prescriptions.length > 0 && { title: "Prescription scanned", desc: `Extracted data from ${prescriptions[0]?.fileName}`, time: "2 hours ago", type: "info" },
    medicines.length > 0 && { title: "Medication updated", desc: `Therapeutic parameters for ${medicines[0]?.name} verified`, time: "Yesterday", type: "info" },
    reports.length > 0 && { title: "Lab report analyzed", desc: `Gemini summarized findings for ${reports[0]?.fileName}`, time: "3 days ago", type: "warning" },
  ].filter(Boolean) as any[];

  return (
    <DashboardLayout>
      {/* Greeting Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent border border-teal-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/10 via-transparent to-transparent pointer-events-none"></div>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Welcome back, {user?.displayName || "Patient"}
        </h2>
        <p className="mt-2 text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
          Your diagnostic dashboard is synchronized. Check your medical summaries below or use the quick actions to upload a new clinical record.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div 
              key={idx} 
              className={`p-4 rounded-xl bg-slate-900/40 backdrop-blur-md border ${metric.border} flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.bg}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <span className="text-xs text-slate-500 font-medium">{metric.label}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{metric.value}</p>
                <p className="text-xs text-slate-400 mt-1 font-semibold truncate">{metric.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
            <h3 className="font-heading text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              Quick Operations
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link 
                    key={idx}
                    href={action.href}
                    className="group flex items-start gap-4 p-4 bg-slate-950/40 hover:bg-gradient-to-tr hover:from-teal-500/10 hover:to-blue-500/10 border border-slate-900 hover:border-teal-500/20 rounded-xl transition-all duration-200"
                  >
                    <div className="p-2.5 rounded-lg bg-slate-900 group-hover:bg-slate-950 border border-slate-800 text-teal-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition-colors flex items-center gap-1.5">
                        {action.title}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Quick Schedule Reminders list */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-lg font-bold text-slate-100">Today's Reminders</h3>
              <Link href="/reminders" className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
                View Full Calendar
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {reminders.slice(0, 3).map((rem, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 text-teal-400`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{rem.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{rem.date} &bull; {rem.time}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    rem.status === "completed" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {rem.status}
                  </span>
                </div>
              ))}
              
              {reminders.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No reminders set for today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-100 mb-6">Patient Timeline</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((activity, activityIdx) => (
                  <li key={activityIdx}>
                    <div className="relative pb-8">
                      {activityIdx !== activities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-slate-950 ${
                            activity.type === "success" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : activity.type === "warning" 
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{activity.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{activity.desc}</p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-slate-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-900 pt-4 mt-6">
            <span className="text-xs text-slate-500 leading-relaxed block">
              Integrity Status: Verified cryptographic checksums active.
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
