"use client";
import { Section, SectionLabel, Button, GlowBlob } from "@/components/GlobalUI";
import { CheckCircle, Zap, Users, TrendingUp, Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

const TEAM = [
  {
    name: "Ameen",
    role: "Founder & Creative Director",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    social: { instagram: "#", twitter: "#", linkedin: "#" },
    color1: "#7740d9", color2: "#d33bd7",
  },
  {
    name: "Faris",
    role: "Video Production Lead",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    social: { instagram: "#", twitter: "#", linkedin: "#" },
    color1: "#d33bd7", color2: "#7740d9",
  },
  {
    name: "Rayan",
    role: "Social Media Strategist",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    social: { instagram: "#", twitter: "#", linkedin: "#" },
    color1: "#9b4fd4", color2: "#d33bd7",
  },
  {
    name: "Lena",
    role: "Brand & Design",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    social: { instagram: "#", twitter: "#", linkedin: "#" },
    color1: "#d33bd7", color2: "#9b4fd4",
  },
];

function TeamCard({ member, index }: { member: typeof TEAM[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4] border border-border/40"
    >
      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={member.img}
        alt={member.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Always-visible subtle bottom grain */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-0" />
      <div className="absolute bottom-4 left-4 z-20 group-hover:opacity-0 transition-opacity duration-300">
        <p className="font-syne font-bold text-white text-sm">{member.name}</p>
      </div>

      {/* Hover overlay — slides up */}
      <div
        className="absolute inset-0 z-30 flex flex-col justify-end p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ background: `linear-gradient(160deg, ${member.color1}ee 0%, ${member.color2}cc 100%)` }}
      >
        {/* Social icons row */}
        <div className="flex gap-3 mb-5">
          <a href={member.social.instagram}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={e => e.stopPropagation()}>
            <Instagram className="w-4 h-4 text-white" />
          </a>
          <a href={member.social.twitter}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={e => e.stopPropagation()}>
            <Twitter className="w-4 h-4 text-white" />
          </a>
          <a href={member.social.linkedin}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={e => e.stopPropagation()}>
            <Linkedin className="w-4 h-4 text-white" />
          </a>
        </div>

        <h3 className="font-syne font-bold text-2xl text-white mb-1">{member.name}</h3>
        <p className="font-sans text-white/80 text-xs uppercase tracking-[0.15em]">{member.role}</p>
        {/* Accent line */}
        <div className="mt-4 h-px w-10 bg-white/40 group-hover:w-20 transition-all duration-500" />
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <>
      {/* Hero */}
      <Section className="text-center pt-32 pb-12 relative overflow-hidden">
        <GlowBlob className="top-1/4 left-1/4 w-[400px] h-[400px]" />
        <div className="relative z-10">
          <SectionLabel>Who We Are</SectionLabel>
          <h1 className="font-syne font-bold text-[10vw] md:text-[6vw] leading-none mb-6">
            Built From<br/>Community.
          </h1>
          <p className="font-sans text-xl text-text_secondary max-w-2xl mx-auto">
            We started with a mic in a mosque. Now we build brands.
          </p>
        </div>
      </Section>

      {/* Story */}
      <Section className="max-w-3xl mx-auto">
        <div className="space-y-8 font-sans text-lg md:text-xl text-text_secondary leading-relaxed">
          <p>
            Kyrosh began as a passion project — walking into mosques during Iftar with a microphone, quiz questions, and prizes for winners. It was never about marketing. It was about connection, laughter, and making people feel seen.
          </p>
          <p>
            Then businesses started noticing what we were doing. Diamond International School. Reid &amp; Premium. They didn't just want videos — they wanted the feeling we created. The authenticity. The community trust.
          </p>
        </div>
      </Section>

      {/* Quote — full-width editorial */}
      <div className="py-20 md:py-32 border-y border-border/60 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 100% at 50% 50%, rgba(119,64,217,0.12) 0%, transparent 70%)" }} />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Decorative large quote mark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16"
          >
            <div
              className="font-syne font-bold shrink-0 leading-none select-none"
              style={{
                fontSize: "clamp(6rem, 14vw, 14rem)",
                background: "linear-gradient(135deg, #7740d9, #d33bd7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                opacity: 0.6,
              }}
            >
              "
            </div>
            <div>
              <blockquote
                className="font-syne font-bold text-white leading-tight mb-6"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 3rem)" }}
              >
                We didn't set out to build a marketing agency. We set out to move people.
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-secondary" />
                <span className="font-sans text-sm tracking-widest uppercase text-text_secondary">Kyrosh Founding Story</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Team — editorial list layout */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end gap-4 mb-14"
          >
            <div className="flex-1">
              <SectionLabel>The Team</SectionLabel>
              <h2 className="font-syne font-bold text-4xl md:text-6xl leading-none">
                People Who<br/>
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(90deg, #7740d9, #d33bd7)" }}
                >
                  Make It Move.
                </span>
              </h2>
            </div>
            <p className="font-sans text-text_secondary max-w-xs text-sm leading-relaxed md:pb-2">
              A small team with big ambition. Every person here owns their craft.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {TEAM.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <Section className="bg-surface/40 border-b border-border">
        <div className="text-center mb-16">
          <SectionLabel>What We Stand For</SectionLabel>
          <h2 className="font-syne font-bold text-4xl md:text-5xl">Our Values.</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { title: "Authentic", icon: CheckCircle, desc: "We don't do fake engagement or hollow content. Everything has a real reason to exist." },
            { title: "Creative", icon: Zap, desc: "Every piece of content is designed to stop the scroll. If it blends in, we go again." },
            { title: "Community-Driven", icon: Users, desc: "We see every audience as real people, not targets." },
            { title: "Results-Focused", icon: TrendingUp, desc: "Pretty content that doesn't convert is just art. We care about numbers too." }
          ].map((v, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card/60 p-8 rounded-2xl border border-border flex gap-6 items-start group hover:border-primary/50 transition-all duration-300 hover:shadow-[0_4px_30px_rgba(119,64,217,0.10)]"
            >
              <v.icon className="w-7 h-7 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-syne font-bold text-xl mb-2 text-white">{v.title}</h3>
                <p className="font-sans text-text_secondary text-sm leading-relaxed">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="text-center pb-32 pt-32">
        <h2 className="font-syne font-bold text-4xl mb-6">Want to Know More?</h2>
        <p className="font-sans text-text_secondary mb-10 max-w-xl mx-auto">
          Reach out — we love talking about what we do.
        </p>
        <Button href="/contact" variant="primary">Get in Touch</Button>
      </Section>
    </>
  );
}