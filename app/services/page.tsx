"use client";
import { Section, SectionLabel, Button, GlowBlob } from "@/components/GlobalUI";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Camera, TrendingUp, Instagram, BookOpen, Handshake, Layout } from "lucide-react";

const SERVICES = [
  {
    num: "01", icon: Camera,
    title: "Video Production",
    desc: "From concept to final cut. We handle scripting, filming, motion graphics, and editing — producing cinematic content that stops the scroll.",
    tags: ["Scripting", "Filming", "Editing", "Motion Graphics"],
    img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80"
  },
  {
    num: "02", icon: TrendingUp,
    title: "Social Media Marketing",
    desc: "We build your social presence end-to-end. Content calendars, captions, creatives, scheduling, and monthly analytics reports.",
    tags: ["Content Calendar", "Analytics", "Scheduling"],
    img: "https://images.unsplash.com/photo-1611162617213-5d8f2e9d0e0c?w=800&q=80"
  },
  {
    num: "03", icon: Instagram,
    title: "Instagram Growth",
    desc: "Organic strategies that build a real audience. No fake followers, no bots. Just consistent, authentic content that converts.",
    tags: ["Organic Growth", "Reels Strategy", "Community"],
    img: "https://images.unsplash.com/photo-1611162616415-96820000a442?w=800&q=80"
  },
  {
    num: "04", icon: BookOpen,
    title: "School Marketing",
    desc: "Specialized digital marketing for schools. We create content that builds institutional reputation and drives enrollment inquiries.",
    tags: ["Enrollment Campaigns", "Culture Videos"],
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
  },
];

const PROCESS = [
  { num: "01", title: "Discovery Call", desc: "We learn your brand, goals, and audience." },
  { num: "02", title: "Strategy Build", desc: "Crafting a custom content strategy tailored to you." },
  { num: "03", title: "Content Creation", desc: "Scripting, filming, editing — done in-house." },
  { num: "04", title: "Publish & Grow", desc: "Content goes live. We manage engagement." },
  { num: "05", title: "Report & Refine", desc: "Monthly reports with real numbers." },
];

// Sticky scroll service card
function StickyServiceItem({ service, index, total }: { service: typeof SERVICES[0]; index: number; total: number }) {
  const stickyTop = 100 + index * 12; // slight offset stacking

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ top: `${stickyTop}px` }}
      className="sticky mb-6 z-10"
    >
      <div
        className="max-w-[1200px] mx-auto px-6 relative group"
        style={{ zIndex: index + 1 }}
      >
        <div className="bg-card border border-border rounded-2xl hover:border-primary/40 transition-colors duration-400 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left content */}
            <div className="flex-1 p-10 md:p-14 relative">
              {/* big number backdrop */}
              <span className="absolute top-4 right-6 text-[8rem] font-syne font-bold text-primary/5 leading-none select-none pointer-events-none">
                {service.num}
              </span>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-mono text-primary/60 text-sm">{service.num}</span>
                </div>
                <h2 className="font-syne font-bold text-3xl md:text-4xl mb-5 text-white">{service.title}</h2>
                <p className="font-sans text-text_secondary text-lg leading-relaxed mb-8 max-w-lg">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map(tag => (
                    <span key={tag} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-sans">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Right visual */}
            <div className="flex-1 md:max-w-[45%] min-h-[300px] md:min-h-auto bg-[#0a0a0f] relative overflow-hidden border-t md:border-t-0 md:border-l border-border/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={service.img} 
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <service.icon className="w-20 h-20 text-white/10" />
              </div>
              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  return (
    <>
      {/* Hero */}
      <Section className="text-center pt-32 pb-12 relative">
        <GlowBlob className="top-10 right-10 w-[400px] h-[400px]" />
        <div className="relative z-10">
          <SectionLabel>What We Offer</SectionLabel>
          <h1 className="font-syne font-bold text-[10vw] md:text-[6vw] leading-none mb-6">
            Full-Stack<br/>Digital Marketing.
          </h1>
          <p className="font-sans text-xl text-text_secondary max-w-2xl mx-auto">
            Every service your brand needs to grow — strategy, content, distribution, and results.
          </p>
        </div>
      </Section>

      {/* Sticky scroll services */}
      <div className="relative py-12 pb-48">
        {SERVICES.map((s, i) => (
          <StickyServiceItem key={s.num} service={s} index={i} total={SERVICES.length} />
        ))}
      </div>

      {/* Process */}
      <Section className="bg-surface border-y border-border">
        <div className="text-center mb-24">
          <SectionLabel>How We Work</SectionLabel>
          <h2 className="font-syne font-bold text-4xl md:text-5xl">Our Process.</h2>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1px] border-t border-dashed border-border -translate-y-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {PROCESS.map((p, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                key={p.num} className="bg-card md:bg-surface border border-border md:border-none p-6 md:p-0 rounded-xl relative group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full group-hover:shadow-[0_0_15px_rgba(119,64,217,0.5)] transition-shadow" />
                <div className="md:mb-12 md:text-center">
                  <span className="text-primary font-mono text-sm mb-2 block">{p.num}</span>
                  <h4 className="font-syne font-bold text-lg mb-2 text-white">{p.title}</h4>
                </div>
                <div className="md:mt-12 md:text-center">
                  <p className="font-sans text-sm text-text_secondary">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="text-center pb-32">
        <h2 className="font-syne font-bold text-4xl mb-6">Not Sure Where to Start?</h2>
        <p className="font-sans text-text_secondary mb-10 max-w-xl mx-auto">
          Book a free discovery call. We'll figure out what your brand needs to connect with your audience.
        </p>
        <Button href="/contact" variant="primary">Book Free Call</Button>
      </Section>
    </>
  );
}