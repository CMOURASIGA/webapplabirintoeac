import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import BottomActions from "../components/layout/BottomActions";
import Card from "../components/common/Card";
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

interface PhaseChallenge {
  trapKeys: Set<string>;
  maxSteps: number;
  targetSeconds: number;
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeGrid(rawGrid: unknown): string[][] {
  const parsed = parseMaybeJson(rawGrid);

  if (Array.isArray(parsed)) {
    return parsed
      .filter((row): row is unknown[] => Array.isArray(row))
      .map((row) => row.map((cell) => String(cell ?? "").toUpperCase()));
  }

  if (parsed && typeof parsed === "object") {
    const entries = Object.entries(parsed as Record<string, unknown>)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map((entry) => entry[1]);
    if (entries.every((row) => Array.isArray(row))) {
      return (entries as unknown[][]).map((row) =>
        row.map((cell) => String(cell ?? "").toUpperCase())
      );
    }
  }

  return [];
}

function normalizeCoord(rawCoord: unknown, fallback: Coord): Coord {
  const parsed = parseMaybeJson(rawCoord);
  if (!parsed || typeof parsed !== "object") {
    return fallback;
  }
  const maybe = parsed as { row?: unknown; col?: unknown };
  const row = Number(maybe.row);
  const col = Number(maybe.col);
  if (Number.isNaN(row) || Number.isNaN(col)) {
    return fallback;
  }
  return { row, col };
}

function listPhaseCells(phase: MazePhase): Coord[] {
  const cells: Coord[] = [];
  for (let row = 0; row < phase.grid.length; row += 1) {
    for (let col = 0; col < (phase.grid[row]?.length ?? 0); col += 1) {
      cells.push({ row, col });
    }
  }
  return cells;
}

function buildPhaseChallenge(phase: MazePhase): PhaseChallenge {
  let trapCount = 1;
  if (phase.id >= 6) {
    trapCount = 2;
  }
  if (phase.id >= 11) {
    trapCount = 3;
  }
  if (phase.id >= 16) {
    trapCount = 4;
  }
  if (phase.wordOrder >= 4) {
    trapCount += 1;
  }
  const wordLetters = new Set(phase.word.split(""));
  const allCells = listPhaseCells(phase).filter(
    (coord) => !isSameCoord(coord, phase.start) && !isSameCoord(coord, phase.end)
  );

  let trapCandidates = allCells.filter((coord) => !wordLetters.has(phase.grid[coord.row][coord.col]));
  if (trapCandidates.length < trapCount) {
    trapCandidates = allCells;
  }

  const chosenTrapKeys = new Set<string>();
  const mutableCandidates = [...trapCandidates];
  let seed = phase.id * 11 + 3;

  for (let index = 0; index < trapCount && mutableCandidates.length > 0; index += 1) {
    const pickIndex = seed % mutableCandidates.length;
    const picked = mutableCandidates.splice(pickIndex, 1)[0];
    if (picked) {
      chosenTrapKeys.add(coordToKey(picked));
    }
    seed = seed * 7 + 5;
  }

  return {
    trapKeys: chosenTrapKeys,
    maxSteps: phase.word.length + (phase.id <= 5 ? 2 : phase.id <= 10 ? 1 : 0) + (phase.wordOrder <= 2 ? 1 : 0),
    targetSeconds: Math.max(20, 56 - phase.id - phase.wordOrder)
  };
}

export default function GameScreen(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { player, setPlayer, setLastResult, booting } = useAppContext();
  const [phase, setPhase] = useState<MazePhase | null>(null);
  const [totalPhases, setTotalPhases] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [attempts, setAttempts] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [processingSeconds, setProcessingSeconds] = useState(0);
  const [path, setPath] = useState<Coord[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const phaseId = useMemo(() => {
    const parsed = Number(params.phaseId);
    if (Number.isNaN(parsed) || parsed < 1) {
      return player?.currentPhase ?? 1;
    }
    return parsed;
  }, [params.phaseId, player?.currentPhase]);

  const wordOrderToPlay = useMemo(() => {
    const fromQuery = Number(searchParams.get("word"));
    if (!Number.isNaN(fromQuery) && fromQuery >= 1) {
      return fromQuery;
    }
    if (player && phaseId === player.currentPhase) {
      return Math.max(1, player.currentWordInPhase || 1);
    }
    return 1;
  }, [searchParams, player, phaseId]);

  const blockedNotice = useMemo(() => {
    const state = (location.state ?? null) as { blockedNotice?: string } | null;
    return state?.blockedNotice ?? "";
  }, [location.state]);

  const challenge = useMemo(() => {
    if (!phase) {
      return null;
    }
    return buildPhaseChallenge(phase);
  }, [phase]);

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
    let interval: number | undefined;
    if (submitting) {
      setProcessingSeconds(0);
      interval = window.setInterval(() => {
        setProcessingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setProcessingSeconds(0);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [submitting]);

  useEffect(() => {
    async function loadPhase(): Promise<void> {
      if (player) {
        const allowedPhase = Math.max(1, player.currentPhase || 1);
        const allowedWord = Math.max(1, player.currentWordInPhase || 1);
        const tryingFuturePhase = phaseId > allowedPhase;
        const tryingFutureWordInCurrentPhase = phaseId === allowedPhase && wordOrderToPlay > allowedWord;

        if (tryingFuturePhase || tryingFutureWordInCurrentPhase) {
          navigate(`/game/${allowedPhase}?word=${allowedWord}`, {
            replace: true,
            state: {
              blockedNotice:
                "Fase bloqueada: conclua a fase/palavra atual por completo para liberar a proxima."
            }
          });
          return;
        }
      }

      setLoading(true);
      setError("");
      try {
        const response = await getPhase(phaseId, wordOrderToPlay, player?.id);
        const safeGrid = normalizeGrid(response.phase.grid);
        if (safeGrid.length === 0 || safeGrid.some((row) => row.length === 0)) {
          throw new Error("Formato de labirinto invalido recebido da API.");
        }

        const fallbackEnd = {
          row: safeGrid.length - 1,
          col: Math.max((safeGrid[safeGrid.length - 1]?.length ?? 1) - 1, 0)
        };

        const loadedPhase: MazePhase = {
          ...response.phase,
          grid: safeGrid,
          start: normalizeCoord(response.phase.start, { row: 0, col: 0 }),
          end: normalizeCoord(response.phase.end, fallbackEnd),
          wordOrder: Number(response.phase.wordOrder || wordOrderToPlay || 1),
          wordsPerPhase: Number(response.phase.wordsPerPhase || response.wordsPerPhase || 5)
        };
        setTotalPhases(Number(response.totalPhases || 20));
        setPhase(loadedPhase);
        setPath([]);
        setElapsedSeconds(0);
        setAttempts(1);
        const baseMessage = `Palavra ${loadedPhase.wordOrder}/${loadedPhase.wordsPerPhase}. Toque na celula INICIO para comecar.`;
        setStatusMessage(blockedNotice ? `${blockedNotice} ${baseMessage}` : baseMessage);
      } catch (phaseError) {
        setError(phaseError instanceof Error ? phaseError.message : "Falha ao carregar fase.");
      } finally {
        setLoading(false);
      }
    }

    void loadPhase();
  }, [phaseId, wordOrderToPlay, navigate, player, blockedNotice]);

  if (booting) {
    return (
      <AppShell>
        <LoadingState label="Preparando seu jogo..." emphasis />
      </AppShell>
    );
  }

  if (!player) {
    return <Navigate to="/" replace />;
  }

  if (loading || !phase) {
    return (
      <AppShell>
        <LoadingState label="Carregando fase..." emphasis />
      </AppShell>
    );
  }

  if (!challenge) {
    return (
      <AppShell>
        <LoadingState label="Preparando desafio..." emphasis />
      </AppShell>
    );
  }

  const activePlayer = player;
  const activePhase = phase;
  const activeChallenge = challenge;
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
        wordOrder: activePhase.wordOrder || 1,
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
        setStatusMessage("Comece pela celula INICIO.");
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

    if (activeChallenge.trapKeys.has(targetKey)) {
      setStatusMessage("Movimento invalido. Tentativa reiniciada.");
      setTimeout(() => resetPath(true), 280);
      return;
    }

    const nextPath = [...path, coord];

    if (nextPath.length > activeChallenge.maxSteps) {
      setStatusMessage(`Passos excedidos. O limite desta fase e ${activeChallenge.maxSteps}.`);
      setTimeout(() => resetPath(true), 280);
      return;
    }

    setPath(nextPath);
    setStatusMessage("");

    if (isSameCoord(coord, activePhase.end)) {
      void finishPhase(nextPath);
      return;
    }

    if (nextPath.length === activeChallenge.maxSteps) {
      setStatusMessage("Limite de passos atingido antes da chegada.");
      setTimeout(() => resetPath(true), 280);
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
      <AppHeader
        title={`Fase ${activePhase.id}/${totalPhases} - Palavra ${activePhase.wordOrder}/${activePhase.wordsPerPhase}`}
        rightSlot={
          <button
            onClick={() => navigate("/help")}
            className="rounded-xl border border-sky-200/40 bg-sky-500/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-sky-50"
          >
            Ajuda
          </button>
        }
      />
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <Card className="border-emerald-300/40 bg-emerald-500/10">
            <p className="text-center text-xl font-extrabold tracking-wide text-emerald-100">
              Voce esta na fase {activePhase.id} de {totalPhases}
            </p>
          </Card>
          {submitting ? (
            <Card className="border-sky-300/40 bg-sky-500/15">
              <p className="text-center text-2xl font-extrabold tracking-wide text-sky-50">
                Processando resultado... {processingSeconds}s
              </p>
            </Card>
          ) : null}
          <ScorePanel
            totalPoints={activePlayer.totalScore}
            currentAttempts={attempts}
            elapsedTime={formatSecondsAsClock(elapsedSeconds)}
          />
          <Card className="space-y-2 border-amber-200/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Desafio da fase</p>
            <p className="text-sm text-slate-100">
              Chegue ao <strong>FIM</strong> com a palavra correta em ate{" "}
              <strong>{activeChallenge.maxSteps} passos</strong>.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/10 px-2 py-2">
                <p className="text-slate-300">Passos</p>
                <p className="font-bold text-white">
                  {path.length}/{activeChallenge.maxSteps}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-2 py-2">
                <p className="text-slate-300">Tempo alvo</p>
                <p className="font-bold text-white">{formatSecondsAsClock(activeChallenge.targetSeconds)}</p>
              </div>
              <div className="rounded-xl bg-white/10 px-2 py-2">
                <p className="text-slate-300">Dificuldade</p>
                <p className="font-bold text-white">
                  {activePhase.id <= 5
                    ? "Normal"
                    : activePhase.id <= 10
                      ? "Media"
                      : activePhase.id <= 15
                        ? "Alta"
                        : "Extrema"}
                </p>
              </div>
            </div>
          </Card>
          <Card className="space-y-2 border-sky-300/30 bg-sky-500/10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Significado da palavra</p>
            <p className="text-sm text-slate-100">{activePhase.message}</p>
          </Card>
          <WordProgress targetWord={activePhase.word} currentWord={formedWord} />
          <Card className="border-slate-300/20 bg-slate-950/55 p-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-slate-200">
              <span className="rounded-lg border border-emerald-300/50 bg-emerald-500/20 px-2 py-1">Inicio</span>
              <span className="rounded-lg border border-yellow-300/50 bg-yellow-500/20 px-2 py-1">Fim</span>
              <span className="rounded-lg border border-sky-300/50 bg-sky-500/20 px-2 py-1">
                Perigos ocultos ativos
              </span>
            </div>
          </Card>
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
