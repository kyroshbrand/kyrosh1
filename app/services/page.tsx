"use client";
import { Section, SectionLabel, Button, GlowBlob } from "@/components/GlobalUI";
import { motion } from "framer-motion";

const SERVICES = [
  { num: "01", title: "Video Production", desc: "From concept to final cut. We handle scripting, filming, motion graphics, and editing — producing cinematic content that stops the scroll.", tags: ["Scripting", "Filming", "Editing"] },
  { num: "02", title: "Social Media Marketing", desc: "We build your social presence end-to-end. Content calendars, captions, creatives, scheduling, and monthly reports.", tags: ["Content Calendar", "Analytics"] },
  { num: "03", title: "Instagram Growth", desc: "Organic strategies that build a real audience. No fake followers, no bots. Just consistent, authentic content.", tags: ["Organic Growth", "Reels Strategy"] },
  { num: "04", title: "School Marketing", desc: "Specialized digital marketing for schools. We create content that builds reputation and drives enrollment.", tags: ["Enrollment Campaigns", "Culture Videos"] },
];

const PROCESS = [
  { num: "01", title: "Discovery Call", desc: "We learn your brand, goals, and audience." },
  { num: "02", title: "Strategy Build", desc: "Crafting a custom content strategy tailored to you." },
  { num: "03", title: "Content Creation", desc: "Scripting, filming, editing — done in-house." },
  { num: "04", title: "Publish & Grow", desc: "Content goes live. We manage engagement." },
  { num: "05", title: "Report & Refine", desc: "Monthly reports with real numbers." }
];

export default function Services() {
  return (
    <>
      <Section className="text-center pt-32 pb-12">
        <GlowBlob className="top-10 right-10 w-[400px] h-[400px]" />
        <div className="relative z-10">
          <SectionLabel>What We Offer</SectionLabel>
          <h1 className="font-syne font-bold text-[10vw] md:text-[6vw] leading-none mb-6">Full-Stack<br/>Digital Marketing.</h1>
          <p className="font-sans text-xl text-text_secondary max-w-2xl mx-auto">
            Every service your brand needs to grow — strategy, content, distribution, and results.
          </p>
        </div>
      </Section>

      <div className="max-w-[1200px] mx-auto px-6 space-y-32 py-24">
        {SERVICES.map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            key={s.num} className={`flex flex-col md:flex-row gap-16 items-center ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
          >
            <div className="flex-1 relative">
              <span className="absolute -top-16 -left-8 text-8xl font-syne font-bold text-primary_dim z-0 select-none">{s.num}</span>
              <div className="relative z-10">
                <h2 className="font-syne font-bold text-4xl mb-6">{s.title}</h2>
                <p className="font-sans text-text_secondary text-lg mb-8 leading-relaxed">{s.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {s.tags.map(tag => (
                    <span key={tag} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-sans">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 w-full aspect-[4/3] bg-card rounded-2xl border border-border relative overflow-hidden group">
               <div className="absolute inset-0 bg-[#111] flex items-center justify-center font-syne text-border text-2xl">Visual placeholder</div>
               <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 transition-colors duration-500 rounded-2xl" />
            </div>
          </motion.div>
        ))}
      </div>

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
        <p className="font-sans text-text_secondary mb-10 max-w-xl mx-auto">Book a free discovery call. We'll figure out what your brand needs to connect with your audience.</p>
        <Button href="/contact" variant="primary">Book Free Call</Button>
      </Section>
    </>
  );
}