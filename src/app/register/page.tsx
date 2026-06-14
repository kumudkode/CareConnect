"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Activity, Mail, Lock, User, AlertCircle, Heart, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const { user, register, loginWithGoogle, loading, isMock } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, name);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please check your network and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center">
        <Activity className="w-10 h-10 text-[#1C4331] animate-spin" />
        <p className="mt-4 text-slate-500 text-sm">Setting up clinical workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E6E2D8_1px,transparent_1px),linear-gradient(to_bottom,#E6E2D8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50 z-0"></div>

      {/* Decorative Blur Nodes */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D97D64]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#1C4331]/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <Activity className="w-8 h-8 text-[#1C4331]" />
          <span className="font-heading text-2xl font-bold text-[#1E2C22]">
            CareConnect
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-extrabold text-[#1E2C22]">
          Create Clinical Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Or{" "}
          <Link href="/login" className="font-semibold text-[#D97D64] hover:text-[#c46c55] transition-colors">
            log in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 border border-[#E6E2D8] shadow-xl rounded-2xl sm:px-10">
          {isMock && (
            <div className="mb-6 px-3 py-2.5 rounded-xl bg-[#1C4331]/5 border border-[#1C4331]/10 flex items-center gap-2 text-xs text-[#1C4331]">
              <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> You can enter any credentials. Accounts are stored locally.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-[#BD483A]/5 border border-[#BD483A]/15 flex items-start gap-2.5 text-sm text-[#BD483A]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#1E2C22]/85 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#E6E2D8] rounded-xl text-[#1E2C22] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1C4331] focus:border-[#1C4331] text-sm"
                  placeholder="Sarah Connor"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#1E2C22]/85 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#E6E2D8] rounded-xl text-[#1E2C22] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1C4331] focus:border-[#1C4331] text-sm"
                  placeholder="admin@careconnect.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#1E2C22]/85 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#E6E2D8] rounded-xl text-[#1E2C22] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1C4331] focus:border-[#1C4331] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold text-[#1E2C22]/85 uppercase tracking-wide mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#E6E2D8] rounded-xl text-[#1E2C22] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1C4331] focus:border-[#1C4331] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[#FAF7F2] bg-[#1C4331] hover:bg-[#2C5E43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C4331] disabled:opacity-55 transition-all duration-200 cursor-pointer"
              >
                {submitting ? "Creating account..." : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E6E2D8]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#E6E2D8] rounded-xl text-sm font-semibold text-[#1E2C22] hover:bg-[#FAF7F2] transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.996 5.996 0 0 1 8 12.5a5.996 5.996 0 0 1 5.99-6.03c1.47 0 2.82.52 3.86 1.4l3.12-3.12C18.94 2.85 16.59 1.5 13.99 1.5 8.165 1.5 3.5 6.165 3.5 12s4.665 10.5 10.49 10.5c6.035 0 10.05-4.245 10.05-10.225 0-.69-.06-1.35-.18-1.99H12.24z"
                  />
                </svg>
                Google Authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
