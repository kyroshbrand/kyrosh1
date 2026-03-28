"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/GlobalUI";
import { RotateCcw, Clock, Target, Trophy, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Card {
  id: string;
  value: number;
  flipped: boolean;
  matched: boolean;
}

export function MemoryGame() {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [cards, setCards] = useState<Card[]>([]);
  const [firstCard, setFirstCard] = useState<Card | null>(null);
  const [secondCard, setSecondCard] = useState<Card | null>(null);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeMs, setTimeMs] = useState(0); // in milliseconds
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Initialize Game
  const initializeGame = () => {
    const cardValues = [...Array(8).keys()].map(n => n + 1);
    const deck = [...cardValues, ...cardValues]
      .sort(() => Math.random() - 0.5)
      .map((value) => ({
        id: Math.random().toString(36).substring(7),
        value,
        flipped: false,
        matched: false,
      }));
    
    setCards(deck);
    setFirstCard(null);
    setSecondCard(null);
    setMoves(0);
    setIsLocked(false);
    setIsPlaying(true);
    setStartTime(Date.now());
    setTimeMs(0);
    setFinalScore(0);
    setIsFinished(false);
  };

  useEffect(() => {
    if (user) {
      initializeGame();
    }
  }, [user]);

  // Timer
  useEffect(() => {
    let animationFrame: number;
    if (isPlaying && startTime && !isFinished) {
      const update = () => {
        setTimeMs(Date.now() - startTime);
        animationFrame = requestAnimationFrame(update);
      };
      animationFrame = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, startTime, isFinished]);

  // Handlers
  const handleCardClick = (clickedCard: Card) => {
    if (!user || isLocked || clickedCard.flipped || clickedCard.matched || isFinished) return;

    // Flip the card visually immediately
    setCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, flipped: true } : c));

    if (!firstCard) {
      setFirstCard(clickedCard);
      return;
    }

    setSecondCard(clickedCard);
    setIsLocked(true);
    setMoves(m => m + 1);

    // Check Match
    if (firstCard.value === clickedCard.value) {
      setCards(prev => prev.map(c => 
        c.value === clickedCard.value ? { ...c, matched: true } : c
      ));
      resetTurn();
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          (c.id === firstCard.id || c.id === clickedCard.id) ? { ...c, flipped: false } : c
        ));
        resetTurn();
      }, 800);
    }
  };

  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setIsLocked(false);
  };

  // Check Game End
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched) && !isFinished) {
      setIsFinished(true);
      const score = Math.max(0, Math.round(100000 / (moves + (timeMs / 1000))));
      setFinalScore(score);
      if (user) {
        saveGame(score);
      }
    }
  }, [cards, isFinished]);

  const saveGame = async (scoreToSave: number) => {
    if (!supabase || !user) return;
    try {
      await supabase.from("games").insert({
        user_id: user.id,
        moves,
        time_taken: timeMs, // saving exact ms to db
        score: scoreToSave,
        mode: "memory"
      });
    } catch (e) {
      console.error("Failed to save game", e);
    }
  };

  if (!user) {
    return (
      <div className="text-center space-y-4 py-20">
        <h2 className="text-2xl font-bold text-white">Login Required</h2>
        <p className="text-text_secondary">You must be logged in to play.</p>
        <button 
          onClick={openAuthModal} 
          className="inline-block bg-primary text-white font-sans font-medium px-8 py-3 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-primary/25"
        >
          Login / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between bg-card border border-primary/20 rounded-2xl p-4 shadow-xl">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-text_secondary hover:text-white transition-colors cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1 sm:gap-2 text-text_secondary">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-mono text-sm sm:text-xl w-14 sm:w-20 text-right">{(timeMs / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-text_secondary">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            <span className="font-mono text-sm sm:text-xl">{moves} moves</span>
          </div>
        </div>

        <button 
          onClick={initializeGame}
          className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Restart Game"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 perspective-1000 w-full max-w-md md:max-w-4xl mx-auto px-2">
        {cards.map(card => (
          <motion.div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="relative w-full aspect-[3/4] cursor-pointer"
            whileHover={{ scale: card.flipped ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              initial={false}
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
              className="w-full h-full relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front (Hidden) */}
              <div 
                className="absolute w-full h-full backface-hidden bg-gradient-to-br from-card to-[#15151a] border border-primary/20 rounded-xl shadow-lg flex items-center justify-center pointer-events-none"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="w-8 h-8 rounded-full border-2 border-primary/30 opacity-50" />
              </div>

              {/* Back (Revealed) */}
              <div 
                className={`absolute w-full h-full backface-hidden rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold border-2 transition-all duration-300 pointer-events-none ${
                   card.matched 
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                    : "bg-primary/10 border-primary/40 text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                }`}
                style={{ 
                  backfaceVisibility: "hidden", 
                  transform: "rotateY(180deg)" 
                }}
              >
                {card.value}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Game Over State Modal */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-gradient-to-b from-card to-background border border-primary/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] flex flex-col items-center text-center gap-6 relative"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]">
                <Trophy className="w-8 h-8" />
              </div>
              
              <div>
                <h2 className="text-3xl font-syne font-bold text-white mb-2">Congratulations!</h2>
                <p className="text-text_secondary">You matched all pairs perfectly.</p>
              </div>
              
              <div className="flex gap-6 sm:gap-8 justify-center w-full my-2 bg-surface p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs text-text_muted uppercase tracking-wider font-bold">Time</span>
                  <span className="text-xl sm:text-2xl font-mono text-primary font-bold">{(timeMs / 1000).toFixed(2)}s</span>
                </div>
                <div className="w-px bg-border"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs text-text_muted uppercase tracking-wider font-bold">Moves</span>
                  <span className="text-xl sm:text-2xl font-mono text-secondary font-bold">{moves}</span>
                </div>
                <div className="w-px bg-border"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs text-text_muted uppercase tracking-wider font-bold">Score</span>
                  <span className="text-xl sm:text-2xl font-mono text-emerald-400 font-bold">{finalScore}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mt-4">
                <Button onClick={initializeGame} variant="primary" className="px-10 py-3 text-sm sm:text-base">
                  Play Again
                </Button>
                <Button 
                  onClick={() => router.push('/games')} 
                  variant="outline" 
                  className="px-10 py-3 border border-white/10 hover:bg-white/5 text-white text-sm sm:text-base"
                >
                  Leaderboard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
