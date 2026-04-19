import type { RankingEntry } from "../types/player";
import { apiRequest } from "./apiClient";

export async function getRanking(limit = 10): Promise<RankingEntry[]> {
  const response = await apiRequest("getRanking", { limit });
  return response.ranking;
}
