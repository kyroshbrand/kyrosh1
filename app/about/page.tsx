"use client";
import { Section, SectionLabel, Button, GlowBlob } from "@/components/GlobalUI";
import { CheckCircle, Zap, Users, TrendingUp, Instagram, Camera } from "lucide-react";
import { motion } from "framer-motion";

const TEAM = [
  {
    name: "Ameen",
    role: "Founder & Creative Director",
    desc: "The guy who walked into a mosque with a mic and started a movement.",
    init: "AM",
    color: "from-violet-600 to-purple-800",
    icon: Camera,
  },
  {
    name: "Faris",
    role: "Video Production Lead",
    desc: "Turns ideas into cinematic content that stops the scroll.",
    init: "FA",
    color: "from-purple-600 to-indigo-800",
    icon: Camera,
  },
  {
    name: "Rayan",
    role: "Social Media Strategist",
    desc: "Builds schedules, calendars, and content that actually grows accounts.",
    init: "RA",
    color: "from-fuchsia-600 to-purple-800",
    icon: Instagram,
  },
  {
    name: "Lena",
    role: "Brand & Design",
    desc: "Makes every piece of content look like it came from a top-tier studio.",
    init: "LE",
    color: "from-violet-500 to-fuchsia-700",
    icon: Zap,
  },
];

function TeamAvatar({ member, index }: { member: typeof TEAM[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-400 hover:shadow-[0_8px_40px_rgba(119,64,217,0.12)] relative overflow-hidden flex flex-col items-center text-center gap-5">
        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(119,64,217,0.10) 0%, transparent 70%)" }} />

        {/* Avatar circle */}
        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(119,64,217,0.3)] group-hover:shadow-[0_0_50px_rgba(119,64,217,0.5)] transition-shadow duration-400`}>
          <span className="font-syne font-bold text-2xl text-white select-none">{member.init}</span>
          {/* ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/10 group-hover:border-primary/40 transition-colors duration-400" />
        </div>

        {/* Info */}
        <div className="relative z-10">
          <h3 className="font-syne font-bold text-xl text-white mb-1">{member.name}</h3>
          <p className="font-sans text-xs text-primary uppercase tracking-wider mb-3">{member.role}</p>
          <p className="font-sans text-text_secondary text-sm leading-relaxed">{member.desc}</p>
        </div>

        {/* Bottom accent line */}
        <div className="w-8 h-0.5 bg-primary/40 group-hover:w-16 group-hover:bg-primary transition-all duration-400 rounded-full" />
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
          <h1 className="font-syne font-bold text-[10vw] md:text-[6vw] leading-none mb-6">Built From<br/>Community.</h1>
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
          
          <blockquote className="font-syne italic text-2xl md:text-3xl text-white border-l-4 border-primary pl-6 py-2 my-12">
            "We didn't set out to build a marketing agency. We set out to move people."
          </blockquote>
          
          <p>
            That's when Kyrosh became a digital marketing agency. Not by abandoning our roots — but by bringing those roots into every campaign, every video, every strategy deck we deliver.
          </p>
        </div>
      </Section>

      {/* Team */}
      <section className="relative py-24 md:py-32 overflow-hidden border-y border-border">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(119,64,217,0.06) 0%, transparent 70%)" }} />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <SectionLabel>The Team</SectionLabel>
            <h2 className="font-syne font-bold text-4xl md:text-5xl">People Behind<br/>the Work.</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <TeamAvatar key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <Section className="bg-surface border-b border-border">
        <div className="text-center mb-16">
          <SectionLabel>What We Stand For</SectionLabel>
          <h2 className="font-syne font-bold text-4xl md:text-5xl">Our Values.</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { title: "Authentic", icon: CheckCircle, desc: "We don't do fake engagement or hollow content. Everything has a real reason to exist." },
            { title: "Creative", icon: Zap, desc: "Every piece of content is designed to stop the scroll. If it blends in, we go again." },
            { title: "Community-Driven", icon: Users, desc: "We see every audience as real people, not targets." },
            { title: "Results-Focused", icon: TrendingUp, desc: "Pretty content that doesn't convert is just art. We care about numbers too." }
          ].map((v, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border flex gap-6 items-start group hover:border-primary/50 transition-colors"
            >
              <v.icon className="w-8 h-8 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-syne font-bold text-xl mb-3 text-white">{v.title}</h3>
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