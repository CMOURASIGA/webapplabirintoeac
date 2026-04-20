import { defaultConfig, defaultPhases } from "../data/defaultData";
import type { ApiAction, ApiActionMap, ApiEnvelope, LogEventRequest } from "../types/api";
import type { MazePhase, PhaseResult, SubmitResultRequest } from "../types/game";
import type { Player, PlayerInput, RankingEntry } from "../types/player";
import { normalizePhone } from "../utils/phone";
import { calculatePhaseScore } from "../utils/score";
import { readStorage, STORAGE_KEYS, writeStorage } from "./storage";

interface LogEvent {
  event: string;
  playerId?: string;
  phaseId?: number;
  metadata?: string;
  createdAt: string;
}

interface MockDb {
  config: typeof defaultConfig;
  phases: typeof defaultPhases;
  players: Player[];
  results: PhaseResult[];
  logs: LogEvent[];
  nextPlayerSeq: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

function clone<TValue>(value: TValue): TValue {
  return JSON.parse(JSON.stringify(value)) as TValue;
}

function createInitialDb(): MockDb {
  return {
    config: clone(defaultConfig),
    phases: clone(defaultPhases),
    players: [],
    results: [],
    logs: [],
    nextPlayerSeq: 1
  };
}

function getDb(): MockDb {
  const existing = readStorage<MockDb>(STORAGE_KEYS.db);
  if (existing) {
    return existing;
  }
  const initial = createInitialDb();
  writeStorage(STORAGE_KEYS.db, initial);
  return initial;
}

function saveDb(db: MockDb): void {
  writeStorage(STORAGE_KEYS.db, db);
}

function normalizeWord(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

function toErrorEnvelope(error: unknown): ApiEnvelope<never> {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "Erro inesperado no backend local." };
}

function rankPlayers(players: Player[]): RankingEntry[] {
  const sorted = [...players].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.totalCompletedPhases !== a.totalCompletedPhases) {
      return b.totalCompletedPhases - a.totalCompletedPhases;
    }
    if (a.totalTimeSeconds !== b.totalTimeSeconds) {
      return a.totalTimeSeconds - b.totalTimeSeconds;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });

  return sorted.map((player, index) => ({
    position: index + 1,
    playerId: player.id,
    name: player.name,
    nickname: player.nickname,
    totalScore: player.totalScore,
    totalCompletedPhases: player.totalCompletedPhases,
    totalTimeSeconds: player.totalTimeSeconds
  }));
}

function ensureRequiredPlayerFields(input: PlayerInput): void {
  if (!input.name.trim()) {
    throw new Error("Nome do jogador e obrigatorio.");
  }
  if (!input.nickname.trim()) {
    throw new Error("Apelido do jogador e obrigatorio.");
  }
  const phone = normalizePhone(input.phone);
  if (phone.length < 10 || phone.length > 13) {
    throw new Error("Telefone invalido. Use DDD + numero.");
  }
}

function registerPlayer(input: PlayerInput): { player: Player } {
  ensureRequiredPlayerFields(input);
  const db = getDb();
  const phone = normalizePhone(input.phone);

  const existing = db.players.find((player) => normalizePhone(player.phone) === phone);
  if (existing) {
    if (!existing.currentWordInPhase) {
      existing.currentWordInPhase = 1;
      saveDb(db);
    }
    return { player: existing };
  }

  const player: Player = {
    id: `P${String(db.nextPlayerSeq).padStart(4, "0")}`,
    name: input.name.trim(),
    nickname: input.nickname.trim(),
    phone,
    totalScore: 0,
    totalTimeSeconds: 0,
    totalCompletedPhases: 0,
    currentPhase: 1,
    currentWordInPhase: 1,
    createdAt: nowIso()
  };

  db.players.push(player);
  db.nextPlayerSeq += 1;
  saveDb(db);
  return { player };
}

function findPlayerByPhone(phone: string): { player: Player | null } {
  const db = getDb();
  const normalized = normalizePhone(phone);
  const player = db.players.find((item) => normalizePhone(item.phone) === normalized) ?? null;
  if (player && !player.currentWordInPhase) {
    player.currentWordInPhase = 1;
    saveDb(db);
  }
  return { player };
}

function getPlayerById(playerId: string): { player: Player | null } {
  const db = getDb();
  const player = db.players.find((item) => item.id === playerId) ?? null;
  if (player && !player.currentWordInPhase) {
    player.currentWordInPhase = 1;
    saveDb(db);
  }
  return { player };
}

function findPhaseByNumberAndWord(phases: MazePhase[], phaseId: number, wordOrder: number): MazePhase | undefined {
  return phases.find((item) => item.id === phaseId && item.wordOrder === wordOrder);
}

function assertPhaseUnlocked(player: Player, phaseId: number, wordOrder: number): void {
  const currentPhase = Math.max(1, Number(player.currentPhase || 1));
  const currentWordInPhase = Math.max(1, Number(player.currentWordInPhase || 1));

  if (phaseId > currentPhase) {
    throw new Error(
      `Fase bloqueada. Conclua a fase ${currentPhase} para liberar a fase ${phaseId}.`
    );
  }

  if (phaseId === currentPhase && wordOrder > currentWordInPhase) {
    throw new Error(
      `Palavra bloqueada. Conclua a palavra ${currentWordInPhase} antes de avancar.`
    );
  }
}

function getPhase(
  phaseId: number,
  wordOrder?: number,
  playerId?: string
): { phase: (typeof defaultPhases)[number]; totalPhases: number; wordsPerPhase: number } {
  const db = getDb();
  const safeWordOrder = Math.max(1, Math.min(wordOrder ?? 1, db.config.wordsPerPhase));
  if (playerId) {
    const player = db.players.find((item) => item.id === playerId);
    if (!player) {
      throw new Error("Jogador nao encontrado.");
    }
    assertPhaseUnlocked(player, phaseId, safeWordOrder);
  }
  const phase = findPhaseByNumberAndWord(db.phases, phaseId, safeWordOrder);
  if (!phase) {
    throw new Error(`Fase ${phaseId} / palavra ${safeWordOrder} nao encontrada.`);
  }
  return {
    phase,
    totalPhases: db.config.totalPhases,
    wordsPerPhase: db.config.wordsPerPhase
  };
}

function computeCompletedPhases(results: PhaseResult[], playerId: string, wordsPerPhase: number, totalPhases: number): number {
  const completedWordsByPhase = new Map<number, Set<number>>();
  results.forEach((result) => {
    if (result.playerId !== playerId || !result.correct) {
      return;
    }
    const phaseWords = completedWordsByPhase.get(result.phaseId) ?? new Set<number>();
    phaseWords.add(result.wordOrder || 1);
    completedWordsByPhase.set(result.phaseId, phaseWords);
  });

  let count = 0;
  for (let phaseId = 1; phaseId <= totalPhases; phaseId += 1) {
    if ((completedWordsByPhase.get(phaseId)?.size ?? 0) >= wordsPerPhase) {
      count += 1;
    }
  }
  return count;
}

function hasPreviousCorrectResult(results: PhaseResult[], playerId: string, phaseId: number, wordOrder: number): boolean {
  return results.some(
    (result) =>
      result.playerId === playerId &&
      result.phaseId === phaseId &&
      (result.wordOrder || 1) === wordOrder &&
      result.correct
  );
}

function submitResult(payload: SubmitResultRequest): ApiActionMap["submitResult"]["response"] {
  const db = getDb();
  const player = db.players.find((item) => item.id === payload.playerId);
  if (!player) {
    throw new Error("Jogador nao encontrado.");
  }

  if (!player.currentWordInPhase) {
    player.currentWordInPhase = 1;
  }

  const wordOrder = Math.max(1, Math.min(payload.wordOrder || player.currentWordInPhase, db.config.wordsPerPhase));
  assertPhaseUnlocked(player, payload.phaseId, wordOrder);
  const phase = findPhaseByNumberAndWord(db.phases, payload.phaseId, wordOrder);
  if (!phase) {
    throw new Error("Fase/palavra nao encontrada.");
  }

  const normalizedWord = normalizeWord(payload.wordFormed);
  const isCorrect = payload.correct && normalizedWord === phase.word;
  const score = calculatePhaseScore({
    correct: isCorrect,
    attempts: payload.attempts,
    timeSeconds: payload.timeSeconds
  });

  const result: PhaseResult = {
    playerId: payload.playerId,
    phaseId: payload.phaseId,
    wordOrder,
    wordsPerPhase: db.config.wordsPerPhase,
    word: phase.word,
    wordFormed: normalizedWord,
    message: phase.message,
    reflection: phase.reflection,
    correct: isCorrect,
    attempts: payload.attempts,
    timeSeconds: payload.timeSeconds,
    score,
    createdAt: nowIso()
  };

  const alreadySolvedThisWord = hasPreviousCorrectResult(db.results, payload.playerId, payload.phaseId, wordOrder);
  db.results.push(result);

  let phaseCompleted = false;

  if (isCorrect && !alreadySolvedThisWord) {
    player.totalScore += score;
    player.totalTimeSeconds += payload.timeSeconds;

    if (payload.phaseId === player.currentPhase && wordOrder === player.currentWordInPhase) {
      if (wordOrder >= db.config.wordsPerPhase) {
        player.currentPhase += 1;
        player.currentWordInPhase = 1;
        phaseCompleted = true;
      } else {
        player.currentWordInPhase += 1;
      }
    }
  }

  player.totalCompletedPhases = computeCompletedPhases(
    db.results,
    player.id,
    db.config.wordsPerPhase,
    db.config.totalPhases
  );

  const journeyCompleted = player.currentPhase > db.config.totalPhases;
  const nextPhase = journeyCompleted ? db.config.totalPhases : player.currentPhase;
  const nextWordOrder = journeyCompleted ? db.config.wordsPerPhase : player.currentWordInPhase;

  saveDb(db);

  return {
    result,
    player,
    nextPhase,
    nextWordOrder,
    wordsPerPhase: db.config.wordsPerPhase,
    phaseCompleted,
    journeyCompleted
  };
}

function getRanking(limit?: number): { ranking: RankingEntry[] } {
  const db = getDb();
  const ranking = rankPlayers(db.players);
  if (!limit || limit <= 0) {
    return { ranking };
  }
  return { ranking: ranking.slice(0, limit) };
}

function logEvent(payload: LogEventRequest): { logged: true } {
  const db = getDb();
  db.logs.push({
    event: payload.event,
    playerId: payload.playerId,
    phaseId: payload.phaseId,
    metadata: payload.metadata,
    createdAt: nowIso()
  });
  saveDb(db);
  return { logged: true };
}

function getConfig(): { config: typeof defaultConfig } {
  const db = getDb();
  return { config: db.config };
}

function handleAction<TAction extends ApiAction>(
  action: TAction,
  payload: ApiActionMap[TAction]["request"]
): ApiActionMap[TAction]["response"] {
  switch (action) {
    case "health":
      return { status: "ok", mode: "mock" } as ApiActionMap[TAction]["response"];
    case "getConfig":
      return getConfig() as ApiActionMap[TAction]["response"];
    case "registerPlayer":
      return registerPlayer(payload as PlayerInput) as ApiActionMap[TAction]["response"];
    case "findPlayerByPhone":
      return findPlayerByPhone((payload as { phone: string }).phone) as ApiActionMap[TAction]["response"];
    case "getPlayerById":
      return getPlayerById((payload as { playerId: string }).playerId) as ApiActionMap[TAction]["response"];
    case "getPhase":
      return getPhase(
        (payload as { phaseId: number; wordOrder?: number; playerId?: string }).phaseId,
        (payload as { phaseId: number; wordOrder?: number; playerId?: string }).wordOrder,
        (payload as { phaseId: number; wordOrder?: number; playerId?: string }).playerId
      ) as ApiActionMap[TAction]["response"];
    case "submitResult":
      return submitResult(payload as SubmitResultRequest) as ApiActionMap[TAction]["response"];
    case "getRanking":
      return getRanking((payload as { limit?: number }).limit) as ApiActionMap[TAction]["response"];
    case "logEvent":
      return logEvent(payload as LogEventRequest) as ApiActionMap[TAction]["response"];
    default:
      throw new Error(`Acao nao suportada: ${String(action)}`);
  }
}

export async function mockRequest<TAction extends ApiAction>(
  action: TAction,
  payload: ApiActionMap[TAction]["request"]
): Promise<ApiEnvelope<ApiActionMap[TAction]["response"]>> {
  try {
    const data = handleAction(action, payload);
    return { ok: true, data };
  } catch (error) {
    return toErrorEnvelope(error);
  }
}
