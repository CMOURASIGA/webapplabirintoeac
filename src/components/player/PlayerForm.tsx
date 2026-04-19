import { useState } from "react";
import Card from "../common/Card";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import ErrorState from "../common/ErrorState";
import type { PlayerInput } from "../../types/player";
import { isPhoneValid } from "../../utils/phone";

interface PlayerFormProps {
  loading: boolean;
  onSubmit: (input: PlayerInput) => Promise<void>;
}

export default function PlayerForm({ loading, onSubmit }: PlayerFormProps): JSX.Element {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    if (!name.trim() || !nickname.trim()) {
      setError("Preencha nome e apelido.");
      return;
    }
    if (!isPhoneValid(phone)) {
      setError("Telefone invalido. Use DDD + numero.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        nickname: nickname.trim(),
        phone
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao cadastrar jogador.");
    }
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField label="Nome" value={name} onChange={setName} placeholder="Seu nome" />
        <InputField label="Apelido" value={nickname} onChange={setNickname} placeholder="Como voce quer aparecer" />
        <InputField label="Telefone" value={phone} onChange={setPhone} type="tel" placeholder="(11) 99999-9999" />
        {error ? <ErrorState message={error} /> : null}
        <PrimaryButton label={loading ? "Entrando..." : "Entrar no jogo"} type="submit" disabled={loading} />
      </form>
    </Card>
  );
}
