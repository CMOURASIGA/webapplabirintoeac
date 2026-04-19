import Card from "../common/Card";
import { formatSecondsAsClock } from "../../utils/time";

interface ResultCardProps {
  word: string;
  score: number;
  attempts: number;
  timeSeconds: number;
}

export default function ResultCard({
  word,
  score,
  attempts,
  timeSeconds
}: ResultCardProps): JSX.Element {
  return (
    <Card>
      <p className="text-sm font-semibold text-green-300">Fase concluida</p>
      <h3 className="mt-1 text-2xl font-extrabold tracking-wide text-white">{word}</h3>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-white/5 p-2">
          <p className="text-xs uppercase text-slate-400">Pontos</p>
          <p className="font-bold text-white">+{score}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-2">
          <p className="text-xs uppercase text-slate-400">Tempo</p>
          <p className="font-bold text-white">{formatSecondsAsClock(timeSeconds)}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-2">
          <p className="text-xs uppercase text-slate-400">Tentativas</p>
          <p className="font-bold text-white">{attempts}</p>
        </div>
      </div>
    </Card>
  );
}
