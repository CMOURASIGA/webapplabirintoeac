import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import Card from "../components/common/Card";
import LoadingState from "../components/common/LoadingState";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import PhaseProgress from "../components/game/PhaseProgress";
import type { RankingEntry } from "../types/player";
import { getRanking } from "../services/rankingService";
import { useAppContext } from "../store/AppContext";

export default function HomeScreen(): JSX.Element {
  const navigate = useNavigate();
  const { player, config, logoutPlayer } = useAppContext();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  useEffect(() => {
    async function loadRanking(): Promise<void> {
      setLoadingRanking(true);
      try {
        const loaded = await getRanking(20);
        setRanking(loaded);
      } finally {
        setLoadingRanking(false);
      }
    }

    void loadRanking();
  }, []);

  const myPosition = useMemo(() => {
    if (!player) {
      return null;
    }
    const found = ranking.find((entry) => entry.playerId === player.id);
    return found ? found.position : null;
  }, [ranking, player]);

  if (!player) {
    return <Navigate to="/" replace />;
  }

  if (!config) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  const totalPhases = config.totalPhases;
  const currentPhaseToPlay = Math.min(player.currentPhase, totalPhases);
  const completedJourney = player.currentPhase > totalPhases;

  return (
    <AppShell>
      <AppHeader title={`Fase ${currentPhaseToPlay}/${totalPhases}`} />
      <div className="flex flex-1 flex-col gap-4">
        <Card className="space-y-1">
          <p className="text-lg font-bold text-white">Ola, {player.nickname}</p>
          <p className="text-sm text-slate-300">Pontuacao total: {player.totalScore}</p>
          <p className="text-sm text-slate-300">
            Ranking atual: {loadingRanking ? "..." : myPosition ? `#${myPosition}` : "-"}
          </p>
          <p className="text-sm text-slate-300">Fases concluidas: {player.totalCompletedPhases}</p>
        </Card>

        <Card>
          <PhaseProgress current={Math.min(player.totalCompletedPhases, totalPhases)} total={totalPhases} />
        </Card>

        <div className="space-y-3">
          {completedJourney ? (
            <PrimaryButton label="Ver jornada concluida" onClick={() => navigate("/final")} />
          ) : (
            <PrimaryButton label="Continuar fase atual" onClick={() => navigate(`/game/${currentPhaseToPlay}`)} />
          )}
          <SecondaryButton label="Ver ranking" onClick={() => navigate("/ranking")} />
          <SecondaryButton label="Compartilhar jogo" onClick={() => navigate("/share")} />
          <SecondaryButton label="Trocar jogador" onClick={logoutPlayer} />
        </div>
      </div>
    </AppShell>
  );
}
