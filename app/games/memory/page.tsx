import { MemoryGame } from "@/components/games/MemoryGame";

export default function MemoryGamePage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <MemoryGame />
      </div>
    </main>
  );
}
