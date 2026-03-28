"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "./GlobalUI";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setUser(null);
    window.location.reload();
  };
  
  const width = useTransform(scrollY, [0, 100], ["100%", "90%"]);
  const y = useTransform(scrollY, [0, 100], [0, 10]);
  
  // Scroll-to-reveal logic for homepage
  const opacity = useTransform(scrollY, [300, 500], [isHome ? 0 : 1, 1]);
  const pointerEvents = useTransform(scrollY, [300, 500], [isHome ? "none" as const : "auto" as const, "auto" as const]);
  const homeY = useTransform(scrollY, [300, 500], [-20, 10]);

  return (
    <>
      <motion.nav 
        style={{ 
          width, 
          y: isHome ? homeY : y,
          opacity,
          pointerEvents
        }}
        className="fixed top-6 left-0 right-0 mx-auto max-w-[680px] z-50 px-4"
      >
        <div className="bg-[#0a0a0a]/75 backdrop-blur-[20px] saturate-[180%] border border-primary/20 rounded-full px-7 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
          <Link href="/" className="font-syne font-bold text-xl tracking-tight text-white hover:text-primary transition-colors">
            Kyrosh.
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {LINKS.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="relative group text-sm font-sans font-medium text-text_secondary hover:text-white transition-colors">
                {link.label}
                {pathname === link.href && (
                  <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:block relative" ref={dropdownRef}>
            {user ? (
              <>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-all overflow-hidden" 
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-3 w-48 bg-[#0a0a0a] border border-primary/20 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="px-4 py-3 border-bottom border-primary/10">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text_secondary hover:bg-primary/10 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <Button href="/contact" variant="primary">Let's Talk</Button>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <button className="absolute top-8 right-8 text-white" onClick={() => setIsOpen(false)}>
            <X className="w-8 h-8" />
          </button>
          <div className="flex flex-col items-center gap-8 text-3xl font-syne font-bold">
            {LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={pathname === link.href ? "text-primary" : "text-white"}>
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="flex flex-col items-center gap-6 mt-4">
                <div className="flex items-center gap-3 text-white text-2xl font-syne">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-base">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-rose-500 font-medium px-6 py-2 rounded-full border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}