"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  User,
  ExternalLink,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const QUICK_SUGGESTIONS = [
  { label: "🌾 Mandi Rates", query: "Aaj ke mandi bhav aur rates bataiye" },
  { label: "🧾 GST Invoice", query: "KrishiConnect me naya GST invoice kaise banaye?" },
  { label: "🚜 Transport Booking", query: "Fasal transport ke liye truck kaise book karein?" },
  { label: "🌦️ Mausam Alert", query: "Aaj ka mausam aur barish ka forecast kya hai?" },
  { label: "🧪 Khad & Mitti", query: "Soil health test aur mitti me khad ka sahi dose kya hai?" },
];

export function KrishiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      role: "assistant",
      content:
        "नमस्ते! 🙏 मैं **KrishiBot** हूँ — KrishiConnect का कृषि AI सहायक।\n\nआप मुझसे **मंडी भाव**, **GST बिल**, **ट्रक ट्रांसपोर्ट**, **मौसम**, या **फसल व खाद** के बारे में कुछ भी पूछ सकते हैं!",
      time: "अभी",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.reply || "माफ़ कीजिए, कोई उत्तर प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot request failed:", err);
      const errorMsg: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content:
          "क्षमा करें! सर्वर से कनेक्ट करने में दिक्कत आ रही है। आप कुछ समय बाद पूछ सकते हैं या नीचे दिए गए क्विक ऑप्शन्स चुन सकते हैं।",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "initial-reset",
        role: "assistant",
        content:
          "नमस्ते! बातचीत रीसेट कर दी गई है। मैं आपकी क्या मदद कर सकता हूँ?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Simple Markdown renderer for clean bullets, bold text and linebreaks
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Bold text processing
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-emerald-300">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-emerald-400 font-bold">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "my-0.5 leading-relaxed"}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <aside aria-label="KrishiBot AI Chat Assistant" className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="krishibot-heading"
          className="w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[75vh] flex flex-col bg-[#0d1117]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl shadow-black/80 text-white overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-950/80 via-[#101b15]/90 to-emerald-950/80 border-b border-emerald-500/20 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-inner">
                <Bot className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d1117] ring-1 ring-emerald-500/50" />
              </div>
              <div>
                <h2 id="krishibot-heading" className="text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
                  कृषि AI (KrishiBot)
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online • Farm & Platform Help</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Clear conversation"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chatbot"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-black/40 border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {QUICK_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                disabled={isLoading}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs sm:text-[13px] scroll-smooth">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : "bg-[#161b22] text-zinc-200 border border-white/10 rounded-bl-xs"
                  }`}
                >
                  <div className="leading-relaxed">
                    {renderFormattedText(m.content)}
                  </div>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      m.role === "user" ? "text-emerald-100/70" : "text-zinc-500"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-zinc-400">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-[#161b22] border border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-1.5 text-emerald-300">
                  <span>KrishiBot सोच रहा है</span>
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-black/60 border-t border-emerald-500/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-[#161b22] border border-white/10 focus-within:border-emerald-500/60 rounded-xl px-3 py-1.5 transition-all shadow-inner"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="फसल, मंडी भाव या बिल के बारे में पूछें..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 px-1">
              <span>KrishiConnect AI Assistant</span>
              <span className="text-emerald-400/70">Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Robot Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle KrishiBot AI Assistant"
        className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-950/60 border-2 border-emerald-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {/* Pulsing ring aura */}
        <span className="absolute -inset-1 rounded-2xl bg-emerald-400/30 blur-sm group-hover:bg-emerald-400/50 transition-all animate-pulse" />

        {/* Robot Icon or Close */}
        {isOpen ? (
          <X className="relative z-10 w-7 h-7 text-white transition-transform duration-200" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <Bot className="w-7 h-7 text-white drop-shadow-md group-hover:rotate-6 transition-transform duration-200" />
            {/* Live Green Status Dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-emerald-900 shadow-sm">
              <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-75" />
            </span>
          </div>
        )}

        {/* Floating tooltip label (Desktop only) */}
        {!isOpen && (
          <div className="hidden md:flex absolute right-16 px-3 py-1.5 rounded-xl bg-[#0d1117]/95 border border-emerald-500/30 text-emerald-200 text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>कृषि AI सहायक</span>
          </div>
        )}
      </button>
    </aside>
  );
}
