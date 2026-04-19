export const STORAGE_KEYS = {
  db: "eac_labirinto_db_v1",
  currentPlayerId: "eac_labirinto_current_player_id"
} as const;

export function readStorage<TValue>(key: string): TValue | null {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TValue;
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}
