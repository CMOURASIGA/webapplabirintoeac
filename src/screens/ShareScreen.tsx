import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import AppHeader from "../components/layout/AppHeader";
import Card from "../components/common/Card";
import ErrorState from "../components/common/ErrorState";
import ShareActions from "../components/game/ShareActions";
import { useAppContext } from "../store/AppContext";
import { buildShareMessage, buildWhatsAppShareUrl } from "../services/shareService";
import { logEvent } from "../services/gameService";

export default function ShareScreen(): JSX.Element {
  const { config, player, lastResult } = useAppContext();
  const [feedback, setFeedback] = useState("");

  if (!config) {
    return <Navigate to="/" replace />;
  }

  const activeConfig = config;
  const message = useMemo(() => {
    return buildShareMessage({
      config: activeConfig,
      word: lastResult?.result.word
    });
  }, [activeConfig, lastResult?.result.word]);

  async function openGroup(): Promise<void> {
    window.open(activeConfig.whatsappGroupLink, "_blank");
    if (player) {
      await logEvent({ event: "open_group_link", playerId: player.id });
    }
  }

  async function shareWhatsApp(): Promise<void> {
    window.open(buildWhatsAppShareUrl(message), "_blank");
    if (player) {
      await logEvent({
        event: "share_whatsapp",
        playerId: player.id,
        phaseId: lastResult?.result.phaseId
      });
    }
  }

  async function copyMessage(): Promise<void> {
    try {
      await navigator.clipboard.writeText(message);
      setFeedback("Mensagem copiada.");
      if (player) {
        await logEvent({
          event: "copy_share_message",
          playerId: player.id,
          phaseId: lastResult?.result.phaseId
        });
      }
    } catch {
      setFeedback("Nao foi possivel copiar automaticamente.");
    }
  }

  return (
    <AppShell>
      <AppHeader title="Compartilhar resultado" showBack />
      <div className="flex flex-1 flex-col gap-4">
        <Card>
          <p className="whitespace-pre-line text-sm text-slate-100">{message}</p>
        </Card>
        {feedback ? <ErrorState message={feedback} tone="success" /> : null}
        <ShareActions onOpenGroup={() => void openGroup()} onShareWhatsApp={() => void shareWhatsApp()} onCopyMessage={() => void copyMessage()} />
      </div>
    </AppShell>
  );
}
