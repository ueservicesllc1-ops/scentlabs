"use client";

import React, { useState, useEffect, useRef } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import {
  liveChatRepository,
  LiveChatSession,
  LiveChatMessage,
} from "@/lib/firestore/live-chat";
import {
  MessageSquare,
  Search,
  Bot,
  User,
  ShieldCheck,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Headphones,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { playIncomingMessageSound } from "@/lib/sound";

const CANNED_RESPONSES = [
  {
    label: "👋 Saludo en vivo",
    text: "¡Hola! Te atiende un asesor de SCENTLAB en vivo. Con mucho gusto te ayudo, ¿en qué te puedo colaborar hoy?",
  },
  {
    label: "🚚 Envío Gratis $250",
    text: "Te recordamos que todas las órdenes a partir de $250 USD califican para Envío Gratis a todo EE.UU. y Puerto Rico. Despachamos en 24 a 48 horas hábiles desde New Jersey.",
  },
  {
    label: "🧪 Fórmula EDP (18-20%)",
    text: "Para un Eau de Parfum de excelente fijación y estela, recomendamos usar entre 18% y 22% de esencia pura SCENTLAB y el resto en alcohol de perfumería (Etanol 96°).",
  },
  {
    label: "📦 Envases de plástico transparente",
    text: "Nuestras esencias se entregan en botellas de plástico transparente de alta resistencia química con tapa hermética antifugas en presentaciones de 1, 2, 4, 8 y 16 oz.",
  },
  {
    label: "✅ Despedida / Orden lista",
    text: "¡Ha sido un placer ayudarte! Si necesitas algo más durante tu compra o formulación, aquí estaremos disponibles. ¡Éxitos con tus perfumes!",
  },
];

export default function AdminLiveChatPage() {
  const [chats, setChats] = useState<LiveChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting_agent" | "active" | "resolved">("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevUnreadTotalRef = useRef<number>(0);

  // 1. Subscribe to all conversations in real-time
  useEffect(() => {
    const unsubscribe = liveChatRepository.subscribeAllChats((data) => {
      const currentUnreadTotal = data.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0);

      // If unread count increased, play sound alert!
      if (currentUnreadTotal > prevUnreadTotalRef.current && soundEnabled && !loading) {
        playIncomingMessageSound();
      }
      prevUnreadTotalRef.current = currentUnreadTotal;

      setChats(data);
      setLoading(false);

      // Auto-select the first chat if none selected
      if (!selectedChatId && data.length > 0) {
        setSelectedChatId(data[0].id);
      }
    });

    return () => unsubscribe();
  }, [selectedChatId, soundEnabled, loading]);

  // 2. Subscribe to messages of the selected conversation
  useEffect(() => {
    if (!selectedChatId) return;

    // Mark as read by admin
    liveChatRepository.markAsReadByAdmin(selectedChatId);

    const unsubscribe = liveChatRepository.subscribeMessages(selectedChatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [selectedChatId]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatId || !replyText.trim() || sending) return;

    const text = replyText.trim();
    setReplyText("");
    setSending(true);

    try {
      await liveChatRepository.sendMessage({
        chatId: selectedChatId,
        sender: "admin",
        senderName: "Asesor SCENTLAB",
        content: text,
      });

      // Switch to human mode when admin replies manually
      await liveChatRepository.setChatMode(selectedChatId, "human");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Error sending admin message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleMode = async () => {
    if (!selectedChatId || !selectedChat) return;
    const newMode = selectedChat.mode === "human" ? "ai" : "human";
    await liveChatRepository.setChatMode(selectedChatId, newMode);
  };

  const handleToggleResolved = async () => {
    if (!selectedChatId || !selectedChat) return;
    const newStatus = selectedChat.status === "resolved" ? "active" : "resolved";
    await liveChatRepository.setChatStatus(selectedChatId, newStatus);
  };

  // Filter conversations
  const filteredChats = chats.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.customerName.toLowerCase().includes(q) ||
      (c.customerEmail && c.customerEmail.toLowerCase().includes(q)) ||
      c.lastMessage.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const waitingCount = chats.filter((c) => c.status === "waiting_agent").length;
  const activeCount = chats.filter((c) => c.status === "active").length;
  const resolvedCount = chats.filter((c) => c.status === "resolved").length;

  return (
    <AdminGuard>
      <div className="space-y-6 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] mb-2">
              <Headphones className="w-3 h-3 text-[#166534]" /> Centro de Soporte y Chat en Vivo
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Live Chat & Asesoría
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Atiende consultas en tiempo real de clientes en la tienda, supervisa las respuestas de la IA e interviene como agente humano cuando lo soliciten.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playIncomingMessageSound();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                soundEnabled
                  ? "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 shadow-2xs"
                  : "bg-gray-100 border-gray-200 text-gray-400"
              }`}
              title={soundEnabled ? "Silenciar notificaciones de sonido" : "Activar sonido de nuevos mensajes"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sonido: Activo</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                  <span>Sonido: Silenciado</span>
                </>
              )}
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronización en vivo activa
            </span>
          </div>
        </div>

        {/* ━━━━ KPI CARDS ━━━━ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Chats</span>
            <div className="text-2xl font-bold font-mono text-gray-950 mt-0.5">{chats.length}</div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Esperando Agente</span>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-0.5">{waitingCount}</div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">En Curso</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">{activeCount}</div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Resueltos</span>
            <div className="text-2xl font-bold font-mono text-gray-600 mt-0.5">{resolvedCount}</div>
          </div>
        </div>

        {/* ━━━━ MAIN CHAT WORKSPACE (2 PANES) ━━━━ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row h-[720px]">
          
          {/* ── LEFT PANE: CONVERSATION LIST ── */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50/40">
            
            {/* Search */}
            <div className="p-3.5 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o mensaje..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 mt-3 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    statusFilter === "all"
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Todos ({chats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("waiting_agent")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                    statusFilter === "waiting_agent"
                      ? "bg-amber-600 text-white font-bold"
                      : "text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  ⏳ Espera ({waitingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("active")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    statusFilter === "active"
                      ? "bg-emerald-700 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Activos ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("resolved")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    statusFilter === "resolved"
                      ? "bg-gray-700 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Cerrados
                </button>
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="py-16 text-center text-xs text-gray-400">
                  <div className="w-6 h-6 border-2 border-[#2B5F4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Cargando conversaciones...
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="py-16 text-center text-xs text-gray-500 px-4 space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="font-semibold text-gray-800">No hay conversaciones</p>
                  <p className="text-[11px] text-gray-400 font-light">
                    Los chats que inicien los clientes en la tienda aparecerán aquí en tiempo real.
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isSelected = chat.id === selectedChatId;
                  const timeFormatted = new Date(chat.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`w-full text-left p-3.5 transition flex items-start gap-3 relative ${
                        isSelected
                          ? "bg-white border-l-4 border-l-[#2B5F4A] shadow-xs"
                          : "hover:bg-gray-100/70"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                        {chat.customerName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-gray-950 truncate">
                            {chat.customerName}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                            {timeFormatted}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-600 truncate font-light">
                          {chat.lastMessageSender === "admin" && "Tú: "}
                          {chat.lastMessageSender === "ai" && "🤖 IA: "}
                          {chat.lastMessage}
                        </p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          {chat.status === "waiting_agent" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                              Esperando Asesor
                            </span>
                          )}
                          {chat.mode === "human" ? (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              👤 Agente
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              🤖 Auto IA
                            </span>
                          )}
                          {chat.status === "resolved" && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                              Resuelto
                            </span>
                          )}
                        </div>
                      </div>

                      {chat.unreadByAdmin > 0 && (
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {chat.unreadByAdmin}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* ── RIGHT PANE: ACTIVE CHAT CONSOLE ── */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {selectedChat ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2B5F4A] text-white flex items-center justify-center font-bold text-sm font-mono shadow-xs">
                      {selectedChat.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-gray-950">
                          {selectedChat.customerName}
                        </h2>
                        <span className="text-[10px] text-gray-400 font-mono">
                          ID: {selectedChat.id.slice(-8)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-light">
                        Iniciado el {new Date(selectedChat.createdAt).toLocaleDateString()} a las{" "}
                        {new Date(selectedChat.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {/* Mode & Status Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 ${
                        selectedChat.mode === "human"
                          ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                          : "bg-purple-50 border-purple-300 text-purple-800 font-bold"
                      }`}
                      title="Cambiar entre modo automático IA y atención humana"
                    >
                      {selectedChat.mode === "human" ? (
                        <>👤 Modo Agente Humano</>
                      ) : (
                        <>🤖 Modo IA Automática</>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleResolved}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 ${
                        selectedChat.status === "resolved"
                          ? "bg-gray-100 border-gray-300 text-gray-800"
                          : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      {selectedChat.status === "resolved" ? "Reabrir Chat" : "Marcar Resuelto"}
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FBFBFC]">
                  {messages.length === 0 ? (
                    <div className="py-20 text-center text-xs text-gray-400">
                      No hay mensajes en esta conversación aún.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isCustomer = m.sender === "customer";
                      const isAi = m.sender === "ai";
                      const isAdmin = m.sender === "admin";

                      return (
                        <div
                          key={m.id}
                          className={`flex gap-3 ${isAdmin ? "justify-end" : "justify-start"}`}
                        >
                          {!isAdmin && (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-xs ${
                                isAi
                                  ? "bg-[#2B5F4A] text-amber-300"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                          )}

                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                              isAdmin
                                ? "bg-[#2B5F4A] text-white rounded-br-xs"
                                : isAi
                                ? "bg-white text-gray-900 border border-emerald-200/80 rounded-bl-xs"
                                : "bg-white text-gray-900 border border-gray-200 rounded-bl-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1 border-b pb-1 border-black/5">
                              <span
                                className={`font-bold text-[11px] ${
                                  isAdmin
                                    ? "text-emerald-200"
                                    : isAi
                                    ? "text-emerald-900 flex items-center gap-1"
                                    : "text-gray-900"
                                }`}
                              >
                                {isAi && <Sparkles className="w-3 h-3 text-amber-500" />}
                                {m.senderName || (isAdmin ? "Tú (Administrador)" : isAi ? "ScentSommelier IA" : "Cliente")}
                              </span>
                              <span
                                className={`text-[9px] font-mono ${
                                  isAdmin ? "text-emerald-200/70" : "text-gray-400"
                                }`}
                              >
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <div className="whitespace-pre-wrap">{m.content}</div>
                          </div>

                          {isAdmin && (
                            <div className="w-8 h-8 rounded-full bg-emerald-950 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Canned Responses Chips Bar */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0 mr-1">
                    Respuestas rápidas:
                  </span>
                  {CANNED_RESPONSES.map((resp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyText(resp.text)}
                      className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 transition shrink-0 whitespace-nowrap"
                    >
                      {resp.label}
                    </button>
                  ))}
                </div>

                {/* Reply Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 bg-white border-t border-gray-200 flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Escribe tu respuesta al cliente en vivo..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={sending}
                    className="flex-1 text-xs px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
                <MessageSquare className="w-12 h-12 text-gray-300" />
                <h3 className="text-base font-bold text-gray-800">Selecciona una conversación</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Haz clic en cualquiera de los chats del panel izquierdo para ver el historial y responder en vivo.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminGuard>
  );
}
