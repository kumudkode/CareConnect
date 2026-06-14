"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService, Reminder } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Bell, 
  Activity,
  Award
} from "lucide-react";

export default function RemindersPage() {
  const { user } = useAuth();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "missed">("all");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"medicine" | "appointment" | "checkup">("medicine");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReminders = async () => {
    if (!user) return;
    try {
      const list = await dataService.getReminders(user.uid);
      setReminders(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !time.trim() || !date.trim()) return;

    setSubmitting(true);
    
    const newRem: Omit<Reminder, "id"> = {
      title,
      type,
      time,
      date,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    try {
      const added = await dataService.addReminder(user.uid, newRem);
      setReminders(prev => [added, ...prev]);
      
      setTitle("");
      setTime("");
      setDate("");
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "completed" | "missed" | "pending") => {
    if (!user) return;
    try {
      await dataService.updateReminder(user.uid, id, { status: newStatus });
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await dataService.deleteReminder(user.uid, id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter logic
  const filteredReminders = reminders.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Controls Card */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/10 border border-slate-900 p-4 rounded-2xl">
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {(["all", "pending", "completed", "missed"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                  filter === opt 
                    ? "bg-teal-500/10 border border-teal-500/20 text-teal-400" 
                    : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2 bg-gradient-to-tr from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>

        {/* Create Reminder Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
              <h3 className="font-heading text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-400" />
                Schedule Health Reminder
              </h3>

              <form onSubmit={handleCreateReminder} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Reminder Title</label>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Take Amoxicillin 500mg"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("medicine")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === "medicine" 
                        ? "bg-teal-500/10 border-teal-500/20 text-teal-400" 
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    Medicine
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("appointment")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === "appointment" 
                        ? "bg-teal-500/10 border-teal-500/20 text-teal-400" 
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("checkup")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === "checkup" 
                        ? "bg-teal-500/10 border-teal-500/20 text-teal-400" 
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    Checkup
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Date</label>
                    <input 
                      type="date" 
                      required 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Time</label>
                    <input 
                      type="time" 
                      required 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-900 pt-5 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-850 hover:bg-slate-900 text-slate-400 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-gradient-to-tr from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-xl"
                  >
                    {submitting ? "Scheduling..." : "Create Alarm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Syncing schedule files...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReminders.map((rem) => (
              <div 
                key={rem.id}
                className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                      rem.type === "medicine" 
                        ? "bg-teal-500/10 text-teal-400 border-teal-500/20" 
                        : rem.type === "appointment" 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    }`}>
                      {rem.type}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rem.status === "completed" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : rem.status === "missed" 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {rem.status}
                    </span>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-slate-200">{rem.title}</h3>

                  <div className="flex gap-4 text-xs text-slate-400 pt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      {rem.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      {rem.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-6">
                  <div className="flex gap-1.5">
                    {rem.status !== "completed" && (
                      <button
                        onClick={() => handleUpdateStatus(rem.id, "completed")}
                        className="px-2.5 py-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-lg transition-all"
                      >
                        Complete
                      </button>
                    )}
                    {rem.status !== "missed" && (
                      <button
                        onClick={() => handleUpdateStatus(rem.id, "missed")}
                        className="px-2.5 py-1 text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 rounded-lg transition-all"
                      >
                        Miss
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredReminders.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl text-slate-500 text-xs">
                No reminders found for the selected category.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
