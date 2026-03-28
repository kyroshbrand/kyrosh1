"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";

interface Session {
  id: string;
  name: string;
  phone: string;
  is_human_connected: boolean;
  created_at: string;
  updated_at: string;
  lastMessage: string;
  lastMessageRole: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  session_id: string;
  role: "user" | "bot" | "admin";
  content: string;
  is_seen: boolean;
  created_at: string;
}

export default function AdminMessages() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  if (!supabaseRef.current && typeof window !== "undefined") {
    supabaseRef.current = createBrowserClient();
  }

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const channel = supabase
      .channel("admin-messages-page-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, () => fetchSessions())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => {
          if (prev.length > 0 && prev[0]?.session_id === m.session_id) {
            if (prev.some((x) => x.id === m.id)) return prev;
            return [...prev, m];
          }
          return prev;
        });
        fetchSessions();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        const u = payload.new as Message;
        setMessages((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_seen: u.is_seen } : x)));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchSessions]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectSession = useCallback(async (id: string) => {
    setSelectedId(id);
    setMobileShowChat(true);
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const { data } = await supabase.from("messages").select("*").eq("session_id", id).order("created_at", { ascending: true });
    if (data) setMessages(data);
    await fetch("/api/admin/mark-seen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: id }) });
    fetchSessions();
  }, [fetchSessions]);

  const handleReply = async () => {
    if (!reply.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      await fetch("/api/admin/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: selectedId, message: reply.trim() }) });
      setReply("");
    } catch { /* */ } finally { setSending(false); }
  };

  const toggleHuman = async () => {
    if (!selectedId) return;
    const s = sessions.find((x) => x.id === selectedId);
    if (!s) return;
    await fetch("/api/admin/toggle-human", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: selectedId, connect: !s.is_human_connected }) });
    fetchSessions();
  };

  const selected = sessions.find((s) => s.id === selectedId);

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return new Date(d).toLocaleDateString();
  };

  return (
    <div className="adm-messages">
      {/* Sidebar */}
      <div className={`adm-sidebar ${mobileShowChat ? "adm-hide-mobile" : ""}`}>
        <div className="adm-sidebar-header">
          <h3>All Chats</h3>
          <span className="adm-count">{sessions.length}</span>
        </div>
        <div className="adm-session-list">
          {loading ? (
            <p className="adm-empty">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="adm-empty">No chats yet</p>
          ) : (
            sessions.map((sess) => (
              <button key={sess.id} className={`adm-sess ${selectedId === sess.id ? "active" : ""}`} onClick={() => selectSession(sess.id)}>
                <div className="adm-sess-avatar">{sess.name.charAt(0).toUpperCase()}</div>
                <div className="adm-sess-info">
                  <div className="adm-sess-row">
                    <span className="adm-sess-name">{sess.name}</span>
                    <span className="adm-sess-time">{formatTime(sess.lastMessageAt)}</span>
                  </div>
                  <div className="adm-sess-row">
                    <span className="adm-sess-preview">{sess.lastMessage.slice(0, 45)}{sess.lastMessage.length > 45 ? "…" : ""}</span>
                    {sess.unreadCount > 0 && <span className="adm-sess-badge">{sess.unreadCount}</span>}
                  </div>
                  <span className="adm-sess-phone">📱 {sess.phone}</span>
                  {sess.is_human_connected && <span className="adm-human-tag">🧑‍💼 Human</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`adm-chat ${!mobileShowChat ? "adm-hide-mobile" : ""}`}>
        {!selected ? (
          <div className="adm-no-chat">
            <p style={{ fontSize: 48 }}>💬</p>
            <h3>Select a chat</h3>
            <p>Choose a conversation from the sidebar</p>
          </div>
        ) : (
          <>
            <div className="adm-chat-header">
              <button className="adm-back-btn" onClick={() => setMobileShowChat(false)}>←</button>
              <div>
                <h3 className="adm-chat-name">{selected.name}</h3>
                <p className="adm-chat-phone">📱 {selected.phone}</p>
              </div>
              <div style={{ flex: 1 }} />
              <button className={`adm-human-btn ${selected.is_human_connected ? "active" : ""}`} onClick={toggleHuman}>
                {selected.is_human_connected ? "🧑‍💼 Disconnect" : "🔌 Connect"}
              </button>
            </div>

            {selected.is_human_connected && (
              <div className="adm-human-bar">AI is paused — You are replying to this chat</div>
            )}

            <div className="adm-chat-msgs">
              {messages.map((msg) => (
                <div key={msg.id} className={`adm-msg ${msg.role}`}>
                  {msg.role === "admin" && <span className="adm-msg-label admin">You</span>}
                  {msg.role === "bot" && <span className="adm-msg-label bot">AI</span>}
                  <span>{msg.content}</span>
                  <div className="adm-msg-meta">
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.role === "user" && <span className={msg.is_seen ? "adm-seen" : "adm-unseen"}>{msg.is_seen ? "✓✓" : "✓"}</span>}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="adm-reply-bar">
              <input type="text" placeholder="Type your reply..." value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                disabled={sending} />
              <button onClick={handleReply} disabled={sending || !reply.trim()}>
                {sending ? "…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
