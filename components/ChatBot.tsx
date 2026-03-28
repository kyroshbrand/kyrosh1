"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "bot" | "admin";
  content: string;
  is_seen: boolean;
  created_at: string;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+91XXXXXXXXXX";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isHumanConnected, setIsHumanConnected] = useState(false);

  // Lead form state
  const [showForm, setShowForm] = useState(true);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [formError, setFormError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);
  if (!supabaseRef.current && typeof window !== "undefined") {
    supabaseRef.current = createBrowserClient();
  }

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !showForm) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, showForm]);

  // Subscribe to Supabase Realtime for messages and session updates
  useEffect(() => {
    if (!sessionId) return;

    const supabase = supabaseRef.current;
    if (!supabase) return;

    // Subscribe to new messages
    const msgChannel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, is_seen: updated.is_seen } : m))
          );
        }
      )
      .subscribe();

    // Subscribe to session changes (human connect/disconnect)
    const sessChannel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as { is_human_connected: boolean };
          setIsHumanConnected(updated.is_human_connected);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(sessChannel);
    };
  }, [sessionId]);

  // Load existing messages when session starts
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

  const handleStartChat = async (e: FormEvent) => {
    e.preventDefault();
    const name = userName.trim();
    const phone = userPhone.trim();

    if (!name) {
      setFormError("Please enter your name");
      return;
    }
    if (!phone || phone.length < 10) {
      setFormError("Please enter a valid phone number");
      return;
    }

    setFormError("");
    setShowForm(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Hi, my name is ${name}. I'm interested in learning about Kyrosh services.`,
          userName: name,
          userPhone: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSessionId(data.sessionId);
      // Load all messages from DB (includes the ones just created)
      await loadMessages(data.sessionId);
    } catch {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          content: `Hi ${name}! 👋 Welcome to Kyrosh. How can I help you grow your business today?`,
          is_seen: false,
          created_at: new Date().toISOString(),
        },
      ]);
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
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          userName,
          userPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      // Messages will arrive via Realtime subscription
      // But if not human-connected and reply exists, it's already in DB
    } catch {
      setError("Couldn't get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderTick = (msg: Message) => {
    if (msg.role !== "user") return null;
    return (
      <span className="chatbot-tick">
        {msg.is_seen ? (
          // Double tick (seen)
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 5l3 3L11 1" stroke="#7740d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 5l3 3L15 1" stroke="#7740d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          // Single tick (sent)
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5l3 3L11 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    );
  };

  return (
    <>
      {/* ── Floating Toggle ────────────────────────────────── */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        id="chatbot-toggle-btn"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* ── Chat Window ────────────────────────────────────── */}
      <div className={`chatbot-window ${isOpen ? "visible" : ""}`} id="chatbot-window">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-avatar">K</div>
          <div className="chatbot-header-info">
            <h3>Kyrosh AI</h3>
            <p>
              <span className="online-dot" />
              {isHumanConnected ? "Connected to support agent" : "Online — Ready to help"}
            </p>
          </div>
        </div>

        {/* Human connected banner */}
        {isHumanConnected && !showForm && (
          <div className="chatbot-human-banner">
            🧑‍💼 You&apos;re now chatting with a support agent
          </div>
        )}

        {showForm ? (
          /* ── Lead Capture Form ──────────────────────────── */
          <form className="chatbot-lead-form" onSubmit={handleStartChat}>
            <h4>👋 Welcome to Kyrosh!</h4>
            <p>Let&apos;s help you grow your business.<br />Share your details to get started.</p>
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              id="chatbot-name-input"
              autoComplete="name"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              id="chatbot-phone-input"
              autoComplete="tel"
            />
            {formError && <p className="chatbot-form-error">{formError}</p>}
            <button type="submit" className="chatbot-lead-start" id="chatbot-start-btn">
              Start Chat 🚀
            </button>
          </form>
        ) : (
          <>
            {/* ── Messages ───────────────────────────────── */}
            <div className="chatbot-messages" id="chatbot-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chatbot-msg ${msg.role === "user" ? "user" : "bot"}`}>
                  {msg.role === "admin" && <span className="chatbot-admin-badge">Support</span>}
                  {msg.content}
                  {renderTick(msg)}
                </div>
              ))}
              {isLoading && (
                <div className="chatbot-typing">
                  <span /><span /><span />
                </div>
              )}
              {error && <div className="chatbot-error">{error}</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* ── CTA Buttons ────────────────────────────── */}
            <div className="chatbot-cta-bar">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="chatbot-cta-btn whatsapp"
                id="chatbot-whatsapp-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="chatbot-cta-btn call"
                id="chatbot-call-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Now
              </a>
            </div>

            {/* ── Input Area ─────────────────────────────── */}
            <div className="chatbot-input-area">
              <input
                ref={inputRef}
                type="text"
                placeholder={isHumanConnected ? "Message support agent..." : "Type your message..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                id="chatbot-message-input"
                autoComplete="off"
              />
              <button
                className="chatbot-input-send"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                id="chatbot-send-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
