import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import ContinuePlayerForm from "../components/player/ContinuePlayerForm";
import PlayerSummaryCard from "../components/player/PlayerSummaryCard";
import PrimaryButton from "../components/common/PrimaryButton";
import ErrorState from "../components/common/ErrorState";
import type { Player } from "../types/player";
import { useAppContext } from "../store/AppContext";

export default function ContinueGameScreen(): JSX.Element {
  const navigate = useNavigate();
  const { continuePlayer } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [foundPlayer, setFoundPlayer] = useState<Player | null>(null);
  const [searchError, setSearchError] = useState("");

  async function handleSearch(phone: string): Promise<void> {
    setLoading(true);
    setSearchError("");
    try {
      const player = await continuePlayer(phone);
      setFoundPlayer(player);
      if (!player) {
        setSearchError("Nenhum jogador encontrado com este telefone.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <AppHeader title="Continuar meu jogo" showBack />
      <div className="flex flex-1 flex-col gap-4">
        <ContinuePlayerForm loading={loading} onSearch={handleSearch} />
        {searchError ? <ErrorState message={searchError} /> : null}
        {foundPlayer ? (
          <>
            <PlayerSummaryCard player={foundPlayer} />
            <PrimaryButton label="Continuar" onClick={() => navigate("/home")} />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
