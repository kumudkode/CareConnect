"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Activity, 
  CheckCircle,
  FileText,
  Heart,
  Settings,
  Calendar,
  Phone,
  Contact,
  ClipboardList,
  UploadCloud,
  Image as ImageIcon
} from "lucide-react";

const characterAvatars = [
  { name: "Amelia", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Amelia" },
  { name: "Felix", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" },
  { name: "Aneka", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka" },
  { name: "Milo", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo" },
  { name: "Sarah", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah" },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Basic Info
  const [name, setName] = useState("");
  const [age, setAge] = useState("30");
  const [bloodGroup, setBloodGroup] = useState("O-Positive");
  
  // Medical profile details
  const [allergies, setAllergies] = useState("Penicillin, Peanuts");
  const [chronicConditions, setChronicConditions] = useState("Mild Hypertension");
  
  // Surgeries & Treatment History
  const [surgicalHistory, setSurgicalHistory] = useState("Appendectomy (2021), Laser Eye Surgery (2023)");
  const [familyHistory, setFamilyHistory] = useState("Family history of Type 2 Diabetes (Father side)");

  // Care Team
  const [primaryDoctor, setPrimaryDoctor] = useState("Dr. Evans (Cardiologist)");
  const [clinicName, setClinicName] = useState("Saint Jude Medical Group");

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState("John Connor");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (555) 019-2831");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Load patient metadata from storage on mount
  useEffect(() => {
    if (!user) return;
    setName(user.displayName || "Amelia");
    
    const savedMeta = localStorage.getItem(`careconnect_patient_profile_${user.uid}`);
    if (savedMeta) {
      try {
        const parsed = JSON.parse(savedMeta);
        if (parsed.age) setAge(parsed.age);
        if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
        if (parsed.allergies) setAllergies(parsed.allergies);
        if (parsed.chronicConditions) setChronicConditions(parsed.chronicConditions);
        if (parsed.surgicalHistory) setSurgicalHistory(parsed.surgicalHistory);
        if (parsed.familyHistory) setFamilyHistory(parsed.familyHistory);
        if (parsed.primaryDoctor) setPrimaryDoctor(parsed.primaryDoctor);
        if (parsed.clinicName) setClinicName(parsed.clinicName);
        if (parsed.emergencyName) setEmergencyName(parsed.emergencyName);
        if (parsed.emergencyPhone) setEmergencyPhone(parsed.emergencyPhone);
        if (parsed.emergencyRelation) setEmergencyRelation(parsed.emergencyRelation);
      } catch (e) {
        console.error("Failed to parse patient profile details:", e);
      }
    }
  }, [user]);

  const handleSaveMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    setSavedSuccess(false);

    try {
      // 1. Update Display Name in AuthContext
      await updateUser({ displayName: name });

      // 2. Persist age and all medical details in local storage
      const meta = {
        age,
        bloodGroup,
        allergies,
        chronicConditions,
        surgicalHistory,
        familyHistory,
        primaryDoctor,
        clinicName,
        emergencyName,
        emergencyPhone,
        emergencyRelation
      };
      localStorage.setItem(`careconnect_patient_profile_${user.uid}`, JSON.stringify(meta));
      
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile parameters:", err);
    } finally {
      setUpdating(false);
    }
  };

  const selectCharacter = async (char: typeof characterAvatars[0]) => {
    setName(char.name);
    await updateUser({ 
      displayName: char.name, 
      photoURL: char.url 
    });
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updateUser({ photoURL: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const patientName = name || "Amelia";
  const userPhoto = user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${patientName}`;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Personal Details Row */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img 
                src={userPhoto} 
                alt="Profile Avatar" 
                className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-800 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleCustomPhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-xl font-heading font-extrabold text-slate-100">{patientName}</h2>
              <p className="text-xs text-slate-400 mt-1">Patient ({bloodGroup})</p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[9px] font-bold px-2 py-0.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-2.5 h-2.5" />
                  Upload Custom Photo
                </button>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  UID: {user?.uid.slice(0, 12)}...
                </span>
              </div>
            </div>
          </div>

          {/* Predefined Character Selector Row */}
          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Quick Character Presets</span>
            <div className="flex gap-2">
              {characterAvatars.map((char) => (
                <button
                  key={char.name}
                  type="button"
                  onClick={() => selectCharacter(char)}
                  className={`relative p-0.5 rounded-lg border transition-all cursor-pointer ${
                    userPhoto === char.url || (char.name === name && !user?.photoURL?.startsWith("data:image"))
                      ? "border-teal-400 scale-105 bg-slate-800"
                      : "border-slate-800 hover:border-slate-700 bg-transparent"
                  }`}
                  title={`Select ${char.name}`}
                >
                  <img src={char.url} alt={char.name} className="w-10 h-10 rounded-md" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 max-w-lg mx-auto">
            <CheckCircle className="w-4.5 h-4.5 shrink-0 animate-bounce" />
            <span className="font-bold">Medical record and patient history updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSaveMedical} className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* Column 1: Core Profile & Contact Details */}
          <div className="space-y-6">
            
            {/* General Information card */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-3">
                <User className="w-4.5 h-4.5 text-teal-400" />
                General Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                    placeholder="e.g. Amelia"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Age</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Blood Group</label>
                  <input 
                    type="text" 
                    required
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                    placeholder="e.g. O-Positive"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contacts card */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-3">
                <Contact className="w-4.5 h-4.5 text-blue-400" />
                Emergency Contacts
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Contact Name</label>
                  <input 
                    type="text" 
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                    placeholder="Emergency Contact Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Relationship</label>
                    <input 
                      type="text" 
                      required
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                      placeholder="e.g. Spouse, Parent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                      placeholder="e.g. +1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Care Team Info card */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-3">
                <Heart className="w-4.5 h-4.5 text-indigo-400" />
                Assigned Medical Care Team
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Primary Clinician / Doctor</label>
                  <input 
                    type="text" 
                    value={primaryDoctor}
                    onChange={(e) => setPrimaryDoctor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                    placeholder="Clinician Name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Facility / Clinic</label>
                  <input 
                    type="text" 
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                    placeholder="Medical Center"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Column 2: Clinical Data & Historical Records */}
          <div className="space-y-6">
            
            {/* Patient Clinical Profile card */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-3">
                <Activity className="w-4.5 h-4.5 text-teal-400" />
                Clinical Risk Indicators
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Known Allergies</label>
                  <input 
                    type="text" 
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200"
                    placeholder="e.g. None"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Chronic Diagnoses</label>
                  <textarea 
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200 resize-none"
                    placeholder="e.g. Mild Hypertension, Diabetes"
                  />
                </div>
              </div>
            </div>

            {/* Surgical & Medical Treatment History card */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-3">
                <ClipboardList className="w-4.5 h-4.5 text-indigo-400" />
                Historical Diagnoses & Surgeries
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Surgical & Operation Log</label>
                  <textarea 
                    value={surgicalHistory}
                    onChange={(e) => setSurgicalHistory(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200 resize-none"
                    placeholder="List past surgeries and years (e.g. Appendectomy - 2021)"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-1.5">Familial Hereditary Conditions</label>
                  <textarea 
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500 outline-none text-slate-200 resize-none"
                    placeholder="Familial genetic indicators"
                  />
                </div>
              </div>
            </div>

            {/* Actions Submit card */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm space-y-3 text-center">
              <p className="text-[10px] text-slate-500 leading-normal">
                Updating profile updates the digital security tokens and local indices across all synchronized clinics.
              </p>
              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-gradient-to-tr from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {updating ? "Syncing details..." : "Synchronize Medical File"}
              </button>
            </div>

          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
