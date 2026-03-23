"use client";
import { Section, SectionLabel, Button, GlowBlob } from "@/components/GlobalUI";
import { CheckCircle, Zap, Users, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <>
      <Section className="text-center pt-32 pb-12">
        <GlowBlob className="top-1/4 left-1/4 w-[400px] h-[400px]" />
        <div className="relative z-10">
          <SectionLabel>Who We Are</SectionLabel>
          <h1 className="font-syne font-bold text-[10vw] md:text-[6vw] leading-none mb-6">Built From<br/>Community.</h1>
          <p className="font-sans text-xl text-text_secondary max-w-2xl mx-auto">
            We started with a mic in a mosque. Now we build brands.
          </p>
        </div>
      </Section>

      <Section className="max-w-3xl mx-auto">
        <div className="space-y-8 font-sans text-lg md:text-xl text-text_secondary leading-relaxed">
          <p>
            Kyrosh began as a passion project — walking into mosques during Iftar with a microphone, quiz questions, and prizes for winners. It was never about marketing. It was about connection, laughter, and making people feel seen.
          </p>
          <p>
            Then businesses started noticing what we were doing. Diamond International School. Reid & Premium. They didn't just want videos — they wanted the feeling we created. The authenticity. The community trust.
          </p>
          
          <blockquote className="font-syne italic text-2xl md:text-3xl text-white border-l-4 border-primary pl-6 py-2 my-12">
            "We didn't set out to build a marketing agency. We set out to move people."
          </blockquote>
          
          <p>
            That's when Kyrosh became a digital marketing agency. Not by abandoning our roots — but by bringing those roots into every campaign, every video, every strategy deck we deliver.
          </p>
        </div>
      </Section>

      <Section className="bg-surface border-y border-border">
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
            <div key={i} className="bg-card p-8 rounded-2xl border border-border flex gap-6 items-start group hover:border-primary/50 transition-colors">
              <v.icon className="w-8 h-8 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-syne font-bold text-xl mb-3 text-white">{v.title}</h3>
                <p className="font-sans text-text_secondary text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="text-center pb-32 pt-32">
        <h2 className="font-syne font-bold text-4xl mb-6">Want to Know More?</h2>
        <p className="font-sans text-text_secondary mb-10 max-w-xl mx-auto">Reach out — we love talking about what we do.</p>
        <Button href="/contact" variant="primary">Get in Touch</Button>
      </Section>
    </>
  );
}