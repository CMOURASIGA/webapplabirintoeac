export interface PlayerInput {
  name: string;
  nickname: string;
  phone: string;
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  totalScore: number;
  totalTimeSeconds: number;
  totalCompletedPhases: number;
  currentPhase: number;
  createdAt: string;
}

export interface RankingEntry {
  position: number;
  playerId: string;
  name: string;
  nickname: string;
  totalScore: number;
  totalCompletedPhases: number;
  totalTimeSeconds: number;
}
