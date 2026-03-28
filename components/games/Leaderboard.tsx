"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase";
import { Trophy, Clock, Target, Medal } from "lucide-react";

type TimeFilter = "all" | "day" | "week" | "month";
type CategoryFilter = "all" | "memory" | "math" | "train" | "word";

interface GameRecord {
  id: string;
  user_id: string;
  moves: number;
  time_taken: number;
  score: number;
  mode: string;
  created_at: string;
  users: {
    name: string;
  };
}

export function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("memory");
  const [leaderboard, setLeaderboard] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, categoryFilter]);

  const fetchLeaderboard = async () => {
    if (!supabase) return;
    setIsLoading(true);

    try {
      let query = supabase
        .from("games")
        .select("*, users(name)")
        .order("score", { ascending: false })
        .order("time_taken", { ascending: true })
        .limit(50);

      // Filtering by mode
      if (categoryFilter !== "all") {
        query = query.eq("mode", categoryFilter);
      }

      // Filtering by time
      if (timeFilter !== "all") {
        const date = new Date();
        if (timeFilter === "day") date.setDate(date.getDate() - 1);
        if (timeFilter === "week") date.setDate(date.getDate() - 7);
        if (timeFilter === "month") date.setMonth(date.getMonth() - 1);
        query = query.gte("created_at", date.toISOString());
      }

      const { data, error } = await query;
      
      if (!error && data) {
        setLeaderboard(data as unknown as GameRecord[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Filters Container */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-12 p-3 bg-card border border-primary/20 rounded-full shadow-xl">
        {/* Time Filters */}
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar gap-2 px-2 shrink-0">
          {(["day", "week", "month", "all"] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                timeFilter === f 
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]" 
                  : "bg-surface border border-border text-text_muted hover:text-white hover:border-primary/50"
              }`}
            >
              {f === "all" ? "All Time" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar gap-2 px-2 shrink-0">
          {(["all", "memory", "math", "train", "word"] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c as CategoryFilter)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                categoryFilter === c 
                  ? "bg-secondary/15 border border-secondary text-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.2)]" 
                  : "bg-surface border border-border text-text_muted hover:text-white hover:border-secondary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-20 text-center text-text_muted">
          No records found for this filters.
        </div>
      ) : (
        <>
          {/* Podium UI */}
          {top3.length > 0 && (
            <div className="w-full flex items-end justify-center gap-2 sm:gap-4 md:gap-8 mb-16 px-2">
              {/* Rank 2 (Silver) */}
              {top3[1] && (
                <PodiumPosition 
                  record={top3[1]} 
                  rank={2} 
                  height="h-32 sm:h-40" 
                  color="from-slate-300 to-slate-500"
                  glow="shadow-[0_-5px_30px_rgba(148,163,184,0.3)]"
                  delay={0.1}
                />
              )}
              {/* Rank 1 (Gold) */}
              {top3[0] && (
                <PodiumPosition 
                  record={top3[0]} 
                  rank={1} 
                  height="h-40 sm:h-52" 
                  color="from-yellow-300 to-amber-600"
                  glow="shadow-[0_-10px_40px_rgba(252,211,77,0.4)]"
                  delay={0}
                />
              )}
              {/* Rank 3 (Bronze) */}
              {top3[2] && (
                <PodiumPosition 
                  record={top3[2]} 
                  rank={3} 
                  height="h-24 sm:h-32" 
                  color="from-amber-600 to-orange-800"
                  glow="shadow-[0_-5px_20px_rgba(217,119,6,0.2)]"
                  delay={0.2}
                />
              )}
            </div>
          )}

          {/* Remaining List */}
          {remaining.length > 0 && (
            <div className="w-full max-w-3xl flex flex-col gap-3">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-text_muted uppercase tracking-wider">
                <div className="col-span-2 sm:col-span-1 text-center">#</div>
                <div className="col-span-3 sm:col-span-5">Player</div>
                <div className="col-span-2 text-center text-emerald-400">Score</div>
                <div className="col-span-2 text-center text-secondary">Moves</div>
                <div className="col-span-3 text-right text-primary">Time</div>
              </div>
              
              <AnimatePresence>
                {remaining.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 bg-card border border-border/50 rounded-2xl items-center hover:bg-white/5 transition-colors"
                  >
                    <div className="col-span-2 sm:col-span-1 text-center font-mono font-bold text-text_secondary">
                      {index + 4}
                    </div>
                    <div className="col-span-3 sm:col-span-5 font-medium text-white truncate">
                      {record.users?.name || "Anonymous"}
                    </div>
                    <div className="col-span-2 text-center font-mono text-emerald-400 font-bold">
                      {record.score}
                    </div>
                    <div className="col-span-2 text-center font-mono">
                      {record.moves}
                    </div>
                    <div className="col-span-3 text-right font-mono text-text_secondary">
                      {record.time_taken > 1000 ? (record.time_taken / 1000).toFixed(2) : record.time_taken}s
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PodiumPosition({ record, rank, height, color, glow, delay }: { record: GameRecord, rank: number, height: string, color: string, glow: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="flex flex-col items-center w-24 sm:w-32"
    >
      <div className="relative mb-4 flex flex-col items-center z-10">
        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-background border-2 shadow-xl flex items-center justify-center mb-[-1rem] z-20 ${
          rank === 1 ? "border-yellow-400" : rank === 2 ? "border-slate-300" : "border-amber-600"
        }`}>
          <span className="text-xl sm:text-2xl font-bold font-syne text-white">{record.users?.name?.charAt(0).toUpperCase() || "?"}</span>
        </div>
        <div className={`px-3 py-1 bg-background border rounded-full text-xs font-bold truncate max-w-full ${
          rank === 1 ? "border-yellow-500/50 text-yellow-500" : rank === 2 ? "border-slate-400/50 text-slate-300" : "border-amber-600/50 text-amber-500"
        }`}>
          {record.users?.name || "Anon"}
        </div>
      </div>
      
      <div className={`w-full ${height} bg-gradient-to-t ${color} rounded-t-xl sm:rounded-t-2xl flex flex-col items-center justify-start pt-4 sm:pt-6 ${glow} relative overflow-hidden ring-1 ring-white/20`}>
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        <span className="text-3xl sm:text-4xl font-syne font-black text-white/90 drop-shadow-md relative z-10">{rank}</span>
        <div className="mt-auto pb-4 sm:pb-6 flex flex-col items-center gap-1 relative z-10">
          <span className="text-xs sm:text-sm font-bold text-emerald-400 drop-shadow">{record.score} pts</span>
          <span className="text-[10px] sm:text-xs text-white/70">{record.time_taken > 1000 ? (record.time_taken / 1000).toFixed(2) : record.time_taken}s</span>
        </div>
      </div>
    </motion.div>
  );
}
