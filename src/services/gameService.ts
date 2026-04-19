import type { GameConfig, LogEventRequest } from "../types/api";
import type { MazePhase, SubmitResultRequest, SubmitResultResponse } from "../types/game";
import { apiRequest } from "./apiClient";

export async function getConfig(): Promise<GameConfig> {
  const response = await apiRequest("getConfig", {});
  return response.config;
}

export async function getPhase(phaseId: number): Promise<{ phase: MazePhase; totalPhases: number }> {
  return apiRequest("getPhase", { phaseId });
}

export async function submitResult(payload: SubmitResultRequest): Promise<SubmitResultResponse> {
  return apiRequest("submitResult", payload);
}

export async function logEvent(payload: LogEventRequest): Promise<void> {
  await apiRequest("logEvent", payload);
}
