"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  FlaskConical,
  RotateCcw,
  ExternalLink,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import {
  liveChatRepository,
  LiveChatMessage,
  LiveChatSession,
} from "@/lib/firestore/live-chat";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant" | "admin";
  senderName?: string;
  content: string;
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  "¿Tienen una esencia similar a Santal 33?",
  "¿Cómo diluyo los aceites para hacer un Eau de Parfum?",
  "Recomiéndame fragancias frescas para uso diario",
  "¿A partir de qué monto el envío es gratis?",
];

export function ScentSommelierChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [chatSession, setChatSession] = useState<LiveChatSession | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      senderName: "Experto SCENTLAB",
      content:
        "¡Hola! 👋 Soy tu **Asesor Experto en Perfumería de SCENTLAB**. ¿Buscas una fragancia en particular, equivalencias de notas olfativas o asesoría para formular tu propio perfume?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Initialize persistent session ID
  useEffect(() => {
    let sid = "";
    if (typeof window !== "undefined") {
      sid = localStorage.getItem("scentlab_live_chat_session_id") || "";
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        localStorage.setItem("scentlab_live_chat_session_id", sid);
      }
      setSessionId(sid);
    }
  }, []);

  // 2. Subscribe to Firestore messages & session updates in real-time
  useEffect(() => {
    if (!sessionId) return;

    // Get or create session doc
    liveChatRepository.getOrCreateSession(sessionId).then((s) => {
      setChatSession(s);
      setIsHumanMode(s.mode === "human");
    });

    // Real-time listener for incoming messages from Admin or AI
    const unsubscribe = liveChatRepository.subscribeMessages(sessionId, (firestoreMsgs) => {
      if (firestoreMsgs.length > 0) {
        const mapped: DisplayMessage[] = firestoreMsgs.map((m) => ({
          id: m.id,
          role: m.sender === "admin" ? "admin" : m.sender === "customer" ? "user" : "assistant",
          senderName: m.senderName,
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages(mapped);
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Mark as read when widget is opened
  useEffect(() => {
    if (isOpen && sessionId) {
      liveChatRepository.markAsReadByCustomer(sessionId);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, loading]);

  // Request human support
  const handleRequestHuman = async () => {
    if (!sessionId) return;
    setIsHumanMode(true);
    await liveChatRepository.requestHumanSupport(sessionId);

    const notice: DisplayMessage = {
      id: `notice_${Date.now()}`,
      role: "admin",
      senderName: "Centro de Asistencia",
      content:
        "👤 **Te hemos conectado con nuestro equipo en vivo.** Un asesor humano ha recibido tu solicitud y te responderá en este chat en breve. ¡Escribe cualquier consulta!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, notice]);
  };

  // Send message
  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading || !sessionId) return;

    const userMsg: DisplayMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 1. Save customer message to Firestore
    await liveChatRepository.sendMessage({
      chatId: sessionId,
      sender: "customer",
      senderName: "Visitante",
      content: query,
      mode: isHumanMode ? "human" : "ai",
    });

    // 2. If in Human mode, wait for admin response
    if (isHumanMode) {
      return;
    }

    // 3. In AI mode, fetch instant answer from AI route
    setLoading(true);
    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      const replyContent = data.reply || "Disculpa, hubo un inconveniente al procesar tu solicitud.";

      // Save AI reply to Firestore so Admin can see the conversation thread
      await liveChatRepository.sendMessage({
        chatId: sessionId,
        sender: "ai",
        senderName: "Experto en Perfumes SCENTLAB",
        content: replyContent,
        mode: "ai",
      });

      const aiMsg: DisplayMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        senderName: "Experto en Perfumes SCENTLAB",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: DisplayMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Hubo un error de conexión con el servidor. Por favor intenta nuevamente.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setIsHumanMode(false);
    if (sessionId) {
      await liveChatRepository.setChatMode(sessionId, "ai");
    }
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        senderName: "Experto SCENTLAB",
        content:
          "¡Hola! 👋 Soy tu **Asesor Experto en Perfumería de SCENTLAB**. ¿En qué te puedo orientar hoy?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <>
      {/* ━━━━ FLOATING TRIGGER BUTTON ━━━━ */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-[#2B5F4A] hover:bg-[#1E4233] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 border border-[#3E8064]/50"
            aria-label="Abrir Asesor Experto en Perfumería"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold tracking-wide">Experto en Perfumes</span>
              <span className="block text-[10px] text-emerald-200/90 font-light -mt-0.5">
                Asesoría y Ayuda en vivo
              </span>
            </div>
          </button>
        )}
      </div>

      {/* ━━━━ CHAT MODAL WINDOW ━━━━ */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[600px] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          
          {/* Header */}
          <div className="bg-[#2B5F4A] text-white px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                {isHumanMode ? (
                  <Headphones className="w-4 h-4 text-emerald-300 animate-pulse" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-wide">
                    {isHumanMode ? "Soporte Humano en Vivo" : "Experto en Perfumes & Ayuda"}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-emerald-400/20 text-emerald-200 px-1.5 py-0.2 rounded-full border border-emerald-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En línea
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100/80 font-light">
                  {isHumanMode
                    ? "Atendido por el equipo de SCENTLAB"
                    : "Asesoría en esencias, fórmulas y pedidos"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={handleReset}
                title="Reiniciar conversación"
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-header with Live Human Agent Trigger */}
          <div className="bg-emerald-50/80 border-b border-emerald-100 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#166534]">
            <span className="font-semibold flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-[#2B5F4A]" /> +1,390 esencias Grado A
            </span>

            {!isHumanMode ? (
              <button
                type="button"
                onClick={handleRequestHuman}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-emerald-100 text-[#166534] px-2 py-0.5 rounded border border-emerald-300 transition shadow-2xs"
              >
                <Headphones className="w-2.5 h-2.5 text-[#2B5F4A]" /> Hablar con Asesor Humano
              </button>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                👤 Modo Asesor Activo
              </span>
            )}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role !== "user" && (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs ${
                      m.role === "admin"
                        ? "bg-blue-900 text-white"
                        : "bg-[#2B5F4A] text-white"
                    }`}
                  >
                    {m.role === "admin" ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-amber-200" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    m.role === "user"
                      ? "bg-[#2B5F4A] text-white rounded-br-xs font-medium"
                      : m.role === "admin"
                      ? "bg-blue-50/90 text-blue-950 border border-blue-200 rounded-bl-xs"
                      : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                  }`}
                >
                  {m.senderName && m.role !== "user" && (
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-[#2B5F4A]">
                      {m.senderName}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap space-y-1">
                    {m.content.split("\n").map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-1" />;

                      // Link parser: [title](href)
                      const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
                      const segments = line.split(linkRegex);

                      return (
                        <p key={i} className="my-0.5 leading-relaxed">
                          {segments.map((seg, j) => {
                            const linkMatch = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                            if (linkMatch) {
                              const [, linkText, linkHref] = linkMatch;
                              return (
                                <Link
                                  key={j}
                                  href={linkHref}
                                  className="inline-flex items-center gap-1 font-bold text-[#166534] bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 transition text-[11px] my-0.5 mr-1 no-underline group"
                                >
                                  <span>{linkText}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-[#2B5F4A] group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              );
                            }

                            // Bold tokens: **bold text**
                            const boldParts = seg.split(/(\*\*.*?\*\*)/g);
                            return boldParts.map((p, k) => {
                              if (p.startsWith("**") && p.endsWith("**")) {
                                return (
                                  <strong key={`${j}-${k}`} className="font-bold text-gray-950">
                                    {p.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return p;
                            });
                          })}
                        </p>
                      );
                    })}
                  </div>

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.role === "user" ? "text-emerald-200/70" : "text-gray-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#2B5F4A] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <Bot className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                </div>
                <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-xs px-4 py-3 text-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-gray-500 ml-1.5">Analizando catálogo y notas…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Pills (when <= 2 messages and not in human mode) */}
          {!isHumanMode && messages.length <= 2 && (
            <div className="p-2.5 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
              <span className="w-full text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Preguntas frecuentes:
              </span>
              {INITIAL_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(sug)}
                  className="text-[11px] px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-700 hover:text-emerald-900 border border-gray-200 rounded-lg transition text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isHumanMode
                  ? "Escribe tu mensaje para el asesor humano..."
                  : "Pregúntame sobre un perfume, notas o formulación..."
              }
              disabled={loading}
              className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] disabled:opacity-40 disabled:hover:bg-[#2B5F4A] text-white rounded-xl transition shadow-xs shrink-0"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
