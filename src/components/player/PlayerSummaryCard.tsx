import Card from "../common/Card";
import type { Player } from "../../types/player";

export default function PlayerSummaryCard({ player }: { player: Player }): JSX.Element {
  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold text-white">{player.name}</p>
      <p className="text-sm text-slate-200">Apelido: {player.nickname}</p>
      <p className="text-sm text-slate-200">Fase atual: {player.currentPhase}</p>
      <p className="text-sm text-slate-200">Pontuacao: {player.totalScore}</p>
    </Card>
  );
}
