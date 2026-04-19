import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import ScreenTitle from "../components/common/ScreenTitle";
import LoadingState from "../components/common/LoadingState";
import LogoBlock from "../components/common/LogoBlock";
import AppShell from "../components/layout/AppShell";
import { useAppContext } from "../store/AppContext";
import { getApiModeLabel } from "../services/apiClient";

export default function WelcomeScreen(): JSX.Element {
  const navigate = useNavigate();
  const { booting, player } = useAppContext();

  if (booting) {
    return (
      <AppShell>
        <LoadingState label="Iniciando Game EAC..." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-2rem)] flex-col justify-between py-6">
        <LogoBlock />

        <div className="space-y-3 text-center">
          <ScreenTitle title="Labirinto de Palavras" subtitle="Descubra palavras, avance nas fases e entre no ranking." />
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Modo API: {getApiModeLabel()}</p>
        </div>

        <div className="space-y-3">
          <PrimaryButton
            label="Continuar meu jogo"
            onClick={() => navigate(player ? "/home" : "/continue")}
          />
          <PrimaryButton label="Novo jogador" onClick={() => navigate("/register")} />
          <SecondaryButton label="Ver ranking" onClick={() => navigate("/ranking")} />
        </div>
      </div>
    </AppShell>
  );
}
