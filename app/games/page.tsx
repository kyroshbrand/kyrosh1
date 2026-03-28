"use client";

import { Leaderboard } from "@/components/games/Leaderboard";
import { Button } from "@/components/GlobalUI";
import Link from "next/link";
import { motion } from "framer-motion";

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
            className="pt-4"
          >
            <Link href="/games/memory">
              <Button variant="primary" className="text-lg px-8 py-4 px-8 rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                Play Memory Game
              </Button>
            </Link>
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
