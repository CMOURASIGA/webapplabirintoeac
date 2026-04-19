import { Navigate, useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import ResultCard from "../components/game/ResultCard";
import ReflectionCard from "../components/game/ReflectionCard";
import { logEvent } from "../services/gameService";
import { useAppContext } from "../store/AppContext";

export default function ResultScreen(): JSX.Element {
  const navigate = useNavigate();
  const { player, lastResult } = useAppContext();

  if (!player) {
    return <Navigate to="/" replace />;
  }

  if (!lastResult) {
    return <Navigate to="/home" replace />;
  }

  const activePlayer = player;
  const activeResult = lastResult;

  async function handleReflectLater(): Promise<void> {
    await logEvent({
      event: "reflect_later",
      playerId: activePlayer.id,
      phaseId: activeResult.result.phaseId
    });
    navigate("/home");
  }

  return (
    <AppShell>
      <AppHeader title="Resultado da fase" />
      <div className="flex flex-1 flex-col gap-4">
        <ResultCard
          word={activeResult.result.word}
          score={activeResult.result.score}
          attempts={activeResult.result.attempts}
          timeSeconds={activeResult.result.timeSeconds}
        />
        <ReflectionCard message={activeResult.result.message} reflection={activeResult.result.reflection} />
        <div className="space-y-3">
          <PrimaryButton
            label={activeResult.journeyCompleted ? "Concluir jornada" : "Proxima fase"}
            onClick={() =>
              navigate(activeResult.journeyCompleted ? "/final" : `/game/${activeResult.nextPhase}`)
            }
          />
          <SecondaryButton label="Compartilhar" onClick={() => navigate("/share")} />
          <SecondaryButton label="Refletir depois" onClick={() => void handleReflectLater()} />
        </div>
      </div>
    </AppShell>
  );
}
