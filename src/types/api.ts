import type { MazePhase, SubmitResultRequest, SubmitResultResponse } from "./game";
import type { Player, PlayerInput, RankingEntry } from "./player";

export interface GameConfig {
  whatsappGroupLink: string;
  gamePublicLink: string;
  shareMessageTemplate: string;
  totalPhases: number;
  wordsPerPhase: number;
}

export interface LogEventRequest {
  event: string;
  playerId?: string;
  phaseId?: number;
  metadata?: string;
}

export interface ApiSuccess<TData> {
  ok: true;
  data: TData;
}

export interface ApiFailure {
  ok: false;
  error: string;
}

export type ApiEnvelope<TData> = ApiSuccess<TData> | ApiFailure;

export interface ApiActionMap {
  health: {
    request: Record<string, never>;
    response: { status: "ok"; mode: "mock" | "apps_script" };
  };
  getConfig: {
    request: Record<string, never>;
    response: { config: GameConfig };
  };
  registerPlayer: {
    request: PlayerInput;
    response: { player: Player };
  };
  findPlayerByPhone: {
    request: { phone: string };
    response: { player: Player | null };
  };
  getPlayerById: {
    request: { playerId: string };
    response: { player: Player | null };
  };
  getPhase: {
    request: { phaseId: number; wordOrder?: number; playerId?: string };
    response: { phase: MazePhase; totalPhases: number; wordsPerPhase: number };
  };
  submitResult: {
    request: SubmitResultRequest;
    response: SubmitResultResponse;
  };
  getRanking: {
    request: { limit?: number };
    response: { ranking: RankingEntry[] };
  };
  logEvent: {
    request: LogEventRequest;
    response: { logged: true };
  };
}

export type ApiAction = keyof ApiActionMap;
