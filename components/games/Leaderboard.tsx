"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase";
import { Trophy, Clock, Target, Medal } from "lucide-react";

type TimeFilter = "all" | "day" | "week" | "month";

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
  const [leaderboard, setLeaderboard] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

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

      // Default to memory game mode since it's the only one
      query = query.eq("mode", "memory");

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
  const remaining = leaderboard.slice(3, 13); // Show 10 more performers (Ranks 4-13) total on right side

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Header & Time Filters Container */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-20 p-4 bg-card border border-primary/20 rounded-2xl md:rounded-full shadow-xl">
        {/* Heading */}
        <div className="flex items-center gap-3 px-4 md:px-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl md:text-2xl font-syne font-bold text-white tracking-wide">
            Leaderboard
          </h2>
        </div>

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
      </div>

      {isLoading ? (
        <div className="py-32 flex justify-center w-full">
          <div className="w-12 h-12 border-t-4 border-primary rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-32 text-center text-text_muted text-lg">
          No records found for these filters.
        </div>
      ) : (
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-8 px-2">
          
          {/* Left Side: 3D Podium */}
          {top3.length > 0 && (
            <div className="w-full lg:w-1/2 flex items-end justify-center gap-1 sm:gap-2 md:gap-4 mt-8 lg:mt-0 h-[360px]">
              {/* Rank 2 (Silver) */}
              {top3[1] && (
                <PodiumPosition 
                  record={top3[1]} 
                  rank={2} 
                  height="h-[160px] sm:h-[190px]" 
                  color="from-[#E2E8F0] to-[#94A3B8]"
                  topColor="bg-[#F8FAFC]"
                  delay={0.1}
                />
              )}
              {/* Rank 1 (Gold) */}
              {top3[0] && (
                <PodiumPosition 
                  record={top3[0]} 
                  rank={1} 
                  height="h-[220px] sm:h-[250px]" 
                  color="from-[#FDE047] to-[#D97706]"
                  topColor="bg-[#FEF08A]"
                  delay={0}
                />
              )}
              {/* Rank 3 (Bronze) */}
              {top3[2] && (
                <PodiumPosition 
                  record={top3[2]} 
                  rank={3} 
                  height="h-[120px] sm:h-[140px]" 
                  color="from-[#FDBA74] to-[#B45309]"
                  topColor="bg-[#FED7AA]"
                  delay={0.2}
                />
              )}
            </div>
          )}

          {/* Right Side: Remaining List (Top 10) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3 pb-12">
            <h3 className="text-sm font-bold text-text_muted uppercase tracking-widest mb-2 px-6">Top Performers</h3>
            <div className="grid grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold text-text_muted uppercase tracking-wider border-b border-white/5">
              <div className="col-span-2 sm:col-span-1 text-center">#</div>
              <div className="col-span-4 sm:col-span-5">Player</div>
              <div className="col-span-2 text-center text-emerald-400">Score</div>
              <div className="col-span-2 text-center text-secondary">Moves</div>
              <div className="col-span-2 sm:col-span-2 text-right text-primary">Time</div>
            </div>
            
            <AnimatePresence>
              {remaining.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-4 bg-card/80 backdrop-blur-md border border-white/5 rounded-2xl items-center hover:bg-white/5 hover:border-white/10 transition-all shadow-lg"
                >
                  <div className="col-span-2 sm:col-span-1 text-center font-mono font-bold text-text_secondary/80">
                    {index + 4}
                  </div>
                  <div className="col-span-4 sm:col-span-5 font-semibold text-white/90 truncate text-sm">
                    {record.users?.name || "Anonymous"}
                  </div>
                  <div className="col-span-2 text-center font-mono text-emerald-400 font-bold text-sm sm:text-base">
                    {record.score}
                  </div>
                  <div className="col-span-2 text-center font-mono text-sm text-text_secondary text-center">
                    {record.moves}
                  </div>
                  <div className="col-span-2 sm:col-span-2 text-right font-mono text-sm text-text_secondary">
                    {record.time_taken > 1000 ? (record.time_taken / 1000).toFixed(1) : record.time_taken}s
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumPosition({ record, rank, height, color, topColor, delay }: { record: GameRecord, rank: number, height: string, color: string, topColor: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 80, damping: 15 }}
      className={`flex flex-col items-center w-[30%] max-w-[160px] relative`}
    >
      {/* Floating 3D Coin/Medal - Reduced space by moving it down closer to pillar */}
      <div className="absolute -top-12 sm:-top-16 z-30 flex justify-center w-full group cursor-default">
        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${color} p-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-300`}>
          <div className="w-full h-full rounded-full border-[3px] sm:border-[4px] border-white/40 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {rank}
            </span>
          </div>
        </div>
      </div>

      {/* 3D Pillar */}
      <div className={`w-full ${height} relative mt-10 sm:mt-12 flex flex-col items-center`}>
        {/* Top Face (Perspective) */}
        <div className={`absolute -top-3 sm:-top-4 left-0 w-full h-6 sm:h-8 ${topColor} rounded-[50%] z-20 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1)]`} />
        
        {/* Front Face (Gradient Base) */}
        <div className={`w-full h-full bg-gradient-to-b ${color} rounded-b-xl sm:rounded-b-2xl z-10 p-2 sm:p-4 shadow-2xl flex flex-col items-center pt-8 sm:pt-14 text-center relative overflow-hidden`}>
          {/* subtle lighting line */}
          <div className="absolute top-0 left-0 w-[2px] h-full bg-white/20 blur-[1px]"></div>
          
          {/* Content */}
          <span className="text-xl sm:text-3xl font-black text-black/90 drop-shadow-sm mb-1">{record.score}</span>
          <span className="text-[10px] sm:text-sm font-bold text-black/80 truncate w-full max-w-[90%] leading-tight">{record.users?.name || "Anon"}</span>
          
          <div className="mt-auto pb-2 flex flex-col items-center gap-0.5 opacity-80">
            <span className="text-[9px] sm:text-[11px] font-semibold text-black/70">{record.moves} moves</span>
            <span className="text-[9px] sm:text-[11px] font-semibold text-black/70">{(record.time_taken/1000).toFixed(2)}s</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
