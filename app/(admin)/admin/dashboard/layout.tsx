"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      if (res.status === 401) { window.location.href = "/admin"; return; }
      const data = await res.json();
      if (data.sessions) {
        const total = data.sessions.reduce((s: number, x: any) => s + (x.unreadCount || 0), 0);
        setUnreadCount(total);
      }
    } catch { /* */ }
  }, []);

  useEffect(() => {
    fetchUnread();
    
    // Simple realtime for unread count
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("admin-layout-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => fetchUnread())
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [fetchUnread]);

  const navLinks = [
    { href: "/admin/dashboard", label: "🏠 Home" },
    { href: "/admin/dashboard/messages", label: `💬 Messages`, badge: unreadCount },
    { href: "/admin/dashboard/toppers", label: "🏆 Game Toppers" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="adm">
        <nav className="adm-nav">
          <div className="adm-nav-brand">
            <span className="adm-logo">K</span>
            <span className="adm-brand-text">Kyrosh Admin</span>
          </div>
          <div className="adm-nav-tabs">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`adm-tab ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
                {link.badge && link.badge > 0 && <span className="adm-tab-badge">{link.badge}</span>}
              </Link>
            ))}
          </div>
          <button className="adm-logout" onClick={() => { window.location.href = "/admin"; }}>
            Logout
          </button>
        </nav>
        <div className="adm-content">
          {children}
        </div>
      </div>
    </>
  );
}

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; cursor: auto !important; }
  button { cursor: pointer !important; }
  input { cursor: text !important; }
  body { margin: 0; background: #060010; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

  .adm { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .adm-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

  /* ── Nav ── */
  .adm-nav {
    display: flex; align-items: center; gap: 16px;
    padding: 0 20px; height: 56px; flex-shrink: 0;
    border-bottom: 1px solid rgba(119,64,217,0.15);
    background: rgba(8,8,14,0.98);
  }
  .adm-nav-brand { display: flex; align-items: center; gap: 10px; }
  .adm-logo {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, #7740d9, #d33bd7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 14px;
  }
  .adm-brand-text { font-weight: 800; font-size: 16px; }
  .adm-nav-tabs { display: flex; gap: 4px; margin-left: 24px; }
  .adm-tab {
    padding: 8px 16px; border: none; border-radius: 8px;
    background: transparent; color: #888; font-size: 13px; font-weight: 600;
    transition: all 0.2s; position: relative;
    text-decoration: none; display: flex; align-items: center;
  }
  .adm-tab:hover { color: #fff; background: rgba(119,64,217,0.1); }
  .adm-tab.active { color: #fff; background: rgba(119,64,217,0.15); }
  .adm-tab-badge {
    position: absolute; top: 2px; right: 2px;
    min-width: 16px; height: 16px; border-radius: 8px;
    background: #f43f5e; color: #fff; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; padding: 0 4px;
  }
  .adm-logout {
    margin-left: auto; padding: 6px 14px; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; background: none; color: #888; font-size: 12px; font-weight: 600;
    transition: all 0.2s;
  }
  .adm-logout:hover { border-color: #f43f5e; color: #f43f5e; }

  /* Shared styles for pages */
  .adm-home { padding: 32px 24px; overflow-y: auto; flex: 1; }
  .adm-home h1 { font-size: 28px; font-weight: 800; margin-bottom: 24px; }
  .adm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .adm-stat-card {
    padding: 24px 20px; border-radius: 16px;
    background: rgba(119,64,217,0.08); border: 1px solid rgba(119,64,217,0.15);
    display: flex; flex-direction: column; gap: 6px;
  }
  .adm-stat-num { font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #7740d9, #d33bd7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .adm-stat-label { font-size: 13px; color: #888; font-weight: 600; }
  .adm-section { padding: 24px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); }
  .adm-section h2 { font-size: 18px; margin-bottom: 8px; }
  .adm-section-desc { font-size: 14px; color: #888; margin-bottom: 16px; }
  .adm-feed-btn {
    padding: 12px 24px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #7740d9, #d33bd7);
    color: #fff; font-size: 14px; font-weight: 700;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .adm-feed-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(119,64,217,0.4); }
  .adm-feed-btn:disabled { opacity: 0.5; transform: none; }
  .adm-seed-result { margin-top: 12px; font-size: 14px; }

  /* Messages Styles */
  .adm-messages { flex: 1; display: flex; overflow: hidden; }
  .adm-sidebar {
    width: 340px; min-width: 340px; border-right: 1px solid rgba(119,64,217,0.1);
    display: flex; flex-direction: column; background: rgba(5,5,10,0.95);
  }
  .adm-sidebar-header {
    padding: 16px 20px; border-bottom: 1px solid rgba(119,64,217,0.08);
    display: flex; align-items: center; justify-content: space-between;
  }
  .adm-sidebar-header h3 { font-size: 16px; font-weight: 700; }
  .adm-count {
    padding: 2px 10px; border-radius: 12px;
    background: rgba(119,64,217,0.2); color: #7740d9; font-size: 12px; font-weight: 700;
  }
  .adm-session-list { flex: 1; overflow-y: auto; }
  .adm-empty { text-align: center; color: #555; padding: 40px; font-size: 14px; }
  .adm-sess {
    width: 100%; padding: 12px 16px; border: none;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    background: transparent; color: #fff;
    display: flex; align-items: flex-start; gap: 10px; text-align: left;
    transition: background 0.15s;
  }
  .adm-sess:hover { background: rgba(119,64,217,0.06); }
  .adm-sess.active { background: rgba(119,64,217,0.12); border-left: 3px solid #7740d9; }
  .adm-sess-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #7740d9, #d33bd7);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; flex-shrink: 0;
  }
  .adm-sess-info { flex: 1; min-width: 0; }
  .adm-sess-row { display: flex; justify-content: space-between; align-items: center; }
  .adm-sess-name { font-weight: 700; font-size: 13px; }
  .adm-sess-time { font-size: 10px; color: #555; }
  .adm-sess-preview { font-size: 12px; color: #777; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adm-sess-badge {
    padding: 1px 6px; border-radius: 8px;
    background: #7740d9; color: #fff; font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .adm-sess-phone { font-size: 10px; color: #555; margin-top: 2px; display: block; }
  .adm-human-tag {
    display: inline-block; margin-top: 2px; padding: 1px 5px; border-radius: 4px;
    background: rgba(37,211,102,0.12); color: #22c55e; font-size: 9px; font-weight: 700;
  }

  .adm-chat { flex: 1; display: flex; flex-direction: column; background: rgba(8,8,12,0.98); }
  .adm-no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .adm-no-chat h3 { color: #fff; margin: 8px 0 4px; }
  .adm-no-chat p { color: #666; font-size: 14px; }
  .adm-chat-header {
    padding: 12px 16px; border-bottom: 1px solid rgba(119,64,217,0.1);
    display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  }
  .adm-back-btn {
    display: none; background: none; border: none; color: #fff; font-size: 20px; padding: 4px 8px;
  }
  .adm-chat-name { font-size: 15px; font-weight: 700; }
  .adm-chat-phone { font-size: 11px; color: #777; margin-top: 1px; }
  .adm-human-btn {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid rgba(119,64,217,0.3); background: rgba(119,64,217,0.08);
    color: #7740d9; font-size: 11px; font-weight: 700; transition: all 0.2s;
  }
  .adm-human-btn.active { background: rgba(37,211,102,0.12); border-color: rgba(37,211,102,0.3); color: #22c55e; }
  .adm-human-bar {
    padding: 6px 16px; background: rgba(37,211,102,0.06);
    border-bottom: 1px solid rgba(37,211,102,0.1);
    color: #22c55e; font-size: 11px; font-weight: 600; text-align: center;
  }
  .adm-chat-msgs {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .adm-msg {
    max-width: 72%; padding: 10px 14px; border-radius: 14px;
    font-size: 14px; line-height: 1.5; word-break: break-word;
  }
  .adm-msg.user {
    align-self: flex-end; background: rgba(119,64,217,0.12);
    border: 1px solid rgba(119,64,217,0.18); border-bottom-right-radius: 4px;
  }
  .adm-msg.bot {
    align-self: flex-start; background: rgba(50,50,70,0.15);
    border: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius: 4px;
  }
  .adm-msg.admin {
    align-self: flex-start; background: rgba(37,211,102,0.08);
    border: 1px solid rgba(37,211,102,0.12); border-bottom-left-radius: 4px;
  }
  .adm-msg-label { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .adm-msg-label.admin { color: #22c55e; }
  .adm-msg-label.bot { color: #555; }
  .adm-msg-meta { display: flex; justify-content: flex-end; gap: 4px; margin-top: 3px; }
  .adm-msg-meta span { font-size: 10px; color: #444; }
  .adm-seen { color: #7740d9 !important; font-weight: 700; }
  .adm-unseen { color: #444 !important; }

  .adm-reply-bar {
    padding: 10px 16px; border-top: 1px solid rgba(119,64,217,0.08);
    display: flex; gap: 8px; align-items: center; flex-shrink: 0;
    background: rgba(5,5,10,0.5);
  }
  .adm-reply-bar input {
    flex: 1; padding: 10px 14px; border-radius: 10px;
    border: 1px solid rgba(119,64,217,0.18); background: rgba(15,15,20,0.8);
    color: #fff; font-size: 13px; outline: none; font-family: inherit;
  }
  .adm-reply-bar input:focus { border-color: #7740d9; }
  .adm-reply-bar button {
    padding: 10px 20px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #7740d9, #d33bd7);
    color: #fff; font-size: 13px; font-weight: 700; transition: opacity 0.2s;
  }
  .adm-reply-bar button:disabled { opacity: 0.4; }

  .adm-placeholder {
    padding: 60px 20px; text-align: center; border-radius: 16px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  }
  .adm-placeholder h3 { margin: 12px 0 4px; }
  .adm-placeholder p { color: #666; font-size: 14px; }

  @media (max-width: 768px) {
    .adm-nav { padding: 0 12px; gap: 8px; }
    .adm-brand-text { display: none; }
    .adm-nav-tabs { margin-left: 8px; gap: 2px; }
    .adm-tab { padding: 6px 10px; font-size: 12px; }
    .adm-sidebar { width: 100%; min-width: 100%; }
    .adm-hide-mobile { display: none !important; }
    .adm-back-btn { display: block !important; }
  }
`;
