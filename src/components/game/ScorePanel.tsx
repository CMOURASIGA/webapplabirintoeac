import Card from "../common/Card";

interface ScorePanelProps {
  totalPoints: number;
  currentAttempts: number;
  elapsedTime: string;
}

export default function ScorePanel({
  totalPoints,
  currentAttempts,
  elapsedTime
}: ScorePanelProps): JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className="p-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Pontos</p>
        <p className="text-lg font-bold text-white">{totalPoints}</p>
      </Card>
      <Card className="p-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Tentativas</p>
        <p className="text-lg font-bold text-white">{currentAttempts}</p>
      </Card>
      <Card className="p-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Tempo</p>
        <p className="text-lg font-bold text-white">{elapsedTime}</p>
      </Card>
    </div>
  );
}
