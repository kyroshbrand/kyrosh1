"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, SectionLabel, GlowBlob } from "@/components/GlobalUI";
import { PlayCircle } from "lucide-react";

const PROJECTS = [
  { id: 1, client: "Diamond International", category: "School", aspect: "aspect-[16/9]" },
  { id: 2, client: "Diamond International", category: "School", aspect: "aspect-[9/16]" },
  { id: 3, client: "Reid & Premium", category: "Brand Videos", aspect: "aspect-[16/9]" },
  { id: 4, client: "Kyrosh Iftar Series", category: "Community", aspect: "aspect-[9/16]" },
  { id: 5, client: "Kyrosh Originals", category: "Instagram", aspect: "aspect-[9/16]" },
  { id: 6, client: "School Event", category: "School", aspect: "aspect-square" },
];

const FILTERS = ["All", "Instagram", "School", "Brand Videos", "Community"];

export default function Work() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered = PROJECTS.filter(p => activeFilter === "All" || p.category === activeFilter);

  return (
    <>
      <Section className="text-center pt-32 pb-12">
        <GlowBlob className="top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px]" />
        <div className="relative z-10">
          <SectionLabel>Portfolio</SectionLabel>
          <h1 className="font-syne font-bold text-[10vw] md:text-[6vw] leading-none mb-6">Our Work<br/>Speaks.</h1>
          <p className="font-sans text-xl text-text_secondary max-w-2xl mx-auto">
            Videos, campaigns, and content built for real impact across brands and communities.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FILTERS.map(f => (
            <button 
              key={f} onClick={() => setActiveFilter(f)}
              className={`px-6 py-2 rounded-full font-sans text-sm transition-all duration-300 border ${
                activeFilter === f ? "bg-primary border-primary text-white" : "border-border text-text_secondary hover:border-primary/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filtered.map(p => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                key={p.id} className={`relative w-full break-inside-avoid bg-card border border-border rounded-2xl overflow-hidden group cursor-pointer ${p.aspect}`}
              >
                <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                   <span className="text-border font-syne text-4xl opacity-50">Project {p.id}</span>
                </div>
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                  <PlayCircle className="w-12 h-12 mb-4 drop-shadow-lg" />
                  <h3 className="font-syne font-bold text-2xl text-center px-4">{p.client}</h3>
                  <p className="font-sans text-sm uppercase tracking-wider mt-2">{p.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Section>
    </>
  );
}