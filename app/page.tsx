"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { Section, SectionLabel, Button, GlowBlob } from "@/components/GlobalUI";
import { 
  PlayCircle, Camera, TrendingUp, Instagram, BookOpen, Handshake, Layout, ChevronDown, 
  Palette, Video, Smartphone, Search, Megaphone, Code
} from "lucide-react";

// ── Stat Counter ──────────────────────────────────────────────────────────────
function Stat({ number, suffix, label, desc }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const end = parseInt(number);
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setCount(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, number]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-center p-8 relative group border-r border-border/40 last:border-0"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(119,64,217,0.08) 0%, transparent 70%)" }} />
      <div className="font-mono text-6xl font-bold text-primary mb-2 tabular-nums">
        {count}{suffix}
      </div>
      <div className="font-syne font-semibold text-white text-lg mb-1">{label}</div>
      <div className="font-sans text-text_muted text-sm">{desc}</div>
    </motion.div>
  );
}

// ── Video Player ───────────────────────────────────────────────────────────────
function VideoPlayer({ src, poster }: { src?: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [showFeedback, setShowFeedback] = useState<null | 'unmuted' | 'muted'>(null);

  const handleClick = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (muted) {
      // First click: unmute and play
      v.muted = false;
      v.loop = false;
      v.play();
      setMuted(false);
      setPlaying(true);
      setShowFeedback('unmuted');
    } else {
      // Toggle pause/play
      if (v.paused) { v.play(); setPlaying(true); }
      else { v.pause(); setPlaying(false); }
    }
    setTimeout(() => setShowFeedback(null), 1200);
  }, [muted]);

  return (
    <div
      onClick={handleClick}
      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 cursor-pointer group shadow-[0_0_60px_rgba(119,64,217,0.20)]"
      style={{ background: '#070710' }}
    >
      {/* gradient frame glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none z-20"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(119,64,217,0.3), inset 0 0 0 1px rgba(211,59,215,0.15)' }} />

      {/* video element */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        /* Placeholder when no src — animated gradient loop */
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 animate-pulse"
            style={{ background: 'linear-gradient(135deg, rgba(119,64,217,0.25) 0%, rgba(211,59,215,0.15) 50%, rgba(119,64,217,0.10) 100%)' }} />
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          <div className="relative z-10 text-center select-none">
            <div className="font-syne text-white/20 text-xs tracking-[0.3em] uppercase mb-4">Kyrosh Showreel</div>
            <div className="font-syne text-white/10 text-[4rem] font-bold leading-none">2024</div>
          </div>
        </div>
      )}

      {/* overlay — dims on hover */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 z-10" />

      {/* centre play button (shown while muted/paused) */}
      <motion.div
        initial={false}
        animate={{ opacity: muted || !playing ? 1 : 0, scale: muted || !playing ? 1 : 0.8 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"
          style={{ background: 'rgba(119,64,217,0.35)' }}>
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </motion.div>

      {/* Bottom bar — volume + label */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
        <span className="font-syne text-white/80 text-xs tracking-widest uppercase">
          {muted ? 'Click to unmute' : playing ? 'Playing' : 'Paused'}
        </span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${muted ? 'bg-primary/60' : 'bg-secondary'} animate-pulse`} />
          <span className="font-mono text-white/50 text-[10px]">{muted ? 'MUTED' : 'LIVE'}</span>
        </div>
      </div>

      {/* Click feedback toast */}
      <motion.div
        key={showFeedback}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showFeedback ? 1 : 0, y: showFeedback ? 0 : 10 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 pointer-events-none"
      >
        <span className="font-sans text-xs text-white">
          {showFeedback === 'unmuted' ? '🔊 Sound on' : '🔇 Muted'}
        </span>
      </motion.div>
    </div>
  );
}

// ── "What We Do" service card ─────────────────────────────────────────────────
const SERVICES_CARDS = [
  { icon: Palette, title: "Graphic Design", desc: "Stunning posters and graphics that define your brand's visual identity and capture attention instantly.", color: "from-violet-500/20 via-fuchsia-500/10 to-transparent" },
  { icon: Smartphone, title: "Software Dev", desc: "High-performance websites and mobile apps built with modern technologies for a seamless user experience.", color: "from-[#d33bd7]/15 to-transparent" },
  { icon: Megaphone, title: "Paid Marketing", desc: "ROI-driven Meta and Google Ads campaigns designed to scale your business and maximize conversions.", color: "from-fuchsia-600/20 via-[#d33bd7]/10 to-transparent" },
  { icon: Video, title: "Video Editing", desc: "Cinematic video editing and motion graphics that tell your brand's story across all digital platforms.", color: "from-violet-400/20 to-[#d33bd7]/5" },
  { icon: Instagram, title: "Social Media", desc: "Full-service management: from content strategy and community building to monthly growth analytics.", color: "from-[#7740d9]/20 via-[#d33bd7]/10 to-transparent" },
  { icon: Search, title: "Digital Growth", desc: "Advanced SEO, GEO-targeting, and WhatsApp marketing strategies to reach your audience everywhere.", color: "from-[#d33bd7]/15 via-purple-500/10 to-transparent" },
];

function ServiceCard({ item, index }: { item: typeof SERVICES_CARDS[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-card rounded-2xl border border-border p-8 group hover:border-primary/50 hover:shadow-[0_8px_40px_rgba(119,64,217,0.12)] transition-all duration-400 overflow-hidden flex flex-col gap-4"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
          <item.icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-syne text-xl font-bold mb-3 text-white">{item.title}</h3>
        <p className="font-sans text-text_secondary text-sm leading-relaxed">{item.desc}</p>
      </div>
      <div className="relative z-10 mt-auto pt-2">
        <span className="font-sans text-xs text-primary/60 group-hover:text-primary transition-colors duration-300 flex items-center gap-1.5">
          Learn more <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </motion.div>
  );
}

// ── Testimonial Vertical Marquee ───────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: "Kyrosh completely transformed how our school is seen online. Cinematic, professional, and enrollment inquiries went up significantly after the first campaign.", name: "School Management", co: "Diamond International School", init: "SM", grad: "from-violet-600 to-purple-800" },
  { quote: "They understood our brand in the first meeting. The content felt premium — exactly who we wanted to speak to.", name: "Brand Team", co: "Reid & Premium", init: "BT", grad: "from-[#d33bd7] to-fuchsia-800" },
  { quote: "What amazed us was how genuine their content felt. It wasn't just promotional — it felt like a real moment.", name: "Community Member", co: "Kyrosh Iftar Series", init: "CM", grad: "from-purple-500 to-[#d33bd7]" },
  { quote: "The ROI from their Instagram strategy was clear within weeks. We're seeing organic reach we've never had before.", name: "Marketing Director", co: "Edu Partner", init: "MD", grad: "from-fuchsia-600 to-violet-800" },
  { quote: "They brought creativity and discipline together. Every piece of content was on-brand and delivered on time.", name: "CEO", co: "Local Brand", init: "CE", grad: "from-[#7740d9] to-[#d33bd7]" },
  { quote: "Working with Kyrosh felt collaborative, not transactional. They genuinely cared about our growth.", name: "Founder", co: "Startup Client", init: "FO", grad: "from-violet-400 to-fuchsia-700" },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-4 relative overflow-hidden">
      <div className="absolute top-3 right-4 text-5xl font-syne leading-none select-none" style={{ color: 'rgba(211,59,215,0.12)' }}>&ldquo;</div>
      <p className="font-sans text-text_secondary text-sm leading-relaxed mb-5 relative z-10">"{t.quote}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(119,64,217,0.3)]`}>
          <span className="font-syne font-bold text-[10px] text-white select-none">{t.init}</span>
        </div>
        <div>
          <p className="font-syne font-bold text-white text-sm leading-none mb-0.5">{t.name}</p>
          <p className="font-sans text-xs text-primary/80">{t.co}</p>
        </div>
      </div>
    </div>
  );
}

function VerticalMarqueeColumn({ items, direction = "up", speed = 28, startFraction = 0 }: { items: typeof TESTIMONIALS; direction?: "up" | "down"; speed?: number; startFraction?: number }) {
  const doubled = [...items, ...items];
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeightRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const initialised = useRef(false);

  useEffect(() => {
    // measure after mount
    const measure = () => {
      if (containerRef.current) {
        const h = containerRef.current.scrollHeight / 2;
        itemHeightRef.current = h;
        if (!initialised.current) {
          // start the down column mid-list so cards show immediately
          setOffset(h * startFraction);
          initialised.current = true;
        }
      }
    };
    measure();
    // slight delay in case fonts haven't painted
    const t = setTimeout(measure, 200);
    return () => clearTimeout(t);
  }, [startFraction]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      setOffset(prev => {
        const h = itemHeightRef.current;
        if (!h) return prev;
        // always increment; both directions use the same counter
        let next = prev + speed * delta;
        if (next >= h) next -= h;
        return next;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, speed]);

  return (
    <div className="relative overflow-hidden h-[520px]">
      <div
        ref={containerRef}
        style={{ transform: `translateY(${direction === "up" ? -offset : (offset - itemHeightRef.current)}px)` }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function Home() {

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden px-6">
        <GlowBlob className="top-1/4 right-1/4 w-[40vw] h-[40vw]" />
        <GlowBlob className="bottom-1/4 left-1/4 w-[50vw] h-[50vw] opacity-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs uppercase tracking-widest font-sans font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Now Accepting New Clients
          </div>
          
          <h1 className="font-syne font-bold text-[12vw] md:text-[7vw] leading-[1.05] tracking-tighter text-white mb-8">
            Digital Marketing <br /> That Actually <br />
            <span className="relative inline-block">
              Moves
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-primary" viewBox="0 0 100 20" preserveAspectRatio="none">
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }}
                  d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                />
              </svg>
            </span> People.
          </h1>
          
          <p className="font-sans text-lg md:text-xl text-text_secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            From Iftar quizzes in mosques to full brand campaigns — Kyrosh builds content that connects, converts, and stays remembered.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/work" variant="primary">See Our Work</Button>
            <Button href="/about" variant="ghost" icon={PlayCircle}>Watch Our Story</Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
          className="absolute bottom-32 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-white" />
        </motion.div>

      </section>
      
      {/* ── Testimonials — 3-col vertical infinite marquee ───────────────── */}
      <section className="bg-grid-subtle py-24 md:py-32 overflow-hidden border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <SectionLabel>Client Words</SectionLabel>
            <h2 className="font-syne font-bold text-4xl md:text-5xl">What They Said.</h2>
          </motion.div>

          {/* Desktop: 3-col marquee */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <VerticalMarqueeColumn items={TESTIMONIALS} direction="up" speed={30} startFraction={0} />
            <VerticalMarqueeColumn items={[...TESTIMONIALS].reverse()} direction="down" speed={25} startFraction={0.5} />
            <VerticalMarqueeColumn items={TESTIMONIALS} direction="up" speed={35} startFraction={0.25} />
          </div>

          {/* Mobile: stacked fade-in cards */}
          <div className="md:hidden space-y-4">
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <TestimonialCard t={t} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story (Commented out)
      <Section className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <SectionLabel>Our Story</SectionLabel>
          <h2 className="font-syne font-bold text-4xl md:text-5xl mb-6">Started in a Mosque.</h2>
          <div className="border-l-2 border-primary pl-6 font-sans text-text_secondary space-y-4 text-lg leading-relaxed">
            <p>We walked into mosques during Iftar with a mic, quizzes, and prizes. No ads. No agenda. Just real connection with real people.</p>
            <p>Businesses noticed what we were doing — the authenticity, the reach, the emotion. That's when Kyrosh became a digital marketing agency. Today we carry that same community spirit into every campaign.</p>
          </div>
        </div>
        <VideoPlayer src="/intro.MOV" />
      </Section>
      */}

      {/* ── Video Showcase ─────────────────────────────────────────────────── */}
      <section className="bg-grid-subtle py-24 md:py-32 border-y border-border">
        <div className="max-w-[900px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-10">
              <SectionLabel>Our Showreel</SectionLabel>
              <h2 className="font-syne font-bold text-4xl md:text-5xl mb-4">See the Work<br/><span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #7740d9, #d33bd7)' }}>In Motion.</span></h2>
              <p className="font-sans text-text_secondary max-w-lg mx-auto">Autoplay preview — click to unmute and watch with sound.</p>
            </div>
            <VideoPlayer src="/intro.MOV" />
          </motion.div>
        </div>
      </section>

      {/* ── What We Do ── Creative scroll-reveal grid ──────────────────────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end gap-6 mb-16"
          >
            <div className="flex-1">
              <SectionLabel>What We Do</SectionLabel>
              <h2 className="font-syne font-bold text-4xl md:text-6xl leading-none">
                Every Tool.<br />
                <span className="text-primary">One Team.</span>
              </h2>
            </div>
            <p className="font-sans text-text_secondary max-w-sm text-base leading-relaxed md:pb-2">
              Six focused services, one agency that handles everything your brand needs to grow and connect.
            </p>
          </motion.div>

          {/* 3-column masonry-feel grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1 — full card + half card */}
            <div className="flex flex-col gap-5">
              <ServiceCard item={SERVICES_CARDS[0]} index={0} />
              <ServiceCard item={SERVICES_CARDS[3]} index={3} />
            </div>
            {/* Column 2 — offset: half then full */}
            <div className="flex flex-col gap-5 md:mt-12">
              <ServiceCard item={SERVICES_CARDS[1]} index={1} />
              <ServiceCard item={SERVICES_CARDS[4]} index={4} />
            </div>
            {/* Column 3 */}
            <div className="flex flex-col gap-5 md:mt-6">
              <ServiceCard item={SERVICES_CARDS[2]} index={2} />
              <ServiceCard item={SERVICES_CARDS[5]} index={5} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-12"
          >
            <Button href="/services" variant="ghost">All Services</Button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── ──────────────────────────────────────────────────────── */}
      <div className="bg-grid-subtle border-y border-border overflow-hidden">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/40 relative">
          <Stat number="50" suffix="+" label="Videos Produced" desc="For Diamond International alone" />
          <Stat number="3" suffix="+" label="Brand Clients" desc="And growing every month" />
          <Stat number="100" suffix="%" label="Community First" desc="Authentic, never hollow" />
          <Stat number="1" suffix="" label="Vision" desc="Content that moves people" />
        </div>
      </div>

      {/* Featured Work */}
      <Section>
        <div className="text-center mb-16">
          <SectionLabel>Our Work</SectionLabel>
          <h2 className="font-syne font-bold text-4xl md:text-5xl">Brands We've<br/>Built Together.</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { client: "Diamond International School", type: "School Marketing", highlight: "50+ Videos", badge: "Featured" },
            { client: "Reid & Premium", type: "Brand Video", highlight: "Full Campaign" },
            { client: "Kyrosh Originals", type: "Community", highlight: "Iftar Series" }
          ].map((work, i) => (
            <div key={i} className="group relative aspect-[4/5] bg-card rounded-2xl border border-border overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                <span className="text-border text-6xl font-syne opacity-50">{i + 1}</span>
              </div>
              <div className="absolute inset-0 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1] flex flex-col justify-end p-8">
                {work.badge && <span className="absolute top-6 left-6 bg-primary/20 text-primary text-xs font-sans px-3 py-1 rounded-full border border-primary/30">{work.badge}</span>}
                <p className="text-primary font-sans text-sm mb-2">{work.type}</p>
                <h3 className="text-2xl font-syne font-bold text-white mb-2">{work.client}</h3>
                <p className="text-text_secondary font-sans text-sm mb-6">{work.highlight}</p>
                <span className="inline-flex items-center gap-2 text-white font-sans text-sm font-medium hover:text-primary transition-colors">
                  View Project <PlayCircle className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button href="/work" variant="primary">View All Work</Button>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative py-32 text-center overflow-hidden">
        <GlowBlob className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10" />
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <h2 className="font-syne font-bold text-5xl md:text-6xl mb-6">Ready to Grow Your Brand?</h2>
          <p className="font-sans text-xl text-text_secondary mb-10">Let's build something your audience won't forget.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button href="/contact" variant="primary">Start a Project</Button>
            <Button href="https://wa.me/1234567890" variant="ghost">WhatsApp Us</Button>
          </div>
        </div>
      </section>
    </>
  );
}