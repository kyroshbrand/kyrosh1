"use client";

import { Leaderboard } from "@/components/games/Leaderboard";
import { Button } from "@/components/GlobalUI";
import Link from "next/link";
import { motion } from "framer-motion";
import { BrainCircuit, Gamepad2, Clock, ArrowRight } from "lucide-react";

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-syne font-bold text-white"
          >
            Kyrosh <span className="text-primary">Arcade</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text_secondary max-w-2xl mx-auto"
          >
            Play games, beat the high scores, and climb the leaderboard.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-8"
          >
            {/* Game Card */}
            <div className="w-full bg-card border border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-2xl hover:border-primary/40 transition-all group text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />

              {/* Visual Preview Box */}
              <div className="w-full md:w-48 h-48 md:h-auto md:aspect-square shrink-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-20 h-20 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
              </div>

              {/* Details Segment */}
              <div className="flex-1 w-full flex flex-col items-start z-10">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl md:text-3xl font-syne font-bold text-white group-hover:text-primary transition-colors">Memory Grid</h2>
                  <span className="px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    Memory
                  </span>
                </div>
                
                <p className="text-text_secondary mb-6 max-w-xl leading-relaxed text-sm md:text-base">
                  Match all pairs to win! Your score increases the faster you finish and the fewer moves you make.
                </p>

                {/* Info tags */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text_muted">
                  <span className="flex items-center gap-1.5 bg-white/5 py-1.5 px-3 rounded-full border border-white/5"><Gamepad2 className="w-4 h-4 text-primary" /> 16 Cards</span>
                  <span className="flex items-center gap-1.5 bg-white/5 py-1.5 px-3 rounded-full border border-white/5"><Clock className="w-4 h-4 text-emerald-400" /> Time-attack</span>
                </div>
              </div>

              {/* Call to action (Far Right) */}
              <div className="w-full md:w-auto shrink-0 flex md:block justify-end mt-4 md:mt-0 z-10">
                <Link href="/games/memory" className="w-full md:w-auto inline-block">
                  <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center gap-2">
                    Play Now <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Leaderboard />
        </motion.div>
      </div>
    </main>
  );
}
