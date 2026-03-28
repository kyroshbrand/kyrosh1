import { HiTrophy, HiComputerDesktop } from "react-icons/hi2";

export default function GameToppers() {
  return (
    <div className="adm-home">
      <h1 className="flex items-center gap-3"><HiTrophy className="text-primary" /> Game Toppers</h1>
      <div className="adm-placeholder">
        <div className="flex justify-center mb-4">
          <HiComputerDesktop className="text-border opacity-20 w-16 h-16" />
        </div>
        <h3>Coming Soon</h3>
        <p>Game toppers leaderboard will appear here.</p>
      </div>
    </div>
  );
}
