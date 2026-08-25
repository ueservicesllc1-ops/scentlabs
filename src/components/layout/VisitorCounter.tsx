"use client";

import React, { useEffect, useState } from "react";
import { Users, Eye, Activity } from "lucide-react";

interface TrafficStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayUnique: number;
  lastVisitedAt: string;
}

export function VisitorCounter() {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function trackVisit() {
      try {
        let isNewVisitor = false;
        let isNewSession = false;

        // Check if unique visitor across visits
        if (typeof window !== "undefined") {
          const storedVisitorId = localStorage.getItem("scentlab_visitor_id");
          if (!storedVisitorId) {
            const newId = "vis_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            localStorage.setItem("scentlab_visitor_id", newId);
            isNewVisitor = true;
          }

          // Check if new session
          const sessionActive = sessionStorage.getItem("scentlab_session_visited");
          if (!sessionActive) {
            sessionStorage.setItem("scentlab_session_visited", "true");
            isNewSession = true;
          }
        }

        const res = await fetch("/api/analytics/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isNewVisitor, isNewSession }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stats && isMounted) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Error tracking visit:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    trackVisit();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 9999,
        padding: "8px 20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Live status dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            position: "relative",
            display: "flex",
            height: 8,
            width: 8,
          }}
        >
          <span
            style={{
              position: "absolute",
              display: "inline-flex",
              height: "100%",
              width: "100%",
              borderRadius: "50%",
              backgroundColor: "#5EAB85",
              opacity: 0.75,
              animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              borderRadius: "50%",
              height: 8,
              width: 8,
              backgroundColor: "#5EAB85",
            }}
          />
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#5EAB85",
          }}
        >
          Tráfico Real
        </span>
      </div>

      <div
        style={{
          width: 1,
          height: 14,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
        }}
      />

      {/* Total Page Views / Visits */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "rgba(255, 255, 255, 0.7)",
        }}
        title="Total de visitas y visualizaciones acumuladas en el sitio"
      >
        <Eye size={13} style={{ color: "#5EAB85" }} />
        <span style={{ color: "rgba(255, 255, 255, 0.45)", fontWeight: 400 }}>Visitas:</span>
        <strong style={{ color: "#ffffff", fontWeight: 600, letterSpacing: "0.02em" }}>
          {loading ? "..." : (stats?.totalVisits || 0).toLocaleString()}
        </strong>
      </div>

      <div
        style={{
          width: 1,
          height: 14,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
        }}
      />

      {/* Unique Visitors */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "rgba(255, 255, 255, 0.7)",
        }}
        title="Visitantes únicos detectados"
      >
        <Users size={13} style={{ color: "#5EAB85" }} />
        <span style={{ color: "rgba(255, 255, 255, 0.45)", fontWeight: 400 }}>Únicos:</span>
        <strong style={{ color: "#ffffff", fontWeight: 600, letterSpacing: "0.02em" }}>
          {loading ? "..." : (stats?.uniqueVisitors || 0).toLocaleString()}
        </strong>
      </div>

      {stats?.todayVisits !== undefined && stats.todayVisits > 0 && (
        <>
          <div
            style={{
              width: 1,
              height: 14,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "rgba(255, 255, 255, 0.7)",
            }}
            title="Visitas registradas el día de hoy"
          >
            <Activity size={13} style={{ color: "#5EAB85" }} />
            <span style={{ color: "rgba(255, 255, 255, 0.45)", fontWeight: 400 }}>Hoy:</span>
            <strong style={{ color: "#ffffff", fontWeight: 600 }}>
              {stats.todayVisits.toLocaleString()}
            </strong>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
