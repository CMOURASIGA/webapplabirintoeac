import Card from "../common/Card";
import { formatSecondsAsClock } from "../../utils/time";

interface PlayerRankHighlightProps {
  position: number | null;
  score: number;
  completed: number;
  timeSeconds: number;
}

export default function PlayerRankHighlight({
  position,
  score,
  completed,
  timeSeconds
}: PlayerRankHighlightProps): JSX.Element {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Seu desempenho</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Posicao</p>
          <p className="text-lg font-bold text-white">{position ? `#${position}` : "-"}</p>
        </div>
        <div>
          <p className="text-slate-400">Pontuacao</p>
          <p className="text-lg font-bold text-white">{score}</p>
        </div>
        <div>
          <p className="text-slate-400">Fases</p>
          <p className="text-lg font-bold text-white">{completed}</p>
        </div>
        <div>
          <p className="text-slate-400">Tempo total</p>
          <p className="text-lg font-bold text-white">{formatSecondsAsClock(timeSeconds)}</p>
        </div>
      </div>
    </Card>
  );
}
