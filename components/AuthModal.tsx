"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { HiHandRaised, HiRocketLaunch, HiKey, HiXMark } from "react-icons/hi2";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./GlobalUI";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setUser, refreshUser } = useAuth();
  
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  if (!isAuthModalOpen) return null;

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
      if (refreshUser) await refreshUser();
      closeAuthModal();
    } catch (err: any) {
      setAuthError(err.message);
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
      if (refreshUser) await refreshUser();
      closeAuthModal();
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border border-primary/20 rounded-3xl shadow-2xl p-8 overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
          
          <button 
            onClick={closeAuthModal}
            className="absolute top-6 right-6 text-text_secondary hover:text-white transition-colors"
          >
            <HiXMark className="w-6 h-6" />
          </button>

          <form onSubmit={authMode === "signup" ? handleSignup : handleLogin} className="relative z-10 flex flex-col gap-6">
            <div className="text-center space-y-2">
              <h4 className="text-2xl font-syne font-bold text-white flex items-center justify-center gap-2">
                <HiHandRaised className="text-primary" /> 
                {authMode === "signup" ? "Create Account" : "Welcome Back"}
              </h4>
              <p className="text-sm text-text_secondary">
                {authMode === "signup" ? "Sign up to save your progress and access games." : "Log in to continue where you left off."}
              </p>
            </div>

            <div className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)} 
                    autoComplete="name"
                    required
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-white placeholder:text-text_muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              )}
              
              <div>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)} 
                  autoComplete="tel"
                  required
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-white placeholder:text-text_muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  required
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-white placeholder:text-text_muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {authError && <p className="text-rose-500 text-sm font-medium text-center">{authError}</p>}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-sans font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {authLoading ? "Please wait..." : authMode === "signup" ? (
                <>Sign Up <HiRocketLaunch className="w-4 h-4" /></>
              ) : (
                <>Log In <HiKey className="w-4 h-4" /></>
              )}
            </button>

            <button 
              type="button" 
              className="mt-2 text-sm text-text_secondary hover:text-white transition-colors"
              onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setAuthError(""); }}
            >
              {authMode === "signup" ? "Already have an account? Log in" : "New here? Sign up"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
