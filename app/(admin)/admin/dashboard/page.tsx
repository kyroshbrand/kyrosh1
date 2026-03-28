"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { HiCheckCircle, HiXCircle, HiArrowPath, HiLightBulb } from "react-icons/hi2";

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
  const [seedingGames, setSeedingGames] = useState(false);
  const [seedGamesResult, setSeedGamesResult] = useState("");

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    fetchSessions();
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("admin-home-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchSessions())
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, () => fetchSessions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchSessions]);

  const seedFaqs = async () => {
    setSeeding(true);
    setSeedResult("");
    try {
      const res = await fetch("/api/admin/seed-faqs", { method: "POST" });
      const data = await res.json();
      if (res.ok) setSeedResult("success");
      else setSeedResult("error");
    } catch { setSeedResult("error"); } finally { setSeeding(false); }
  };

  const seedGames = async () => {
    setSeedingGames(true);
    setSeedGamesResult("");
    try {
      const res = await fetch("/api/admin/seed-games", { method: "POST" });
      const data = await res.json();
      if (res.ok) setSeedGamesResult("success");
      else setSeedGamesResult("error");
    } catch { setSeedGamesResult("error"); } finally { setSeedingGames(false); }
  };

  const renderSeedResult = () => {
    if (!seedResult) return null;
    if (seedResult === "success") return (
      <p className="adm-seed-result flex items-center gap-2 text-green-500">
        <HiCheckCircle /> Seeded FAQs successfully
      </p>
    );
    return (
      <p className="adm-seed-result flex items-center gap-2 text-red-500">
        <HiXCircle /> Failed to seed FAQs
      </p>
    );
  };

  const renderSeedGamesResult = () => {
    if (!seedGamesResult) return null;
    if (seedGamesResult === "success") return (
      <p className="adm-seed-result flex items-center gap-2 text-green-500">
        <HiCheckCircle /> Game records seeded successfully
      </p>
    );
    return (
      <p className="adm-seed-result flex items-center gap-2 text-red-500">
        <HiXCircle /> Failed to seed game records
      </p>
    );
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

      <div className="flex flex-col md:flex-row gap-6">
        <div className="adm-section flex-1">
          <h2>Knowledge Base</h2>
          <p className="adm-section-desc">Feed the chatbot FAQ data so it can answer visitor questions automatically.</p>
          <button className="adm-feed-btn flex items-center justify-center gap-2" onClick={seedFaqs} disabled={seeding}>
            {seeding ? (
              <><HiArrowPath className="animate-spin" /> Seeding...</>
            ) : (
              <><HiLightBulb /> Feed FAQs to Chatbot</>
            )}
          </button>
          {renderSeedResult()}
        </div>

        <div className="adm-section flex-1">
          <h2>Memory Game</h2>
          <p className="adm-section-desc">Seed the leaderboard with dummy game records and dummy users for testing.</p>
          <button className="adm-feed-btn flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700" onClick={seedGames} disabled={seedingGames}>
            {seedingGames ? (
              <><HiArrowPath className="animate-spin" /> Seeding...</>
            ) : (
              <><HiCheckCircle className="text-white" /> Seed Game Records</>
            )}
          </button>
          {renderSeedGamesResult()}
        </div>
      </div>
    </div>
  );
}
