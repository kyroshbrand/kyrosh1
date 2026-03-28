"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
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

  // Lead form state
  const [showForm, setShowForm] = useState(true);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [formError, setFormError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    // Send initial greeting
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
      if (!res.ok) throw new Error(data.error || "Failed to connect");

      setSessionId(data.sessionId);
      setMessages([
        { role: "user", content: `Hi, my name is ${name}. I'm interested in learning about Kyrosh services.` },
        { role: "bot", content: data.reply },
      ]);
    } catch {
      setMessages([
        {
          role: "bot",
          content: `Hi ${name}! 👋 Welcome to Kyrosh. How can I help you grow your business today?`,
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
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
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
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
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
            <p><span className="online-dot" />Online — Ready to help</p>
          </div>
        </div>

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
              {messages.map((msg, i) => (
                <div key={i} className={`chatbot-msg ${msg.role}`}>
                  {msg.content}
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
                placeholder="Type your message..."
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
