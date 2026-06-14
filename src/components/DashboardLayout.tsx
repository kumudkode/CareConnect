"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Bot, 
  ScanLine, 
  Pill, 
  TrendingUp, 
  Calendar, 
  User, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  Activity, 
  Heart,
  Sparkles
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Chat Assistant", href: "/chat", icon: Bot },
  { name: "Prescription Scanner", href: "/prescriptions", icon: ScanLine },
  { name: "My Medicines", href: "/medicines", icon: Pill },
  { name: "Analysis", href: "/analysis", icon: TrendingUp },
  { name: "Reminders", href: "/reminders", icon: Calendar },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Admin Panel", href: "/admin", icon: ShieldAlert, adminOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isMock, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Read local storage profile details for dynamic header indicators
  const [patientMeta, setPatientMeta] = useState({ age: "30", bloodGroup: "O-Positive" });

  useEffect(() => {
    if (!user) return;
    const savedMeta = localStorage.getItem(`careconnect_patient_profile_${user.uid}`);
    if (savedMeta) {
      try {
        const parsed = JSON.parse(savedMeta);
        setPatientMeta(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user, pathname]); // Re-trigger on pathname change to catch profile updates

  // Protected route enforcement
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <Heart className="absolute w-5 h-5 text-teal-400 animate-pulse" />
        </div>
        <p className="mt-4 text-slate-400 font-medium text-sm">Securing clinical session...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const currentItem = navItems.find(item => item.href === pathname) || navItems[0];
  const patientDisplayName = user.displayName || "Amelia";

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-900 bg-slate-900/40 backdrop-blur-xl">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center px-6 gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 tracking-tight">
                CareConnect
              </span>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && !user.isAdmin) return null;
              if (user.isAdmin && (item.href === "/medicines" || item.href === "/reminders")) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 text-teal-300"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 border border-transparent"
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                    isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User profile section at the bottom of sidebar */}
          <div className="px-4 mt-auto pt-4 border-t border-slate-900">
            <div className="flex items-center gap-3 px-2 py-3">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${patientDisplayName}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-800"
              />
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{patientDisplayName}</p>
                <p className="text-xs text-slate-500 truncate">Patient ({patientMeta.bloodGroup})</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 mt-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-900 border border-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              {currentItem.name}
            </h1>
            {isMock && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Demo Mode
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <span className="text-xs text-slate-500">Authorized Session</span>
              <p className="text-xs font-semibold text-teal-400">
                {user.isAdmin ? "Clinical Administrator" : `Patient (Age: ${patientMeta.age}, ${patientMeta.bloodGroup})`}
              </p>
            </div>
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${patientDisplayName}`} 
              alt="Profile" 
              className="md:hidden w-8 h-8 rounded-lg border border-slate-800"
            />
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col pt-5 pb-4 px-4 overflow-y-auto">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-8 px-2">
                <Activity className="w-6 h-6 text-teal-400" />
                <span className="font-heading text-lg font-bold text-slate-100">CareConnect</span>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  if (item.adminOnly && !user.isAdmin) return null;
                  if (user.isAdmin && (item.href === "/medicines" || item.href === "/reminders")) return null;
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-teal-500/10 border border-teal-500/20 text-teal-300"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2 py-3">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${patientDisplayName}`} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-xl"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{patientDisplayName}</p>
                    <p className="text-xs text-slate-500 truncate">Patient ({patientMeta.bloodGroup})</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 mt-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-xl transition-all duration-200"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
