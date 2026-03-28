"use client";

import { useState, useEffect, useCallback } from "react";

interface Session {
  id: string;
  unreadCount: number;
  is_human_connected: boolean;
}

export default function AdminHome() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const seedFaqs = async () => {
    setSeeding(true);
    setSeedResult("");
    try {
      const res = await fetch("/api/admin/seed-faqs", { method: "POST" });
      const data = await res.json();
      if (res.ok) setSeedResult(`✅ Seeded ${data.inserted}/${data.total} FAQs`);
      else setSeedResult(`❌ ${data.error}`);
    } catch { setSeedResult("❌ Failed to seed"); } finally { setSeeding(false); }
  };

  const totalUnread = sessions.reduce((s, x) => s + x.unreadCount, 0);

  return (
    <div className="adm-home">
      <h1>Dashboard</h1>
      <div className="adm-stats">
        <div className="adm-stat-card">
          <span className="adm-stat-num">{sessions.length}</span>
          <span className="adm-stat-label">Total Chats</span>
        </div>
        <div className="adm-stat-card">
          <span className="adm-stat-num">{totalUnread}</span>
          <span className="adm-stat-label">Unread Messages</span>
        </div>
        <div className="adm-stat-card">
          <span className="adm-stat-num">{sessions.filter((s) => s.is_human_connected).length}</span>
          <span className="adm-stat-label">Human Connected</span>
        </div>
      </div>

      <div className="adm-section">
        <h2>Knowledge Base</h2>
        <p className="adm-section-desc">Feed the chatbot FAQ data so it can answer visitor questions automatically.</p>
        <button className="adm-feed-btn" onClick={seedFaqs} disabled={seeding}>
          {seeding ? "⏳ Seeding..." : "🧠 Feed FAQs to Chatbot"}
        </button>
        {seedResult && <p className="adm-seed-result">{seedResult}</p>}
      </div>
    </div>
  );
}
