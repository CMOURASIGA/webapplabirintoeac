import type { Player, PlayerInput } from "../types/player";
import { normalizePhone } from "../utils/phone";
import { apiRequest } from "./apiClient";
import { STORAGE_KEYS } from "./storage";

function setCurrentPlayerId(playerId: string): void {
  localStorage.setItem(STORAGE_KEYS.currentPlayerId, playerId);
}

export function clearCurrentPlayerId(): void {
  localStorage.removeItem(STORAGE_KEYS.currentPlayerId);
}

export async function registerPlayer(input: PlayerInput): Promise<Player> {
  const response = await apiRequest("registerPlayer", {
    ...input,
    phone: normalizePhone(input.phone)
  });
  setCurrentPlayerId(response.player.id);
  return response.player;
}

export async function continueWithPhone(phone: string): Promise<Player | null> {
  const response = await apiRequest("findPlayerByPhone", { phone: normalizePhone(phone) });
  if (response.player) {
    setCurrentPlayerId(response.player.id);
  }
  return response.player;
}

export async function getCurrentPlayer(): Promise<Player | null> {
  const playerId = localStorage.getItem(STORAGE_KEYS.currentPlayerId);
  if (!playerId) {
    return null;
  }

  const response = await apiRequest("getPlayerById", { playerId });
  return response.player;
}
