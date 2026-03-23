"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Section, SectionLabel, Button, GlowBlob } from "@/components/GlobalUI";
import { PlayCircle, Camera, TrendingUp, Instagram, BookOpen, Handshake, Layout, ChevronDown } from "lucide-react";

// Stat Counter Component
function Stat({ number, suffix, label, desc }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(number);
      if (start === end) return;
      let timer = setInterval(() => {
        start += Math.ceil(end / 20);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isInView, number]);

  return (
    <div ref={ref} className="text-center p-6 border-r border-border last:border-0 border-b md:border-b-0 md:border-r border-border/50">
      <div className="font-mono text-5xl font-bold text-primary mb-2">{count}{suffix}</div>
      <div className="font-syne font-semibold text-white text-lg mb-1">{label}</div>
      <div className="font-sans text-text_muted text-sm">{desc}</div>
    </div>
  );
}

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

        {/* Marquee */}
        <div className="absolute bottom-0 left-0 right-0 py-4 border-t border-border bg-surface/50 backdrop-blur-md overflow-hidden flex whitespace-nowrap">
          <div className="animate-marquee font-syne font-semibold text-text_muted uppercase tracking-widest text-sm flex gap-12">
            {[...Array(4)].map((_, i) => (
              <span key={i}>Diamond International School • Reid & Premium • Kyrosh Originals • </span>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <Section className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <SectionLabel>Our Story</SectionLabel>
          <h2 className="font-syne font-bold text-4xl md:text-5xl mb-6">Started in a Mosque.</h2>
          <div className="border-l-2 border-primary pl-6 font-sans text-text_secondary space-y-4 text-lg leading-relaxed">
            <p>We walked into mosques during Iftar with a mic, quizzes, and prizes. No ads. No agenda. Just real connection with real people.</p>
            <p>Businesses noticed what we were doing — the authenticity, the reach, the emotion. That's when Kyrosh became a digital marketing agency. Today we carry that same community spirit into every campaign.</p>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-[4/5] rounded-2xl border border-primary/20 bg-card overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
            <PlayCircle className="w-16 h-16 text-primary/50 group-hover:text-primary transition-colors duration-300" />
          </div>
        </div>
      </Section>

      {/* Bento Grid Services */}
      <Section className="bg-surface border-y border-border">
        <div className="text-center mb-16">
          <SectionLabel>What We Do</SectionLabel>
          <h2 className="font-syne font-bold text-4xl md:text-5xl mb-6">Every Tool.<br/>One Team.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Top Row Large */}
          <div className="md:col-span-2 bg-card rounded-2xl p-8 border border-border hover:border-primary/50 hover:shadow-[0_8px_40px_rgba(119,64,217,0.12)] transition-all duration-300 group">
            <Camera className="w-10 h-10 text-primary mb-6" />
            <h3 className="font-syne text-2xl font-bold mb-3 text-white">Video Production</h3>
            <p className="font-sans text-text_secondary">Cinematic quality content for any budget. Scripted, shot, edited in-house.</p>
          </div>
          <div className="md:col-span-1 bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 group">
            <TrendingUp className="w-10 h-10 text-primary mb-6" />
            <h3 className="font-syne text-2xl font-bold mb-3 text-white">Social Media</h3>
            <p className="font-sans text-text_secondary">Strategy, content, and management.</p>
          </div>
          
          {/* Bottom Row */}
          {[
            { title: "Instagram Growth", icon: Instagram, desc: "Organic community building that converts." },
            { title: "School Marketing", icon: BookOpen, desc: "Specialized for education brands." },
            { title: "Brand Partnerships", icon: Handshake, desc: "Connect with audiences that care." },
            { title: "Content Strategy", icon: Layout, desc: "Data-backed calendars keeping you relevant." }
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
              <item.icon className="w-8 h-8 text-primary mb-6" />
              <h3 className="font-syne text-xl font-bold mb-2 text-white">{item.title}</h3>
              <p className="font-sans text-sm text-text_secondary">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button href="/services" variant="ghost">All Services</Button>
        </div>
      </Section>

      {/* Stats */}
      <div className="bg-card border-y border-border">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0">
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

      {/* Testimonials */}
      <Section className="bg-surface border-y border-border">
        <SectionLabel>Client Words</SectionLabel>
        <h2 className="font-syne font-bold text-4xl md:text-5xl mb-16">What They Said.</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { quote: "Kyrosh completely transformed how our school is seen online. Cinematic, professional, and enrollment inquiries went up.", name: "School Management", co: "Diamond International School" },
            { quote: "They understood our brand in the first meeting. The content felt premium — exactly who we wanted to speak to.", name: "Brand Team", co: "Reid & Premium" },
            { quote: "What amazed us was how genuine their content felt. It wasn't just promotional — it felt like a real moment.", name: "Community Member", co: "Kyrosh Iftar Series" }
          ].map((t, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border-l-4 border-primary rounded-r-2xl p-8 relative"
            >
              <div className="absolute top-4 right-4 text-7xl font-syne text-primary/10">"</div>
              <p className="font-sans text-text_secondary mb-8 relative z-10">"{t.quote}"</p>
              <div>
                <p className="font-syne font-bold text-white">{t.name}</p>
                <p className="font-sans text-xs text-primary">{t.co}</p>
              </div>
            </motion.div>
          ))}
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