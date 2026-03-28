"use client";

import { motion, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, PlayCircle } from "lucide-react";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <main className={`min-h-screen ${isHome ? "" : "pt-24"}`}>
      {children}
    </main>
  );
}

// --- CUSTOM CURSOR ---
export function Cursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') !== null || target.closest('button') !== null);
    };
    
    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", updateHoverState);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", updateHoverState);
    };
  }, []);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[100]">
      <motion.div 
        className="absolute w-2 h-2 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2"
        animate={{ x: mousePosition.x, y: mousePosition.y, scale: isHovering ? 0 : 1 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      <motion.div 
        className="absolute w-8 h-8 border border-primary rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        animate={{ x: mousePosition.x, y: mousePosition.y, scale: isHovering ? 1.5 : 1, backgroundColor: isHovering ? "rgba(119, 64, 217, 0.1)" : "transparent" }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
      >
        {isHovering && <ArrowRight className="w-3 h-3 text-primary" />}
      </motion.div>
    </div>
  );
}

// --- GRAIN OVERLAY ---
export function Grain() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.035]"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
  );
}

// --- SECTION WRAPPER ---
export function Section({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-[1200px] mx-auto px-6 py-24 md:py-32 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// --- BUTTONS ---
export function Button({ href, variant = "primary", children, icon: Icon }: any) {
  const base = "relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-sans font-medium transition-all duration-300 overflow-hidden group";
  const variants = {
    primary: "bg-primary text-white hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(119,64,217,0.4)]",
    ghost: "border border-primary text-white hover:bg-primary hover:scale-[1.03]"
  };
  
  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {Icon && <Icon className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />}
    </>
  );

  return href ? (
    <Link href={href} className={`${base} ${variants[variant as keyof typeof variants]}`}>{content}</Link>
  ) : (
    <button className={`${base} ${variants[variant as keyof typeof variants]}`}>{content}</button>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-primary font-sans text-xs uppercase tracking-[0.15em] font-medium mb-4">{children}</div>;
}

export function GlowBlob({ className = "" }: { className?: string }) {
  return <div className={`absolute rounded-full bg-primary/20 blur-[120px] pointer-events-none ${className}`} />;
}