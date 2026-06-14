"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService, ChatSession, ChatMessage } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Send,
  Image as ImageIcon,
  Mic,
  Plus,
  MessageSquare,
  Sparkles,
  Activity,
  Heart,
  AlertTriangle,
  Info,
  Lightbulb,
  X,
} from "lucide-react";

// ─── Maya's Avatar SVG ────────────────────────────────────────────────────────
const MayaAvatar = ({ size = 32, pulse = false }: { size?: number; pulse?: boolean }) => (
  <div
    style={{ width: size, height: size }}
    className={`relative rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20 ${pulse ? "animate-pulse" : ""}`}
  >
    <Heart className="w-4 h-4 text-white" fill="white" />
    {/* Online dot */}
    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
  </div>
);

// ─── Simple but powerful Markdown renderer ────────────────────────────────────
const MarkdownRenderer = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const renderInline = (str: string): React.ReactNode => {
    // Bold **text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      // Italic *text*
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={idx} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === "") { i++; continue; }

    // Alert blocks: > [!WARNING], > [!NOTE], > [!IMPORTANT]
    if (line.startsWith("> [!")) {
      const alertMatch = line.match(/^> \[!(WARNING|NOTE|IMPORTANT|CAUTION|TIP)\]/i);
      const alertType = alertMatch?.[1]?.toUpperCase();
      const alertLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        alertLines.push(lines[i].slice(2));
        i++;
      }
      const configs: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
        WARNING: { color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />, label: "Warning" },
        NOTE: { color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />, label: "Note" },
        IMPORTANT: { color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />, label: "Important" },
        CAUTION: { color: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />, label: "Caution" },
        TIP: { color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />, label: "Tip" },
      };
      const cfg = configs[alertType || "NOTE"] || configs.NOTE;
      elements.push(
        <div key={i} className={`flex items-start gap-2 p-3 rounded-xl border ${cfg.bg} ${cfg.border} ${cfg.color} text-xs my-2`}>
          {cfg.icon}
          <div>
            <span className="font-bold uppercase text-[10px] tracking-wider">{cfg.label}: </span>
            {alertLines.map((al, ai) => <span key={ai}>{renderInline(al)} </span>)}
          </div>
        </div>
      );
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      const headerCells = line.split("|").filter(c => c.trim()).map(c => c.trim());
      i += 2; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").filter(c => c.trim()).map(c => c.trim()));
        i++;
      }
      elements.push(
        <div key={i} className="overflow-x-auto my-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700">
                {headerCells.map((h, hi) => (
                  <th key={hi} className="text-left py-2 px-3 font-semibold text-teal-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-800/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-slate-300">{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="text-sm font-bold text-teal-400 mt-4 mb-1">{renderInline(line.slice(4))}</h4>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="text-base font-bold text-teal-300 mt-4 mb-2">{renderInline(line.slice(3))}</h3>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{renderInline(line.slice(2))}</h2>);
      i++; continue;
    }

    // Unordered list
    if (line.match(/^[-*•]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*•]\s/)) {
        listItems.push(lines[i].replace(/^[-*•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={i} className="list-none space-y-1.5 my-2">
          {listItems.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span className="text-slate-300">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="space-y-1.5 my-2 pl-1">
          {listItems.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-sm">
              <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{ii + 1}</span>
              <span className="text-slate-300">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={i} className="border-slate-800 my-3" />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-sm text-slate-300 leading-relaxed">{renderInline(line)}</p>
    );
    i++;
  }

  return <div className="space-y-1.5">{elements}</div>;
};

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [introLoading, setIntroLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => prev + (prev ? " " : "") + transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error !== "no-speech") {
            setErrorState(`Voice recognition error: ${event.error}`);
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  // ── Fetch Maya's intro for a fresh session ──────────────────────
  const fetchMayaIntro = useCallback(
    async (sessionId: string) => {
      if (!user) return;
      setIntroLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "introduce",
            userName: user.displayName || undefined,
          }),
        });
        const data = await res.json();
        const introText =
          data.reply ||
          "Hi! I'm **Maya**, your CareConnect AI Health Companion. How can I help you today?";

        const introMsg: Omit<ChatMessage, "id"> = {
          sender: "ai",
          text: introText,
          timestamp: new Date().toISOString(),
        };
        const saved = await dataService.addMessageToSession(
          user.uid,
          sessionId,
          introMsg
        );
        setMessages([saved]);

        // Update session in local state
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [saved] }
              : s
          )
        );
      } catch (err) {
        console.error("Failed to fetch Maya intro:", err);
      } finally {
        setIntroLoading(false);
      }
    },
    [user]
  );

  // ── Load sessions on mount ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const list = await dataService.getChatSessions(user.uid);
        setSessions(list);
        if (list.length > 0) {
          const first = list[0];
          setCurrentSessionId(first.id);
          setMessages(first.messages || []);
          // If the latest session has no messages, fetch intro
          if (!first.messages || first.messages.length === 0) {
            fetchMayaIntro(first.id);
          }
        } else {
          const newSess = await dataService.createChatSession(
            user.uid,
            "New Consultation"
          );
          setSessions([newSess]);
          setCurrentSessionId(newSess.id);
          setMessages([]);
          fetchMayaIntro(newSess.id);
        }
      } catch (e) {
        console.error("Failed to load sessions:", e);
      } finally {
        setLoadingSession(false);
      }
    };
    load();
  }, [user, fetchMayaIntro]);

  // ── New session ────────────────────────────────────────────────
  const handleNewSession = async () => {
    if (!user) return;
    try {
      const s = await dataService.createChatSession(
        user.uid,
        "New Consultation"
      );
      setSessions((prev) => [s, ...prev]);
      setCurrentSessionId(s.id);
      setMessages([]);
      setErrorState(null);
      fetchMayaIntro(s.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages || []);
      setErrorState(null);
    }
  };

  // ── File handling ──────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Voice Input (Web Speech API) ──────────────────────────────────
  const triggerVoiceInput = () => {
    if (!recognitionRef.current) {
      setErrorState("Speech recognition is not supported in this browser. Please use Chrome/Safari/Edge.");
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Stop SpeechRecognition error:", err);
      }
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setErrorState(null);
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Start SpeechRecognition error:", err);
        setIsRecording(false);
        setErrorState("Could not access microphone or initiate voice input.");
      }
    }
  };

  // ── Send message ───────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!input.trim() && !imageFile) ||
      generating ||
      !user ||
      !currentSessionId
    )
      return;

    const userText = input.trim();
    const currentImg = imagePreview;
    setInput("");
    clearImage();
    setGenerating(true);
    setErrorState(null);

    // 1. Save user message
    const userMsg: Omit<ChatMessage, "id"> = {
      sender: "user",
      text: userText || "📎 [Image attached]",
      timestamp: new Date().toISOString(),
      ...(currentImg ? { image: currentImg } : {}),
    };

    try {
      const addedUser = await dataService.addMessageToSession(
        user.uid,
        currentSessionId,
        userMsg
      );
      setMessages((prev) => [...prev, addedUser]);

      // 2. Build history (user + AI turns only, skip empty)
      const history = [...messages, addedUser]
        .filter((m) => m.text)
        .map((m) => ({
          role: m.sender === "user" ? "user" as const : "model" as const,
          content: m.text,
        }));

      // 3. Call Maya API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || "Maya couldn't process your request."
        );
      }

      const { reply } = await res.json();

      // 4. Save AI message
      const aiMsg: Omit<ChatMessage, "id"> = {
        sender: "ai",
        text: reply,
        timestamp: new Date().toISOString(),
      };
      const addedAi = await dataService.addMessageToSession(
        user.uid,
        currentSessionId,
        aiMsg
      );
      setMessages((prev) => [...prev, addedAi]);

      // 5. Auto-rename session from first user message
      const sess = sessions.find((s) => s.id === currentSessionId);
      if (
        sess &&
        (sess.title === "New Consultation" || sess.title === "New Consultation Session") &&
        userText
      ) {
        const title = userText.length > 28 ? userText.slice(0, 26) + "…" : userText;
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId ? { ...s, title } : s
          )
        );
      }

      inputRef.current?.focus();
    } catch (err: any) {
      console.error(err);
      setErrorState(
        err.message ||
          "Maya is having trouble connecting. Please try again in a moment."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ── Quick suggestion chips ─────────────────────────────────────
  const suggestions = [
    "What are the side effects of Metformin?",
    "Explain my blood pressure readings",
    "How to take Amoxicillin correctly?",
    "What is HbA1c in a blood test?",
  ];

  const isEmptySession = messages.length === 0 && !introLoading;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-180px)] flex gap-5 overflow-hidden relative">

        {/* ── Sessions Sidebar ── */}
        <div className="hidden lg:flex flex-col w-64 bg-slate-900/30 border border-slate-800/60 rounded-2xl p-3 shrink-0 overflow-hidden backdrop-blur-sm">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-teal-500/25 hover:border-teal-500/50 bg-gradient-to-r from-teal-500/8 to-cyan-500/8 hover:from-teal-500/15 hover:to-cyan-500/15 text-teal-300 text-xs font-semibold rounded-xl transition-all duration-200 mb-3 group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
            New Session with Maya
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
            {loadingSession ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border text-xs font-medium transition-all duration-150 ${
                    session.id === currentSessionId
                      ? "bg-gradient-to-r from-teal-500/12 to-cyan-500/8 border-teal-500/30 text-teal-200"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="truncate flex-1">{session.title}</span>
                </button>
              ))
            )}
          </div>

          {/* Maya branding */}
          <div className="mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-2 px-2">
              <MayaAvatar size={24} />
              <div>
                <p className="text-[10px] font-bold text-slate-300">Maya AI</p>
                <p className="text-[9px] text-slate-500">Powered by Groq LLaMA 3.3</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col bg-slate-900/20 border border-slate-800/60 rounded-2xl overflow-hidden relative backdrop-blur-sm">

          {/* Header */}
          <div className="bg-slate-900/50 border-b border-slate-800/60 px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <MayaAvatar size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Maya</h3>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-teal-500/15 border border-teal-500/25 text-teal-400 rounded-full">
                    AI Health Companion
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  CareConnect • Groq LLaMA 3.3 70B • Always here for you
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="text-[10px] text-slate-400 font-medium">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* Loading intro state */}
            {introLoading && messages.length === 0 && (
              <div className="flex items-start gap-3">
                <MayaAvatar size={32} pulse />
                <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/60 border border-slate-800/60 flex items-center gap-2">
                  <span className="text-xs text-slate-400 italic">Maya is preparing to greet you…</span>
                  <div className="flex items-end gap-1 h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {isEmptySession && (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-teal-500/30">
                    <Heart className="w-8 h-8 text-white" fill="white" />
                  </div>
                  <div className="absolute -inset-3 bg-teal-500/10 rounded-3xl blur-xl animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Start chatting with Maya</h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Your AI health companion is ready to help with medicines, prescriptions, reports and health questions.
                  </p>
                </div>
              </div>
            )}

            {/* Messages list */}
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? "" : "flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  {isAi ? (
                    <MayaAvatar size={32} />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-600 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-slate-300" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[80%] space-y-1 ${isAi ? "" : "items-end flex flex-col"}`}>
                    {/* Sender label */}
                    <span className={`text-[9px] font-semibold px-1 ${isAi ? "text-teal-400" : "text-slate-400"}`}>
                      {isAi ? "Maya" : (user?.displayName?.split(" ")[0] || "You")}
                    </span>

                    <div
                      className={`px-4 py-3 rounded-2xl border text-sm leading-relaxed ${
                        isAi
                          ? "bg-slate-900/70 border-slate-800/70 text-slate-300 rounded-tl-none"
                          : "bg-gradient-to-br from-teal-500/15 to-cyan-500/10 border-teal-500/25 text-slate-100 rounded-tr-none"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Attachment"
                          className="max-h-56 rounded-xl border border-slate-700 mb-3 object-contain"
                        />
                      )}
                      {isAi ? (
                        <MarkdownRenderer text={msg.text} />
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      )}
                    </div>

                    <span className={`text-[9px] text-slate-600 px-1 ${isAi ? "text-left" : "text-right"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {generating && (
              <div className="flex items-start gap-3">
                <MayaAvatar size={32} pulse />
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-900/70 border border-slate-800/70 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                  <span className="text-xs text-slate-500 ml-1">Maya is thinking…</span>
                </div>
              </div>
            )}

            {/* Error */}
            {errorState && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs max-w-lg mx-auto">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorState}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions (shown when recent messages are few) */}
          {messages.length <= 1 && !generating && (
            <div className="px-5 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(s)}
                  className="shrink-0 text-[10px] font-medium px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-800/30 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-150 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Voice overlay */}
          {isRecording && (
            <div className="absolute inset-x-0 bottom-20 flex flex-col items-center justify-center gap-3 px-4 py-6 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 z-10">
              <span className="text-xs font-bold text-teal-400 tracking-wider animate-pulse flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Listening to your query…
              </span>
              <div className="flex items-end justify-center gap-1 h-10">
                {Array.from({ length: 15 }, (_, i) => {
                  const h = [2, 3, 5, 7, 9, 8, 6, 10, 8, 6, 9, 7, 5, 3, 2][i];
                  return (
                    <span
                      key={i}
                      className="w-1 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-full animate-pulse"
                      style={{
                        height: `${h * 5}px`,
                        animationDelay: `${i * 0.07}s`,
                        animationDuration: "0.6s",
                      }}
                    />
                  );
                })}
              </div>
              <button
                onClick={triggerVoiceInput}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl px-4 py-1.5 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Stop & Use Text
              </button>
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-slate-950/80 border-t border-slate-800/60 shrink-0"
          >
            {imagePreview && (
              <div className="flex items-center gap-2.5 mb-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl max-w-xs relative">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate">{imageFile?.name}</p>
                  <p className="text-[10px] text-slate-500">Ready to send</p>
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 hover:text-teal-400 hover:bg-slate-800 rounded-xl border border-slate-800 bg-slate-900/50 transition-colors"
                title="Attach prescription or scan image"
              >
                <ImageIcon className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={triggerVoiceInput}
                className={`p-2.5 rounded-xl border border-slate-800 bg-slate-900/50 transition-colors ${
                  isRecording
                    ? "text-rose-400 border-rose-500/30 bg-rose-500/10 animate-pulse"
                    : "text-slate-500 hover:text-teal-400 hover:bg-slate-800"
                }`}
                title="Voice input"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Maya about medicines, reports, symptoms, dosage…"
                className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                disabled={generating}
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={(!input.trim() && !imageFile) || generating}
                className="p-2.5 bg-gradient-to-br from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-500/20 font-bold"
                title="Send message"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-[9px] text-slate-600 text-center mt-2">
              Maya provides health guidance for educational purposes only. Always consult your doctor for personal medical advice.
            </p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
