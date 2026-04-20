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
  const wordsPerPhase = config.wordsPerPhase;
  const currentPhaseToPlay = Math.min(player.currentPhase, totalPhases);
  const currentWordToPlay = Math.max(1, Math.min(player.currentWordInPhase || 1, wordsPerPhase));
  const completedJourney = player.currentPhase > totalPhases;
  const allPhases = Array.from({ length: totalPhases }, (_, index) => index + 1);

  return (
    <AppShell>
      <AppHeader
        title={`Fase ${currentPhaseToPlay}/${totalPhases}`}
        rightSlot={
          <button
            onClick={() => navigate("/help")}
            className="rounded-xl border border-sky-200/40 bg-sky-500/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-sky-50"
          >
            Ajuda
          </button>
        }
      />
      <div className="flex flex-1 flex-col gap-4">
        <Card className="space-y-2 border-emerald-200/20 bg-gradient-to-r from-emerald-500/10 via-slate-900/70 to-sky-500/10">
          <p className="text-lg font-bold text-white">Ola, {player.nickname}</p>
          <p className="text-sm text-slate-300">Pontuacao total: {player.totalScore}</p>
          <p className="text-sm text-slate-300">
            Ranking atual: {loadingRanking ? "..." : myPosition ? `#${myPosition}` : "-"}
          </p>
          <p className="text-sm text-slate-300">Fases concluidas: {player.totalCompletedPhases}</p>
          <p className="text-sm text-slate-300">
            Palavra atual: {completedJourney ? wordsPerPhase : currentWordToPlay}/{wordsPerPhase}
          </p>
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">
            Missao: manter sequencia de acertos e subir no ranking.
          </p>
        </Card>

        <Card>
          <PhaseProgress current={Math.min(player.totalCompletedPhases, totalPhases)} total={totalPhases} />
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200">Mapa de fases</p>
          <div className="grid grid-cols-5 gap-2">
            {allPhases.map((phaseNumber) => {
              const completed = completedJourney || phaseNumber < player.currentPhase;
              const current = !completedJourney && phaseNumber === currentPhaseToPlay;
              const locked = !completed && !current;

              const baseClass =
                "rounded-xl border px-2 py-2 text-xs font-bold transition";
              const styleClass = completed
                ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-100"
                : current
                  ? "border-sky-300/60 bg-sky-500/30 text-sky-50"
                  : "border-rose-300/20 bg-rose-500/10 text-rose-100/55";

              return (
                <button
                  key={phaseNumber}
                  disabled={locked}
                  onClick={() => {
                    if (current) {
                      navigate(`/game/${phaseNumber}?word=${currentWordToPlay}`);
                      return;
                    }
                    navigate(`/game/${phaseNumber}?word=1`);
                  }}
                  className={`${baseClass} ${styleClass}`}
                >
                  {phaseNumber}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-300">
            Verde: concluida. Azul: em andamento. Vermelho: pendente.
          </p>
        </Card>

        <div className="space-y-3">
          {completedJourney ? (
            <PrimaryButton
              label={`Jogar novamente fase ${totalPhases}`}
              onClick={() => navigate(`/game/${totalPhases}?word=1`)}
            />
          ) : (
            <PrimaryButton
              label={`Continuar fase atual (palavra ${currentWordToPlay}/${wordsPerPhase})`}
              onClick={() => navigate(`/game/${currentPhaseToPlay}?word=${currentWordToPlay}`)}
            />
          )}
          {completedJourney ? (
            <SecondaryButton label="Ver jornada concluida" onClick={() => navigate("/final")} />
          ) : null}
          <SecondaryButton label="Ver ranking" onClick={() => navigate("/ranking")} />
          <SecondaryButton label="Ajuda do jogo" onClick={() => navigate("/help")} />
          <SecondaryButton label="Compartilhar jogo" onClick={() => navigate("/share")} />
          <SecondaryButton label="Trocar jogador" onClick={logoutPlayer} />
        </div>
      </div>
    </AppShell>
  );
}
