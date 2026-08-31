"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminQuickNav } from "@/components/admin/AdminQuickNav";
import { contactMessageService, ContactMessage } from "@/lib/firestore/contact-messages";
import { 
  Inbox, 
  Search, 
  Mail, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  RefreshCw, 
  Filter,
  User,
  Tag,
  Send
} from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await contactMessageService.getAllMessages();
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: "new" | "read" | "replied") => {
    await contactMessageService.updateStatus(id, status);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, status });
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q) ||
      msg.inquiryType.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInquiryLabel = (type: string) => {
    switch (type) {
      case "wholesale":
        return "Compras al por Mayor";
      case "custom-labels":
        return "Etiquetas Personalizadas";
      case "formulation":
        return "Asesoría de Formulación";
      case "orders":
        return "Soporte de Órdenes";
      default:
        return "Consulta General";
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6 font-sans">
        
        {/* Quick Nav Header */}
        <AdminQuickNav />

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 mb-2">
              <Inbox className="w-3.5 h-3.5 text-blue-600" /> Formulario de Contacto & Solicitudes
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Mensajes de Contacto ({messages.length})
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Buzón de entrada con todas las consultas enviadas por clientes desde la página de contacto de la tienda.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMessages}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por remitente, correo o palabras del mensaje..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
            >
              <option value="all">Todos los estados</option>
              <option value="new">Nuevos</option>
              <option value="read">Leídos</option>
              <option value="replied">Respondidos</option>
            </select>
          </div>
        </div>

        {/* Messages List & Detail Modal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List View */}
          <div className={`${selectedMessage ? "lg:col-span-6" : "lg:col-span-12"} space-y-3`}>
            {loading ? (
              <div className="py-16 bg-white rounded-2xl border border-gray-200 text-center text-xs text-gray-500 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#2B5F4A] border-t-transparent animate-spin mx-auto" />
                <p>Cargando mensajes recibidos...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="py-16 bg-white rounded-2xl border border-gray-200 text-center text-xs text-gray-500 space-y-2">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="font-semibold text-gray-900">No hay mensajes registrados</p>
                <p className="text-gray-500 text-[11px]">Los mensajes enviados desde la página /contact aparecerán en esta sección.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const formattedTime = new Date(msg.createdAt).toLocaleString("es-ES", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-[#F0FDF4] border-[#2B5F4A] shadow-sm"
                        : msg.status === "new"
                        ? "bg-white border-blue-200 hover:border-blue-400 shadow-2xs"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {msg.name[0]}
                        </div>
                        <div>
                          <span className="font-bold text-gray-950 block">{msg.name}</span>
                          <span className="text-[10px] text-gray-500 font-medium">{msg.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-mono">{formattedTime}</span>
                        {msg.status === "new" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                            Nuevo
                          </span>
                        )}
                        {msg.status === "read" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                            Leído
                          </span>
                        )}
                        {msg.status === "replied" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Respondido
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                      <Tag className="w-3 h-3 text-gray-500" />
                      <span>{getInquiryLabel(msg.inquiryType)}</span>
                    </div>

                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      "{msg.message}"
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Content Panel */}
          {selectedMessage && (
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6 sticky top-24 self-start">
              
              <div className="flex items-start justify-between pb-4 border-b border-gray-200 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-950">{selectedMessage.name}</h3>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-xs text-[#2B5F4A] hover:underline font-medium inline-flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedMessage.email}</span>
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedMessage.id, "read")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                      selectedMessage.status === "read"
                        ? "bg-gray-100 text-gray-800 border-gray-300"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Marcar Leído
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedMessage.id, "replied")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                      selectedMessage.status === "replied"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    Marcar Respondido
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Tipo de Consulta:</span>
                  <span className="font-bold text-gray-900">{getInquiryLabel(selectedMessage.inquiryType)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Recibido:</span>
                  <span className="font-mono text-gray-900">
                    {new Date(selectedMessage.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              <div className="pt-2 flex gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Respuesta SCENTLAB: ${getInquiryLabel(selectedMessage.inquiryType)}`}
                  onClick={() => handleUpdateStatus(selectedMessage.id, "replied")}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Responder por Email</span>
                </a>
              </div>

            </div>
          )}

        </div>

      </div>
    </AdminGuard>
  );
}
