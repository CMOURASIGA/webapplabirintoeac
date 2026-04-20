import type { Player } from "./player";

export interface Coord {
  row: number;
  col: number;
}

export interface MazePhase {
  id: number;
  wordOrder: number;
  wordsPerPhase: number;
  word: string;
  message: string;
  reflection: string;
  grid: string[][];
  start: Coord;
  end: Coord;
}

export interface SubmitResultRequest {
  playerId: string;
  phaseId: number;
  wordOrder: number;
  wordFormed: string;
  attempts: number;
  timeSeconds: number;
  correct: boolean;
}

export interface PhaseResult {
  playerId: string;
  phaseId: number;
  wordOrder: number;
  wordsPerPhase: number;
  word: string;
  wordFormed: string;
  message: string;
  reflection: string;
  correct: boolean;
  attempts: number;
  timeSeconds: number;
  score: number;
  createdAt: string;
}

export interface SubmitResultResponse {
  result: PhaseResult;
  player: Player;
  nextPhase: number;
  nextWordOrder: number;
  wordsPerPhase: number;
  phaseCompleted: boolean;
  journeyCompleted: boolean;
}
