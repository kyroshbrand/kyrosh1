"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  HiHandRaised, HiRocketLaunch, HiKey, HiUser, HiSun, 
  HiFaceSmile, HiChartBar, HiSwatch, HiCodeBracket, HiDevicePhoneMobile,
  HiArrowLeft, HiArrowSmallRight 
} from "react-icons/hi2";

interface Message {
  id: string;
  role: "user" | "bot" | "admin";
  content: string;
  is_seen: boolean;
  created_at: string;
}

interface UserSession {
  id: string;
  lastMessage: string;
  lastMessageRole: string;
  unreadCount: number;
  updated_at: string;
}

interface User {
  id: string;
  name: string;
  phone: string;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+91XXXXXXXXXX";

type Screen = "auth" | "history" | "chat";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("auth");
  const { user, setUser } = useAuth();
  const [chatSessions, setChatSessions] = useState<UserSession[]>([]);

  // Auth form
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHumanConnected, setIsHumanConnected] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  if (!supabaseRef.current && typeof window !== "undefined") {
    supabaseRef.current = createBrowserClient();
  }

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input
  useEffect(() => {
    if (isOpen && screen === "chat") {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, screen]);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setChatSessions(data.sessions || []);
        setScreen(prev => prev === "auth" ? "history" : prev);
        // Count total unread
        const total = (data.sessions || []).reduce((sum: number, s: UserSession) => sum + s.unreadCount, 0);
        setNotifCount(total);
      }
    } catch { /* not logged in */ }
  };

  const markAsSeen = useCallback(async (sessId: string) => {
    try {
      await fetch("/api/chat/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessId }),
      });
      // Refresh to update unread counts in history
      checkAuth();
    } catch (err) {
      console.error("Failed to mark seen:", err);
    }
  }, []);

  // Realtime subscription for messages
  useEffect(() => {
    if (!sessionId) return;
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const msgChannel = supabase
      .channel(`messages:${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        
        // If chat is open and it's this session, mark as seen
        const isWindowOpen = document.querySelector(".chatbot-window.visible");
        if (isWindowOpen && screen === "chat") {
          markAsSeen(sessionId);
        } else {
          setNotifCount((c) => c + 1);
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "messages",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, is_seen: updated.is_seen } : m))
        );
      })
      .subscribe();

    const sessChannel = supabase
      .channel(`session:${sessionId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "chat_sessions",
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        const updated = payload.new as { is_human_connected: boolean };
        setIsHumanConnected(updated.is_human_connected);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(sessChannel);
    };
  }, [sessionId, screen, markAsSeen]);

  // Global realtime for new messages across all sessions (for notification)
  useEffect(() => {
    if (!user) return;
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const globalChannel = supabase
      .channel("global-notif")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "messages",
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          const newMsg = payload.new as Message & { session_id: string };
          // Only notify for bot/admin messages not in current active session
          if ((newMsg.role === "bot" || newMsg.role === "admin") && newMsg.session_id !== sessionId) {
            setNotifCount((c) => c + 1);
            checkAuth();
          }
        } else if (payload.eventType === "UPDATE") {
          // Refresh sessions to update unread counts when messages are marked seen
          checkAuth();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user, sessionId]);

  // Load messages for a session
  const loadMessages = useCallback(async (sessId: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  }, []);

  // Auth handlers
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authName, phone: authPhone, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setChatSessions([]);
      setScreen("history");
    } catch (err: unknown) {
      setAuthError((err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: authPhone, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      await checkAuth();
      setScreen("history");
    } catch (err: unknown) {
      setAuthError((err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setUser(null);
    setScreen("auth");
    setSessionId(null);
    setMessages([]);
    setChatSessions([]);
    setNotifCount(0);
  };

  const handleDeleteChat = async (e: React.MouseEvent, sessId: string) => {
    e.stopPropagation(); // Don't open chat
    if (!confirm("Are you sure you want to delete this chat?")) return;
    
    try {
      const res = await fetch("/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessId }),
      });
      if (res.ok) {
        setChatSessions(prev => prev.filter(s => s.id !== sessId));
        if (sessionId === sessId) {
          setSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Open existing chat
  const openChat = async (sessId: string) => {
    setSessionId(sessId);
    await loadMessages(sessId);
    setScreen("chat");
    setNotifCount(0);
    markAsSeen(sessId);

    // Check human-connected status
    const supabase = supabaseRef.current;
    if (supabase) {
      const { data } = await supabase
        .from("chat_sessions")
        .select("is_human_connected")
        .eq("id", sessId)
        .single();
      if (data) setIsHumanConnected(data.is_human_connected);
    }
  };

  // Start new chat
  const startNewChat = async () => {
    setSessionId(null);
    setMessages([]);
    setIsHumanConnected(false);
    setScreen("chat");

    // Send initial message to create session
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hi" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSessionId(data.sessionId);
      await loadMessages(data.sessionId);
    } catch {
      setMessages([{
        id: "welcome",
        role: "bot",
        content: `Hi ${user?.name}! [ICON:HandRaised] Welcome to Kyrosh. How can I help you today?`,
        is_seen: false,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
    } catch {
      setError("Couldn't get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectHuman = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/admin/toggle-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, connect: true }),
      });
      if (res.ok) {
        setIsHumanConnected(true);
      }
    } catch (err) {
      console.error("Failed to connect human:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const renderTick = (msg: Message) => {
    if (msg.role !== "user") return null;
    return (
      <span className="chatbot-tick">
        {msg.is_seen ? (
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 5l3 3L11 1" stroke="#7740d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 5l3 3L15 1" stroke="#7740d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5l3 3L11 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    );
  };

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

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[ICON:[^\]]+\])/);
    return parts.map((part, i) => {
      if (part.startsWith("[ICON:") && part.endsWith("]")) {
        const iconName = part.slice(6, -1);
        const iconProps = { className: "inline-block mx-1 text-primary", key: i };
        switch (iconName) {
          case "HandRaised": return <HiHandRaised {...iconProps} />;
          case "Rocket": return <HiRocketLaunch {...iconProps} />;
          case "Key": return <HiKey {...iconProps} />;
          case "Sun": return <HiSun {...iconProps} />;
          case "FaceSmile": return <HiFaceSmile {...iconProps} />;
          case "Palette": return <HiSwatch {...iconProps} />;
          case "Code": return <HiCodeBracket {...iconProps} />;
          case "ChartBar": return <HiChartBar {...iconProps} />;
          case "Phone": return <HiDevicePhoneMobile {...iconProps} />;
          default: return null;
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setNotifCount(0);
  };

  return (
    <>
      {/* ── Floating Toggle ─────────────────────────────── */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={handleToggle}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        id="chatbot-toggle-btn"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {notifCount > 0 && !isOpen && (
          <span className="chatbot-notif-badge">{notifCount > 9 ? "9+" : notifCount}</span>
        )}
      </button>

      {/* ── Chat Window ─────────────────────────────────── */}
      <div className={`chatbot-window ${isOpen ? "visible" : ""}`} id="chatbot-window">
        {/* Header */}
        <div className="chatbot-header">
          {screen === "chat" && (
            <button
              className="chatbot-back-btn"
              onClick={() => { setScreen("history"); checkAuth(); }}
              aria-label="Back to chats"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="chatbot-header-avatar">K</div>
          <div className="chatbot-header-info">
            <h3>Kyrosh Support</h3>
            <p>
              <span className="online-dot" />
              {isHumanConnected ? "Connected to support agent" : "Online — Ready to help"}
            </p>
          </div>
        </div>

        {isHumanConnected && screen === "chat" && (
          <div className="chatbot-human-banner flex items-center justify-center gap-2">
            <HiUser className="w-4 h-4" /> You&apos;re now chatting with a support agent
          </div>
        )}

        {/* ── Auth Screen ───────────────────────────────── */}
        {screen === "auth" && (
          <form className="chatbot-lead-form" onSubmit={authMode === "signup" ? handleSignup : handleLogin}>
            <h4 className="flex items-center justify-center gap-2"><HiHandRaised className="text-primary" /> Welcome to Kyrosh!</h4>
            <p>{authMode === "signup" ? "Create an account to start chatting" : "Log in to continue your chats"}</p>

            {authMode === "signup" && (
              <input type="text" placeholder="Your Name" value={authName}
                onChange={(e) => setAuthName(e.target.value)} autoComplete="name" />
            )}
            <input type="tel" placeholder="Phone Number" value={authPhone}
              onChange={(e) => setAuthPhone(e.target.value)} autoComplete="tel" />
            <input type="password" placeholder="Password" value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)} autoComplete={authMode === "signup" ? "new-password" : "current-password"} />

            {authError && <p className="chatbot-form-error">{authError}</p>}

            <button type="submit" className="chatbot-lead-start flex items-center justify-center gap-2" disabled={authLoading}>
              {authLoading ? "Please wait..." : authMode === "signup" ? (
                <>Sign Up <HiRocketLaunch /></>
              ) : (
                <>Log In <HiKey /></>
              )}
            </button>

            <button type="button" className="chatbot-auth-toggle"
              onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setAuthError(""); }}>
              {authMode === "signup" ? "Already have an account? Log in" : "New here? Sign up"}
            </button>
          </form>
        )}

        {/* ── Chat History Screen ───────────────────────── */}
        {screen === "history" && (
          <div className="chatbot-history">
            <div className="chatbot-history-header flex items-center gap-2">
              <span>Hi, {user?.name}! <HiHandRaised className="inline-block text-primary" /></span>
            </div>

            <button className="chatbot-new-chat-btn" onClick={startNewChat}>
              + New Chat
            </button>

            {chatSessions.length === 0 ? (
              <p className="chatbot-history-empty">No chats yet. Start a new conversation!</p>
            ) : (
              <div className="chatbot-session-list">
                {chatSessions.map((sess) => (
                  <div 
                    key={sess.id} 
                    className="chatbot-session-item" 
                    onClick={() => openChat(sess.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openChat(sess.id)}
                  >
                    <div className="chatbot-session-item-top">
                      <span className="chatbot-session-item-time">{formatTime(sess.updated_at)}</span>
                      <div className="chatbot-session-actions">
                        {sess.unreadCount > 0 && (
                          <span className="chatbot-session-item-badge">{sess.unreadCount}</span>
                        )}
                        <button 
                          className="chatbot-session-delete" 
                          onClick={(e) => handleDeleteChat(e, sess.id)}
                          title="Delete Chat"
                          aria-label="Delete Chat"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="chatbot-session-item-preview">
                      {sess.lastMessage.slice(0, 60)}{sess.lastMessage.length > 60 ? "..." : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="chatbot-cta-bar">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="chatbot-cta-btn whatsapp" id="chatbot-whatsapp-btn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href={`tel:${PHONE_NUMBER}`} className="chatbot-cta-btn call" id="chatbot-call-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call Now
              </a>
            </div>
          </div>
        )}

        {/* ── Chat Screen ───────────────────────────────── */}
        {screen === "chat" && (
          <>
            <div className="chatbot-messages" id="chatbot-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chatbot-msg ${msg.role === "user" ? "user" : "bot"}`}>
                  {msg.role === "admin" && (
                    <div className="flex flex-col">
                      <span className="chatbot-admin-badge">Support</span>
                    </div>
                  )}
                  <div className="chatbot-msg-text">{renderMessageContent(msg.content)}</div>
                  {renderTick(msg)}
                </div>
              ))}
              {!isHumanConnected && messages.length > 3 && (
                <button className="chatbot-human-request-btn" onClick={handleConnectHuman}>
                  🤝 Connect with a human
                </button>
              )}
              {isLoading && (
                <div className="chatbot-typing"><span /><span /><span /></div>
              )}
              {error && <div className="chatbot-error">{error}</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-cta-bar">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="chatbot-cta-btn whatsapp" id="chatbot-whatsapp-btn2">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href={`tel:${PHONE_NUMBER}`} className="chatbot-cta-btn call" id="chatbot-call-btn2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call Now
              </a>
            </div>

            <div className="chatbot-input-area">
              <input ref={inputRef} type="text"
                placeholder={isHumanConnected ? "Message support agent..." : "Type your message..."}
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} disabled={isLoading}
                id="chatbot-message-input" autoComplete="off" />
              <button className="chatbot-input-send" onClick={handleSend}
                disabled={isLoading || !input.trim()} aria-label="Send message" id="chatbot-send-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
