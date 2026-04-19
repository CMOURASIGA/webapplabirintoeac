import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import PlayerForm from "../components/player/PlayerForm";
import SecondaryButton from "../components/common/SecondaryButton";
import { useAppContext } from "../store/AppContext";

export default function PlayerRegisterScreen(): JSX.Element {
  const navigate = useNavigate();
  const { registerNewPlayer } = useAppContext();
  const [loading, setLoading] = useState(false);

  async function handleRegister(input: Parameters<typeof registerNewPlayer>[0]): Promise<void> {
    setLoading(true);
    try {
      await registerNewPlayer(input);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <AppHeader title="Identifique-se" showBack />
      <div className="flex flex-1 flex-col gap-4">
        <PlayerForm loading={loading} onSubmit={handleRegister} />
        <SecondaryButton label="Continuar com telefone" onClick={() => navigate("/continue")} />
      </div>
    </AppShell>
  );
}
