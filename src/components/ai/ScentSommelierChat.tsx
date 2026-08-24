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
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! 👋 Soy tu **Asesor Experto en Perfumería de SCENTLAB**. ¿Buscas una fragancia en particular, equivalencias de notas olfativas o asesoría para formular tu propio perfume?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: data.reply || "Disculpa, hubo un inconveniente al procesar tu solicitud.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Hubo un error de conexión con el servidor. Por favor intenta nuevamente.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          
          {/* Header */}
          <div className="bg-[#2B5F4A] text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-wide">Experto en Perfumes & Ayuda</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-emerald-400/20 text-emerald-200 px-1.5 py-0.2 rounded-full border border-emerald-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En línea
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100/80 font-light">
                  Asesoría en esencias, fórmulas y pedidos
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

          {/* Quick links header bar */}
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-1.5 flex items-center justify-between text-[11px] text-[#166534]">
            <span className="font-semibold flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-[#2B5F4A]" /> +1,390 esencias puras Grado A
            </span>
            <Link
              href="/fragrance"
              onClick={() => setIsOpen(false)}
              className="text-[10px] uppercase font-bold hover:underline inline-flex items-center gap-0.5 text-[#2B5F4A]"
            >
              Ver catálogo <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#2B5F4A] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                    <Bot className="w-3.5 h-3.5 text-amber-200" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    m.role === "user"
                      ? "bg-[#2B5F4A] text-white rounded-br-xs font-medium"
                      : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-1">
                    {m.content.split("\n").map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-1" />;

                      // Rich inline parser: supports both **bold** and [link text](url)
                      // Tokenize by links first: [title](href)
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
                  <span className="text-[11px] text-gray-500 ml-1.5">Analizando acordes y catálogo…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Pills (when only 1 or 2 messages) */}
          {messages.length <= 2 && (
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
              placeholder="Pregúntame sobre un perfume, notas o formulación..."
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
