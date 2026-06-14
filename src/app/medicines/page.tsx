"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService, Medicine } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Pill, 
  Search, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Clock, 
  Check, 
  Filter,
  Activity,
  Calendar,
  Sparkles
} from "lucide-react";

export default function MedicinesPage() {
  const { user } = useAuth();
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "reminders">("all");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [medName, setMedName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const loadMedicines = async () => {
    if (!user) return;
    try {
      const list = await dataService.getMedicines(user.uid);
      setMedicines(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await dataService.deleteMedicine(user.uid, id);
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleReminder = async (id: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      await dataService.updateMedicine(user.uid, id, { reminderEnabled: !currentStatus });
      setMedicines(prev => prev.map(m => m.id === id ? { ...m, reminderEnabled: !currentStatus } : m));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !medName.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()) return;

    setSubmitting(true);
    setErrorState(null);

    const newMed: Omit<Medicine, "id"> = {
      name: medName,
      genericName: genericName || undefined,
      dosage,
      frequency,
      duration,
      instructions: instructions || undefined,
      reminderEnabled,
      createdAt: new Date().toISOString()
    };

    try {
      const added = await dataService.addMedicine(user.uid, newMed);
      
      // If reminder is enabled, automatically create a reminder entry
      if (reminderEnabled) {
        await dataService.addReminder(user.uid, {
          type: "medicine",
          title: `Take ${medName} (${dosage})`,
          time: "09:00",
          date: new Date().toISOString().split("T")[0],
          status: "pending",
          createdAt: new Date().toISOString()
        });
      }

      setMedicines(prev => [added, ...prev]);
      
      // Clear form
      setMedName("");
      setGenericName("");
      setDosage("");
      setFrequency("");
      setDuration("");
      setInstructions("");
      setReminderEnabled(true);
      setShowAddForm(false);
    } catch (err: any) {
      setErrorState(err.message || "Failed to add medication record.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and Search logic
  const filteredMeds = medicines.filter(med => {
    const matchesSearch = 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      med.dosage.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (filterType === "reminders") {
      return matchesSearch && med.reminderEnabled;
    }
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/10 border border-slate-900 p-4 rounded-2xl">
          <div className="relative w-full sm:max-w-sm rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name, chemical, dose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setFilterType(prev => prev === "all" ? "reminders" : "all")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-200 ${
                filterType === "reminders" 
                  ? "bg-teal-500/10 border-teal-500/20 text-teal-400" 
                  : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {filterType === "reminders" ? "Showing Reminders" : "Filter Reminders"}
            </button>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-2 bg-gradient-to-tr from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </button>
          </div>
        </div>

        {/* Manual Addition Form Modal Overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
              <h3 className="font-heading text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-400" />
                Record Medication Treatment
              </h3>

              {errorState && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorState}</span>
                </div>
              )}

              <form onSubmit={handleAddMedicine} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Medicine Name</label>
                    <input 
                      type="text" 
                      required 
                      value={medName} 
                      onChange={(e) => setMedName(e.target.value)} 
                      placeholder="e.g. Paracetamol"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Generic Name</label>
                    <input 
                      type="text" 
                      value={genericName} 
                      onChange={(e) => setGenericName(e.target.value)} 
                      placeholder="e.g. Acetaminophen"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Dosage</label>
                    <input 
                      type="text" 
                      required 
                      value={dosage} 
                      onChange={(e) => setDosage(e.target.value)} 
                      placeholder="e.g. 500mg"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Frequency</label>
                    <input 
                      type="text" 
                      required 
                      value={frequency} 
                      onChange={(e) => setFrequency(e.target.value)} 
                      placeholder="e.g. Twice daily"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Duration</label>
                    <input 
                      type="text" 
                      required 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)} 
                      placeholder="e.g. 5 days"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Special Instructions</label>
                  <input 
                    type="text" 
                    value={instructions} 
                    onChange={(e) => setInstructions(e.target.value)} 
                    placeholder="e.g. Take after dinner with water"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="reminder" 
                    checked={reminderEnabled} 
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 bg-slate-950 border-slate-850 text-teal-500 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="reminder" className="text-xs text-slate-300 font-medium">Activate automated calendar reminders</label>
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
                    className="px-5 py-2 bg-gradient-to-tr from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Treatment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medicines Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Synchronizing treatment courses...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeds.map((med) => (
              <div 
                key={med.id}
                className="group relative p-6 bg-slate-900/20 border border-slate-900 hover:border-teal-500/25 rounded-2xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center text-teal-400">
                      <Pill className="w-5 h-5" />
                    </div>
                    
                    <button
                      onClick={() => handleToggleReminder(med.id, med.reminderEnabled)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                        med.reminderEnabled
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          : "bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-400"
                      }`}
                      title={med.reminderEnabled ? "Disable Reminder" : "Enable Reminder"}
                    >
                      {med.reminderEnabled ? "Reminders On" : "Reminders Off"}
                    </button>
                  </div>

                  <h3 className="font-heading text-base font-bold text-slate-200">{med.name}</h3>
                  {med.genericName && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5">{med.genericName}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-900/60 text-xs text-slate-400">
                    <div>
                      <span className="text-[9px] text-slate-600 uppercase font-semibold">Dosage</span>
                      <p className="font-bold text-slate-300 mt-0.5">{med.dosage}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 uppercase font-semibold">Duration</span>
                      <p className="font-bold text-slate-300 mt-0.5">{med.duration}</p>
                    </div>
                  </div>

                  {med.instructions && (
                    <div className="mt-4 p-2.5 bg-slate-950/40 border border-slate-950 rounded-xl text-[11px] text-slate-400 leading-normal">
                      <strong>Instructions:</strong> {med.instructions}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900/60 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    Registered {new Date(med.createdAt).toLocaleDateString()}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-lg transition-all"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredMeds.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl text-slate-500 text-xs">
                No medication matches found. Check your query parameters or add a new record.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
