import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import SecondaryButton from "../components/common/SecondaryButton";
import LoadingState from "../components/common/LoadingState";
import RankingList from "../components/ranking/RankingList";
import PlayerRankHighlight from "../components/ranking/PlayerRankHighlight";
import type { RankingEntry } from "../types/player";
import { getRanking } from "../services/rankingService";
import { buildWhatsAppShareUrl } from "../services/shareService";
import { useAppContext } from "../store/AppContext";

export default function RankingScreen(): JSX.Element {
  const navigate = useNavigate();
  const { player } = useAppContext();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRanking(): Promise<void> {
    setLoading(true);
    try {
      const loaded = await getRanking(10);
      setRanking(loaded);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRanking();
  }, []);

  const myPosition = useMemo(() => {
    if (!player) {
      return null;
    }
    const found = ranking.find((entry) => entry.playerId === player.id);
    return found ? found.position : null;
  }, [ranking, player]);

  function sharePosition(): void {
    if (!player) {
      return;
    }
    const message = myPosition
      ? `Estou em #${myPosition} no Ranking EAC com ${player.totalScore} pontos!`
      : `Ja estou jogando o Game EAC! Minha pontuacao atual e ${player.totalScore}.`;
    window.open(buildWhatsAppShareUrl(message), "_blank");
  }

  return (
    <AppShell>
      <AppHeader title="Ranking EAC" showBack />
      <div className="flex flex-1 flex-col gap-4">
        {player ? (
          <PlayerRankHighlight
            position={myPosition}
            score={player.totalScore}
            completed={player.totalCompletedPhases}
            timeSeconds={player.totalTimeSeconds}
          />
        ) : null}
        {loading ? <LoadingState label="Atualizando ranking..." /> : <RankingList ranking={ranking} />}
        <div className="space-y-3">
          <SecondaryButton label="Atualizar ranking" onClick={() => void loadRanking()} />
          <SecondaryButton label="Compartilhar posicao" onClick={sharePosition} />
          <SecondaryButton label="Voltar ao inicio" onClick={() => navigate(player ? "/home" : "/")} />
        </div>
      </div>
    </AppShell>
  );
}
