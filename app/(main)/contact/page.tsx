"use client";
import { Section, SectionLabel, GlowBlob } from "@/components/GlobalUI";
import { Mail, MessageCircle, Instagram, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formStatus, setFormStatus] = useState("idle"); // idle, submitting, success

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => setFormStatus("success"), 1500);
  };

  return (
    <>
      <Section className="text-center pt-32 pb-12 relative">
        <GlowBlob className="top-10 left-10 w-[300px] h-[300px]" />
        <div className="relative z-10">
          <SectionLabel>Get In Touch</SectionLabel>
          <h1 className="font-syne font-bold text-[10vw] md:text-[6vw] leading-none mb-6">Let's Build<br/>Something.</h1>
          <p className="font-sans text-xl text-text_secondary max-w-2xl mx-auto">
            Tell us about your brand. We'll tell you how we can help.
          </p>
        </div>
      </Section>

      <Section className="grid md:grid-cols-2 gap-16 items-start max-w-5xl mx-auto pt-0">
        {/* Left Side */}
        <div>
          <h2 className="font-syne font-bold text-3xl mb-4">Start the conversation.</h2>
          <p className="font-sans text-text_secondary mb-10">
            Whether you have a full brief or just an idea — reach out. We respond within 24 hours.
          </p>
          
          <div className="space-y-6 mb-12">
            {[
              { label: "WhatsApp", val: "+91 XXXXX XXXXX", icon: MessageCircle, link: "#" },
              { label: "Email", val: "hello@kyrosh.com", icon: Mail, link: "mailto:hello@kyrosh.com" },
              { label: "Instagram", val: "@kyrosh", icon: Instagram, link: "#" }
            ].map(c => (
              <a key={c.label} href={c.link} className="flex items-center gap-4 group p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-card transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-sans text-sm text-text_secondary">{c.label}</p>
                  <p className="font-syne font-semibold text-lg text-white group-hover:text-primary transition-colors">{c.val}</p>
                </div>
              </a>
            ))}
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border font-sans text-xs text-text_secondary">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Typically responds within 24 hours
          </div>
        </div>

        {/* Right Side Form */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <GlowBlob className="-top-20 -right-20 w-[200px] h-[200px] opacity-20" />
          
          {formStatus === "success" ? (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-6">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               </div>
               <h3 className="font-syne font-bold text-2xl text-white mb-2">Message Sent</h3>
               <p className="font-sans text-text_secondary">We'll get back to you shortly.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block font-sans text-sm text-text_secondary mb-2">Your Name</label>
                <input required type="text" className="w-full bg-surface border border-border rounded-lg px-4 py-3 font-sans text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block font-sans text-sm text-text_secondary mb-2">Email Address</label>
                <input required type="email" className="w-full bg-surface border border-border rounded-lg px-4 py-3 font-sans text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block font-sans text-sm text-text_secondary mb-2">Service Needed</label>
                <select className="w-full bg-surface border border-border rounded-lg px-4 py-3 font-sans text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                  <option>Video Production</option>
                  <option>Social Media Marketing</option>
                  <option>School Marketing</option>
                  <option>Not Sure Yet</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-sm text-text_secondary mb-2">Tell Us About Your Brand</label>
                <textarea rows={4} className="w-full bg-surface border border-border rounded-lg px-4 py-3 font-sans text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              </div>
              <button 
                type="submit" disabled={formStatus === "submitting"}
                className="w-full bg-primary text-white font-sans font-medium py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(119,64,217,0.4)] transition-all disabled:opacity-70"
              >
                {formStatus === "submitting" ? "Sending..." : "Send It"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </Section>

      <div className="py-32 text-center relative overflow-hidden flex justify-center items-center">
        <GlowBlob className="w-[300px] h-[300px]" />
        <h2 className="relative z-10 font-syne font-bold text-3xl md:text-5xl text-text_muted opacity-50 tracking-tight">
          We Don't Just Market.<br/>We Move People.
        </h2>
      </div>
    </>
  );
}