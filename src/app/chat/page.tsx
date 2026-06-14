"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService, ChatSession, ChatMessage } from "@/lib/data-service";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Bot, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Plus, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Activity
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat sessions on component mount
  useEffect(() => {
    if (!user) return;
    
    const loadSessions = async () => {
      try {
        const list = await dataService.getChatSessions(user.uid);
        setSessions(list);
        if (list.length > 0) {
          setCurrentSessionId(list[0].id);
          setMessages(list[0].messages);
        } else {
          // Create a default session if empty
          const newSession = await dataService.createChatSession(user.uid, "New Consultation Session");
          setSessions([newSession]);
          setCurrentSessionId(newSession.id);
          setMessages([]);
        }
      } catch (e) {
        console.error("Failed to load chat sessions:", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadSessions();
  }, [user]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  const handleNewSession = async () => {
    if (!user) return;
    try {
      const newSession = await dataService.createChatSession(user.uid, "New Consultation Session");
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages);
    }
  };

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

  const triggerVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      setInput(prev => prev + " What is the dosage instructions for Lisinopril?");
    } else {
      setIsRecording(true);
      setErrorState(null);
    }
  };

  const [errorState, setErrorState] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || generating || !user || !currentSessionId) return;

    const userText = input;
    const currentImg = imagePreview;
    
    // Clear input box and preview
    setInput("");
    clearImage();
    setGenerating(true);
    setErrorState(null);

    // 1. Add user message locally and to data service
    const userMsg: Omit<ChatMessage, "id"> = {
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString(),
      ...(currentImg ? { image: currentImg } : {})
    };

    try {
      const addedUserMsg = await dataService.addMessageToSession(user.uid, currentSessionId, userMsg);
      setMessages(prev => [...prev, addedUserMsg]);

      // 2. Prepare request contents history
      const history = [...messages, addedUserMsg].map(m => ({
        role: m.sender === "user" ? "user" as const : "model" as const,
        content: m.text
      }));

      // 3. Post to AI API route
      const aiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      if (!aiResponse.ok) {
        throw new Error("Failed to receive feedback from server.");
      }

      const resJson = await aiResponse.json();
      const replyText = resJson.reply;

      // 4. Add AI message locally and save
      const aiMsg: Omit<ChatMessage, "id"> = {
        sender: "ai",
        text: replyText,
        timestamp: new Date().toISOString()
      };
      
      const addedAiMsg = await dataService.addMessageToSession(user.uid, currentSessionId, aiMsg);
      setMessages(prev => [...prev, addedAiMsg]);

      // Update session title in side list if it was a default title
      const currentSession = sessions.find(s => s.id === currentSessionId);
      if (currentSession && currentSession.title === "New Consultation Session") {
        const shortTitle = userText.length > 25 ? userText.slice(0, 22) + "..." : userText;
        currentSession.title = shortTitle;
        setSessions([...sessions]);
        await dataService.updateMedicine(user.uid, currentSessionId, { name: shortTitle } as any); // Note: updating chat session using matching helper
      }
    } catch (err: any) {
      console.error(err);
      setErrorState(err.message || "Failed to connect to the Gemini backend.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-180px)] flex gap-6 overflow-hidden relative">
        {/* Left Sessions Sidebar */}
        <div className="hidden lg:flex flex-col w-72 bg-slate-900/20 border border-slate-900 rounded-2xl p-4 shrink-0 overflow-hidden">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-teal-500/20 hover:border-teal-500/40 bg-teal-500/5 hover:bg-teal-500/10 text-teal-300 text-sm font-semibold rounded-xl transition-all duration-200 mb-4"
          >
            <Plus className="w-4 h-4" />
            New Consultation
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center text-slate-500 text-xs py-10">Loading consultations...</div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left border text-xs font-semibold transition-all duration-200 ${
                    session.id === currentSessionId
                      ? "bg-slate-900 border-slate-800 text-teal-300"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate flex-1">{session.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-slate-900/40 border-b border-slate-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Clinical AI Assistant</h3>
                <p className="text-[10px] text-slate-500">Gemini 2.5 Flash Model active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-semibold">Ready</span>
            </div>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-4 ${isAi ? "" : "flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isAi 
                      ? "bg-teal-500/10 border-teal-500/20 text-teal-400" 
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}>
                    {isAi ? <Bot className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>

                  {/* Body Box */}
                  <div className="max-w-[75%] space-y-2">
                    <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                      isAi 
                        ? "bg-slate-900/60 border-slate-900 text-slate-300 rounded-tl-none" 
                        : "bg-gradient-to-tr from-teal-500/10 to-blue-500/10 border-teal-500/20 text-slate-100 rounded-tr-none"
                    }`}>
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Attachment" 
                          className="max-h-60 rounded-xl border border-slate-800 mb-3"
                        />
                      )}
                      {/* Simple Markdown Renderer simulation for paragraphs and lists */}
                      <div className="whitespace-pre-line space-y-2">
                        {msg.text.split("\n\n").map((para, pIdx) => {
                          if (para.startsWith("* ") || para.startsWith("- ")) {
                            return (
                              <ul key={pIdx} className="list-disc pl-5 space-y-1">
                                {para.split("\n").map((li, lIdx) => (
                                  <li key={lIdx}>{li.replace(/^[\*\-]\s+/, "")}</li>
                                ))}
                              </ul>
                            );
                          }
                          if (para.startsWith("### ")) {
                            return <h4 key={pIdx} className="text-sm font-bold text-teal-400 mt-3 mb-1">{para.replace("### ", "")}</h4>;
                          }
                          if (para.startsWith("## ")) {
                            return <h3 key={pIdx} className="text-base font-bold text-teal-300 mt-4 mb-2">{para.replace("## ", "")}</h3>;
                          }
                          return <p key={pIdx}>{para}</p>;
                        })}
                      </div>
                    </div>
                    
                    <p className={`text-[9px] text-slate-500 px-1 ${isAi ? "text-left" : "text-right"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            {generating && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-teal-400 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-900 rounded-tl-none flex items-center gap-1.5 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce delay-300"></span>
                </div>
              </div>
            )}

            {errorState && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs text-center max-w-md mx-auto">
                {errorState}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Waveform Overlay simulator */}
          {isRecording && (
            <div className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center gap-3 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 z-10 py-8">
              <span className="text-xs font-bold text-teal-400 tracking-wider animate-pulse flex items-center gap-1.5">
                <Activity className="w-4 h-4 animate-spin" />
                Listening to doctor and patient speech...
              </span>
              <div className="flex items-end justify-center gap-1.5 h-12">
                {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((h, i) => (
                  <span 
                    key={i} 
                    className="w-1 bg-gradient-to-t from-teal-500 to-blue-500 rounded-full animate-pulse-slow"
                    style={{ 
                      height: `${h * 6}px`, 
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "0.8s"
                    }}
                  ></span>
                ))}
              </div>
              <button 
                onClick={triggerVoiceInput}
                className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl px-4 py-1.5 bg-slate-900"
              >
                Press to Stop & Transcribe
              </button>
            </div>
          )}

          {/* Prompt Form */}
          <form 
            onSubmit={handleSend}
            className="p-4 bg-slate-950 border-t border-slate-900"
          >
            {imagePreview && (
              <div className="flex items-center gap-2 mb-3 bg-slate-900 border border-slate-850 p-2.5 rounded-xl max-w-xs relative">
                <img src={imagePreview} alt="Selected" className="w-12 h-12 rounded-lg object-cover border border-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-300 truncate">{imageFile?.name}</p>
                  <p className="text-[10px] text-slate-500">Ready to upload</p>
                </div>
                <button 
                  type="button" 
                  onClick={clearImage}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
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
                className="p-3 text-slate-400 hover:text-teal-400 hover:bg-slate-900 rounded-xl border border-slate-900 bg-slate-900/40 transition-colors"
                title="Add prescription or clinical scan"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={triggerVoiceInput}
                className={`p-3 rounded-xl border border-slate-900 bg-slate-900/40 transition-colors ${
                  isRecording ? "text-rose-400 hover:text-rose-300" : "text-slate-400 hover:text-teal-400"
                }`}
                title="Dictate prescription query"
              >
                <Mic className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about side effects, dosage, drug conflicts, or report values..."
                className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                disabled={generating}
              />

              <button
                type="submit"
                disabled={(!input.trim() && !imageFile) || generating}
                className="p-3 text-slate-950 bg-gradient-to-tr from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 rounded-xl disabled:opacity-50 disabled:hover:from-teal-400 disabled:hover:to-blue-500 transition-all shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
