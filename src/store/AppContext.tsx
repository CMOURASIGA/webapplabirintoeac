import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { GameConfig } from "../types/api";
import type { SubmitResultResponse } from "../types/game";
import type { Player, PlayerInput } from "../types/player";
import { getConfig } from "../services/gameService";
import { clearCurrentPlayerId, continueWithPhone, getCurrentPlayer, registerPlayer } from "../services/playerService";

interface AppContextValue {
  booting: boolean;
  config: GameConfig | null;
  player: Player | null;
  lastResult: SubmitResultResponse | null;
  setLastResult: (result: SubmitResultResponse | null) => void;
  refreshBootstrap: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
  registerNewPlayer: (input: PlayerInput) => Promise<Player>;
  continuePlayer: (phone: string) => Promise<Player | null>;
  logoutPlayer: () => void;
  setPlayer: (player: Player | null) => void;
  restartJourneyLocal: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [booting, setBooting] = useState(true);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [lastResult, setLastResult] = useState<SubmitResultResponse | null>(null);

  const refreshBootstrap = useCallback(async () => {
    setBooting(true);
    try {
      const [loadedConfig, loadedPlayer] = await Promise.all([getConfig(), getCurrentPlayer()]);
      setConfig(loadedConfig);
      setPlayer(loadedPlayer);
    } finally {
      setBooting(false);
    }
  }, []);

  const refreshPlayer = useCallback(async () => {
    const loadedPlayer = await getCurrentPlayer();
    setPlayer(loadedPlayer);
  }, []);

  const registerNewPlayer = useCallback(async (input: PlayerInput) => {
    const created = await registerPlayer(input);
    setPlayer(created);
    return created;
  }, []);

  const continuePlayerHandler = useCallback(async (phone: string) => {
    const found = await continueWithPhone(phone);
    setPlayer(found);
    return found;
  }, []);

  const logoutPlayer = useCallback(() => {
    clearCurrentPlayerId();
    setPlayer(null);
    setLastResult(null);
  }, []);

  const restartJourneyLocal = useCallback(() => {
    setLastResult(null);
    setPlayer((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        currentPhase: 1,
        currentWordInPhase: 1
      };
    });
  }, []);

  useEffect(() => {
    void refreshBootstrap();
  }, [refreshBootstrap]);

  const value = useMemo<AppContextValue>(
    () => ({
      booting,
      config,
      player,
      lastResult,
      setLastResult,
      refreshBootstrap,
      refreshPlayer,
      registerNewPlayer,
      continuePlayer: continuePlayerHandler,
      logoutPlayer,
      setPlayer,
      restartJourneyLocal
    }),
    [
      booting,
      config,
      player,
      lastResult,
      refreshBootstrap,
      refreshPlayer,
      registerNewPlayer,
      continuePlayerHandler,
      logoutPlayer,
      restartJourneyLocal
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext deve ser usado dentro de AppProvider.");
  }
  return context;
}
