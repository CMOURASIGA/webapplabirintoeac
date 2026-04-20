import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import LogoBlock from "../components/common/LogoBlock";
import ScreenTitle from "../components/common/ScreenTitle";
import Card from "../components/common/Card";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import type { RankingEntry } from "../types/player";
import { getRanking } from "../services/rankingService";
import { useAppContext } from "../store/AppContext";

export default function FinalJourneyScreen(): JSX.Element {
  const navigate = useNavigate();
  const { player, config, booting } = useAppContext();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    async function loadRanking(): Promise<void> {
      const loaded = await getRanking(20);
      setRanking(loaded);
    }

    void loadRanking();
  }, []);

  const myPosition = useMemo(() => {
    if (!player) {
      return null;
    }
    const found = ranking.find((item) => item.playerId === player.id);
    return found?.position ?? null;
  }, [player, ranking]);

  if (booting) {
    return (
      <AppShell>
        <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-6 text-slate-200">
          Carregando jornada...
        </div>
      </AppShell>
    );
  }

  if (!player) {
    return <Navigate to="/" replace />;
  }

  function handlePlayAgain(): void {
    const totalPhases = config?.totalPhases ?? 20;
    const replayPhase = Math.min(Math.max((player?.currentPhase ?? 1) - 1, 1), totalPhases);
    navigate(`/game/${replayPhase}?word=1`);
  }

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-2rem)] flex-col justify-between py-6">
        <LogoBlock />

        <div className="space-y-4 text-center">
          <ScreenTitle title="Jornada concluida" subtitle="Voce terminou todas as fases desta edicao." />
          <Card className="space-y-2">
            <p className="text-sm text-slate-200">Pontuacao final: {player.totalScore}</p>
            <p className="text-sm text-slate-200">Sua posicao: {myPosition ? `#${myPosition}` : "-"}</p>
          </Card>
        </div>

        <div className="space-y-3">
          <PrimaryButton label="Ver ranking" onClick={() => navigate("/ranking")} />
          <SecondaryButton label="Compartilhar resultado" onClick={() => navigate("/share")} />
          <SecondaryButton label="Jogar novamente" onClick={handlePlayAgain} />
        </div>
      </div>
    </AppShell>
  );
}
