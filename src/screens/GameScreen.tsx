import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import BottomActions from "../components/layout/BottomActions";
import SecondaryButton from "../components/common/SecondaryButton";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import ScorePanel from "../components/game/ScorePanel";
import WordProgress from "../components/game/WordProgress";
import MazeGrid from "../components/game/MazeGrid";
import type { Coord, MazePhase } from "../types/game";
import { getPhase, submitResult } from "../services/gameService";
import { useAppContext } from "../store/AppContext";
import { coordToKey, getAvailableMoves, isAdjacent, isSameCoord, pathToWord } from "../utils/maze";
import { formatSecondsAsClock } from "../utils/time";

export default function GameScreen(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const { player, setPlayer, setLastResult } = useAppContext();
  const [phase, setPhase] = useState<MazePhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [attempts, setAttempts] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [path, setPath] = useState<Coord[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const phaseId = useMemo(() => {
    const parsed = Number(params.phaseId);
    if (Number.isNaN(parsed) || parsed < 1) {
      return player?.currentPhase ?? 1;
    }
    return parsed;
  }, [params.phaseId, player?.currentPhase]);

  useEffect(() => {
    let interval: number | undefined;
    if (!loading && phase && !submitting) {
      interval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [loading, phase, submitting]);

  useEffect(() => {
    async function loadPhase(): Promise<void> {
      setLoading(true);
      setError("");
      try {
        const response = await getPhase(phaseId);
        setPhase(response.phase);
        setPath([]);
        setElapsedSeconds(0);
        setAttempts(1);
        setStatusMessage("Toque na celula S para iniciar.");
      } catch (phaseError) {
        setError(phaseError instanceof Error ? phaseError.message : "Falha ao carregar fase.");
      } finally {
        setLoading(false);
      }
    }

    void loadPhase();
  }, [phaseId]);

  if (!player) {
    return <Navigate to="/" replace />;
  }

  if (loading || !phase) {
    return (
      <AppShell>
        <LoadingState label="Carregando fase..." />
      </AppShell>
    );
  }

  const activePlayer = player;
  const activePhase = phase;
  const formedWord = pathToWord(activePhase.grid, path);

  function resetPath(countAsError: boolean): void {
    setPath([]);
    if (countAsError) {
      setAttempts((prev) => prev + 1);
    }
  }

  async function finishPhase(finalPath: Coord[]): Promise<void> {
    const finalWord = pathToWord(activePhase.grid, finalPath);
    const correct = finalWord === activePhase.word;

    if (!correct) {
      setStatusMessage("Palavra invalida. Tente novamente.");
      setTimeout(() => resetPath(true), 350);
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitResult({
        playerId: activePlayer.id,
        phaseId: activePhase.id,
        wordFormed: finalWord,
        attempts,
        timeSeconds: elapsedSeconds,
        correct: true
      });
      setLastResult(response);
      setPlayer(response.player);
      navigate("/result");
    } catch (submitError) {
      setStatusMessage(submitError instanceof Error ? submitError.message : "Falha ao validar resultado.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCellClick(coord: Coord): void {
    if (submitting) {
      return;
    }

    if (path.length === 0) {
      if (!isSameCoord(coord, activePhase.start)) {
        setStatusMessage("Comece pela celula S.");
        return;
      }
      setPath([coord]);
      setStatusMessage("Boa! Continue montando a palavra.");
      return;
    }

    const last = path[path.length - 1];
    if (!isAdjacent(last, coord)) {
      setStatusMessage("Movimento invalido. Use apenas celulas adjacentes.");
      return;
    }

    const targetKey = coordToKey(coord);
    const visited = new Set(path.map((item) => coordToKey(item)));
    if (visited.has(targetKey)) {
      setStatusMessage("Celula ja utilizada nesta tentativa.");
      return;
    }

    const nextPath = [...path, coord];
    setPath(nextPath);
    setStatusMessage("");

    if (isSameCoord(coord, activePhase.end)) {
      void finishPhase(nextPath);
      return;
    }

    const nextVisited = new Set(nextPath.map((item) => coordToKey(item)));
    const availableMoves = getAvailableMoves(activePhase.grid, coord, nextVisited);
    if (availableMoves.length === 0) {
      setStatusMessage("Caminho sem saida. Reiniciando tentativa.");
      setTimeout(() => resetPath(true), 350);
    }
  }

  function restartManually(): void {
    if (path.length > 0) {
      setAttempts((prev) => prev + 1);
    }
    setPath([]);
    setStatusMessage("Tentativa reiniciada.");
  }

  return (
    <AppShell>
      <AppHeader title={`Fase ${activePhase.id}`} rightSlot={`Meta: ${activePhase.word.length} letras`} />
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <ScorePanel
            totalPoints={activePlayer.totalScore}
            currentAttempts={attempts}
            elapsedTime={formatSecondsAsClock(elapsedSeconds)}
          />
          <WordProgress targetWord={activePhase.word} currentWord={formedWord} />
          {statusMessage ? <p className="text-center text-sm text-slate-200">{statusMessage}</p> : null}
          {error ? <ErrorState message={error} /> : null}
        </div>

        <div className="flex flex-1 items-center justify-center">
          <MazeGrid
            grid={activePhase.grid}
            path={path}
            start={activePhase.start}
            end={activePhase.end}
            onCellClick={handleCellClick}
          />
        </div>

        <BottomActions>
          <SecondaryButton label="Reiniciar" onClick={restartManually} />
          <SecondaryButton label="Voltar" onClick={() => navigate("/home")} />
        </BottomActions>
      </div>
    </AppShell>
  );
}
