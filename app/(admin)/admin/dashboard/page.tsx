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

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  if (!supabaseRef.current && typeof window !== "undefined") {
    supabaseRef.current = createBrowserClient();
  }

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch {
      console.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Subscribe to realtime updates for sessions and messages
  useEffect(() => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_sessions" },
        () => {
          fetchSessions();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          // Update messages if we're viewing that session
          setMessages((prev) => {
            if (prev.length > 0 && prev[0]?.session_id === newMsg.session_id) {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            }
            return prev;
          });
          // Refresh sessions to update unread counts
          fetchSessions();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, is_seen: updated.is_seen } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages for a session
  const selectSession = useCallback(async (sessionId: string) => {
    setSelectedId(sessionId);
    setSidebarOpen(false);

    const supabase = supabaseRef.current;
    if (!supabase) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);

    // Mark messages as seen
    await fetch("/api/admin/mark-seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    fetchSessions();
  }, [fetchSessions]);

  // Send reply
  const handleReply = async () => {
    if (!reply.trim() || !selectedId || sending) return;

    setSending(true);
    try {
      await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedId, message: reply.trim() }),
      });
      setReply("");
    } catch {
      console.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  // Toggle human connection
  const toggleHuman = async () => {
    if (!selectedId) return;
    const session = sessions.find((s) => s.id === selectedId);
    if (!session) return;

    await fetch("/api/admin/toggle-human", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selectedId, connect: !session.is_human_connected }),
    });

    fetchSessions();
  };

  const selectedSession = sessions.find((s) => s.id === selectedId);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <style>{globalStyle}</style>
        <div style={s.spinner} />
        <p style={{ color: "#888", marginTop: 16 }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <style>{globalStyle}</style>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <div style={{ ...s.sidebar, ...(sidebarOpen ? {} : s.sidebarHiddenMobile) }}>
        <div style={s.sidebarHeader}>
          <h2 style={s.sidebarTitle}>💬 Chats</h2>
          <span style={s.sessionCount}>{sessions.length}</span>
        </div>

        <div style={s.sessionList}>
          {sessions.length === 0 ? (
            <p style={s.emptyState}>No chats yet</p>
          ) : (
            sessions.map((sess) => (
              <button
                key={sess.id}
                style={{
                  ...s.sessionItem,
                  ...(selectedId === sess.id ? s.sessionItemActive : {}),
                }}
                onClick={() => selectSession(sess.id)}
              >
                <div style={s.sessionAvatar}>
                  {sess.name.charAt(0).toUpperCase()}
                </div>
                <div style={s.sessionInfo}>
                  <div style={s.sessionTop}>
                    <span style={s.sessionName}>{sess.name}</span>
                    <span style={s.sessionTime}>{formatTime(sess.lastMessageAt)}</span>
                  </div>
                  <div style={s.sessionBottom}>
                    <span style={s.sessionPreview}>
                      {sess.lastMessage.slice(0, 40)}
                      {sess.lastMessage.length > 40 ? "..." : ""}
                    </span>
                    {sess.unreadCount > 0 && (
                      <span style={s.unreadBadge}>{sess.unreadCount}</span>
                    )}
                  </div>
                  <span style={s.sessionPhone}>📱 {sess.phone}</span>
                  {sess.is_human_connected && (
                    <span style={s.humanTag}>🧑‍💼 Human</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Panel ───────────────────────────────────── */}
      <div style={s.chatPanel}>
        {!selectedSession ? (
          <div style={s.noChatSelected}>
            <p style={{ fontSize: 48, margin: 0 }}>💬</p>
            <h3 style={{ color: "#fff", margin: "12px 0 4px" }}>Select a chat</h3>
            <p style={{ color: "#888", margin: 0, fontSize: 14 }}>
              Choose a conversation from the sidebar
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={s.chatHeader}>
              <button
                style={s.backBtn}
                onClick={() => setSidebarOpen(true)}
              >
                ←
              </button>
              <div>
                <h3 style={s.chatHeaderName}>{selectedSession.name}</h3>
                <p style={s.chatHeaderPhone}>📱 {selectedSession.phone}</p>
              </div>
              <div style={{ flex: 1 }} />
              <button
                style={{
                  ...s.humanToggle,
                  ...(selectedSession.is_human_connected ? s.humanToggleActive : {}),
                }}
                onClick={toggleHuman}
              >
                {selectedSession.is_human_connected ? "🧑‍💼 Disconnect" : "🔌 Connect Human"}
              </button>
            </div>

            {/* Human connected info bar */}
            {selectedSession.is_human_connected && (
              <div style={s.humanInfoBar}>
                AI is paused — You are replying to this chat
              </div>
            )}

            {/* Messages */}
            <div style={s.messagesArea}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...s.msgBubble,
                    ...(msg.role === "user"
                      ? s.msgUser
                      : msg.role === "admin"
                      ? s.msgAdmin
                      : s.msgBot),
                  }}
                >
                  {msg.role === "admin" && (
                    <span style={s.adminLabel}>You (Admin)</span>
                  )}
                  {msg.role === "bot" && (
                    <span style={s.botLabel}>AI Bot</span>
                  )}
                  <span>{msg.content}</span>
                  <div style={s.msgMeta}>
                    <span style={s.msgTime}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.role === "user" && (
                      <span style={msg.is_seen ? s.seenTick : s.unreadTick}>
                        {msg.is_seen ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div style={s.replyArea}>
              <input
                type="text"
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
                disabled={sending}
                style={s.replyInput}
              />
              <button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                style={{
                  ...s.sendBtn,
                  opacity: sending || !reply.trim() ? 0.4 : 1,
                }}
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const globalStyle = `
  body { margin: 0; background: #050008; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #fff; }
  * { box-sizing: border-box; cursor: auto !important; }
  button { cursor: pointer !important; }
  input { cursor: text !important; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const s: Record<string, React.CSSProperties> = {
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #222",
    borderTopColor: "#7740d9",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  container: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
  },

  // Sidebar
  sidebar: {
    width: 360,
    minWidth: 360,
    borderRight: "1px solid rgba(119, 64, 217, 0.15)",
    display: "flex",
    flexDirection: "column",
    background: "rgba(5, 5, 10, 0.95)",
  },
  sidebarHiddenMobile: {},
  sidebarHeader: {
    padding: "20px 20px 16px",
    borderBottom: "1px solid rgba(119, 64, 217, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
  },
  sessionCount: {
    padding: "2px 10px",
    borderRadius: 12,
    background: "rgba(119, 64, 217, 0.2)",
    color: "#7740d9",
    fontSize: 13,
    fontWeight: 700,
  },
  sessionList: {
    flex: 1,
    overflowY: "auto" as const,
  },
  emptyState: {
    textAlign: "center" as const,
    color: "#555",
    padding: 40,
    fontSize: 14,
  },
  sessionItem: {
    width: "100%",
    padding: "14px 20px",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    background: "transparent",
    color: "#fff",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    textAlign: "left" as const,
    transition: "background 0.15s",
  },
  sessionItemActive: {
    background: "rgba(119, 64, 217, 0.12)",
    borderLeft: "3px solid #7740d9",
  },
  sessionAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7740d9, #d33bd7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  sessionInfo: {
    flex: 1,
    minWidth: 0,
  },
  sessionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sessionName: {
    fontWeight: 700,
    fontSize: 14,
  },
  sessionTime: {
    fontSize: 11,
    color: "#666",
  },
  sessionBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionPreview: {
    fontSize: 12,
    color: "#888",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  unreadBadge: {
    padding: "1px 7px",
    borderRadius: 10,
    background: "#7740d9",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  sessionPhone: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    display: "block",
  },
  humanTag: {
    display: "inline-block",
    marginTop: 3,
    padding: "1px 6px",
    borderRadius: 4,
    background: "rgba(37, 211, 102, 0.15)",
    color: "#22c55e",
    fontSize: 10,
    fontWeight: 700,
  },

  // Chat panel
  chatPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "rgba(8, 8, 12, 0.98)",
  },
  noChatSelected: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  chatHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid rgba(119, 64, 217, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  backBtn: {
    display: "none",
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 20,
    padding: "4px 8px",
  },
  chatHeaderName: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
  },
  chatHeaderPhone: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#888",
  },
  humanToggle: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid rgba(119, 64, 217, 0.3)",
    background: "rgba(119, 64, 217, 0.1)",
    color: "#7740d9",
    fontSize: 12,
    fontWeight: 700,
    transition: "all 0.2s",
  },
  humanToggleActive: {
    background: "rgba(37, 211, 102, 0.15)",
    borderColor: "rgba(37, 211, 102, 0.3)",
    color: "#22c55e",
  },
  humanInfoBar: {
    padding: "8px 20px",
    background: "rgba(37, 211, 102, 0.08)",
    borderBottom: "1px solid rgba(37, 211, 102, 0.15)",
    color: "#22c55e",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "center" as const,
  },

  // Messages
  messagesArea: {
    flex: 1,
    overflowY: "auto" as const,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  msgBubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: "break-word" as const,
  },
  msgUser: {
    alignSelf: "flex-end",
    background: "rgba(119, 64, 217, 0.15)",
    border: "1px solid rgba(119, 64, 217, 0.2)",
    borderBottomRightRadius: 4,
  },
  msgBot: {
    alignSelf: "flex-start",
    background: "rgba(60, 60, 80, 0.2)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
  },
  msgAdmin: {
    alignSelf: "flex-start",
    background: "rgba(37, 211, 102, 0.1)",
    border: "1px solid rgba(37, 211, 102, 0.15)",
    borderBottomLeftRadius: 4,
  },
  adminLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    color: "#22c55e",
    marginBottom: 3,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  botLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    color: "#666",
    marginBottom: 3,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  msgMeta: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
    color: "#555",
  },
  seenTick: {
    fontSize: 11,
    color: "#7740d9",
    fontWeight: 700,
  },
  unreadTick: {
    fontSize: 11,
    color: "#555",
  },

  // Reply
  replyArea: {
    padding: "12px 20px",
    borderTop: "1px solid rgba(119, 64, 217, 0.1)",
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexShrink: 0,
    background: "rgba(5, 5, 10, 0.5)",
  },
  replyInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(119, 64, 217, 0.2)",
    background: "rgba(15, 15, 20, 0.8)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "12px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #7740d9, #d33bd7)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    transition: "opacity 0.2s",
  },
};
