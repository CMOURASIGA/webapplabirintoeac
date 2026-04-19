import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";

interface ShareActionsProps {
  onOpenGroup: () => void;
  onShareWhatsApp: () => void;
  onCopyMessage: () => void;
}

export default function ShareActions({
  onOpenGroup,
  onShareWhatsApp,
  onCopyMessage
}: ShareActionsProps): JSX.Element {
  return (
    <div className="space-y-3">
      <PrimaryButton label="Entrar no grupo WhatsApp" onClick={onOpenGroup} />
      <SecondaryButton label="Compartilhar no WhatsApp" onClick={onShareWhatsApp} />
      <SecondaryButton label="Copiar mensagem" onClick={onCopyMessage} />
    </div>
  );
}
