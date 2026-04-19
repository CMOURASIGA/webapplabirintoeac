import Card from "../common/Card";
import type { RankingEntry } from "../../types/player";

export default function RankingList({ ranking }: { ranking: RankingEntry[] }): JSX.Element {
  if (ranking.length === 0) {
    return <Card>Nenhum jogador no ranking ainda.</Card>;
  }

  return (
    <Card className="space-y-2">
      {ranking.map((entry) => (
        <div
          key={entry.playerId}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        >
          <div>
            <p className="text-sm font-semibold text-white">
              {entry.position}. {entry.nickname}
            </p>
            <p className="text-xs text-slate-300">{entry.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-sky-200">{entry.totalScore} pts</p>
            <p className="text-xs text-slate-400">{entry.totalCompletedPhases} fases</p>
          </div>
        </div>
      ))}
    </Card>
  );
}
