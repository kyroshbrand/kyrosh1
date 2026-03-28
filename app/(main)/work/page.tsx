"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, SectionLabel, GlowBlob, Button } from "@/components/GlobalUI";
import { PlayCircle, ExternalLink } from "lucide-react";

// Unsplash open-source sample images (free to use)
const PROJECTS = [
  {
    id: 1, client: "Diamond International School", category: "School", aspect: "aspect-[16/9]",
    type: "School Campaign",
    img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80",
  },
  {
    id: 2, client: "Diamond International School", category: "School", aspect: "aspect-[9/16]",
    type: "Culture Reel",
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
  },
  {
    id: 3, client: "Reid & Premium", category: "Brand Videos", aspect: "aspect-[16/9]",
    type: "Brand Film",
    img: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&q=80",
  },
  {
    id: 4, client: "Kyrosh Iftar Series", category: "Community", aspect: "aspect-[9/16]",
    type: "Community Event",
    img: "https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=600&q=80",
  },
  {
    id: 5, client: "Kyrosh Originals", category: "Instagram", aspect: "aspect-[9/16]",
    type: "Instagram Reel",
    img: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&q=80",
  },
  {
    id: 6, client: "School Event Recap", category: "School", aspect: "aspect-square",
    type: "Event Coverage",
    img: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&q=80",
  },
  {
    id: 7, client: "Social Media Growth", category: "Instagram", aspect: "aspect-square",
    type: "Social Strategy",
    img: "https://images.unsplash.com/photo-1611162617213-5d8f2e9d0e0c?w=800&q=80",
  },
  {
    id: 8, client: "Brand Partnership", category: "Brand Videos", aspect: "aspect-[16/9]",
    type: "Partnership Campaign",
    img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&q=80",
  },
  {
    id: 9, client: "Iftar Community Night", category: "Community", aspect: "aspect-[9/16]",
    type: "Community Series",
    img: "https://images.unsplash.com/photo-1524492914791-8a76b50a0b98?w=600&q=80",
  },
];

const FILTERS = ["All", "Instagram", "School", "Brand Videos", "Community"];

export default function Work() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered = PROJECTS.filter(p => activeFilter === "All" || p.category === activeFilter);

  return (
    <>
      <Section className="text-center pt-32 pb-12 relative">
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
        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FILTERS.map(f => (
            <button
              key={f} onClick={() => setActiveFilter(f)}
              className={`px-6 py-2 rounded-full font-sans text-sm transition-all duration-300 border ${
                activeFilter === f
                  ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(119,64,217,0.4)]"
                  : "border-border text-text_secondary hover:border-primary/50 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          <AnimatePresence>
            {filtered.map(p => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                key={p.id}
                className={`relative w-full break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer border border-border hover:border-primary/50 transition-colors duration-300 ${p.aspect}`}
              >
                {/* Thumbnail image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.img}
                  alt={p.client}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Always-visible bottom gradient + label */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                  <p className="font-sans text-xs text-primary uppercase tracking-wider mb-1">{p.type}</p>
                  <h3 className="font-syne font-bold text-white text-lg leading-tight">{p.client}</h3>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4
                  opacity-0 group-hover:opacity-100 transition-all duration-400
                  backdrop-blur-[2px]"
                  style={{ background: "linear-gradient(135deg, rgba(119,64,217,0.75) 0%, rgba(211,59,215,0.65) 100%)" }}
                >
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                  <span className="font-syne font-bold text-white text-xl text-center px-6">{p.client}</span>
                  <span className="font-sans text-white/80 text-xs uppercase tracking-widest">{p.type}</span>
                  <span className="inline-flex items-center gap-2 text-white/90 text-sm font-sans mt-1 hover:text-white transition-colors">
                    View Project <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-center mt-16">
          <Button href="/contact" variant="primary">Start a Project</Button>
        </div>
      </Section>
    </>
  );
}