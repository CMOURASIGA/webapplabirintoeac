import { useState } from "react";
import Card from "../common/Card";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import ErrorState from "../common/ErrorState";
import { isPhoneValid } from "../../utils/phone";

interface ContinuePlayerFormProps {
  loading: boolean;
  onSearch: (phone: string) => Promise<void>;
}

export default function ContinuePlayerForm({
  loading,
  onSearch
}: ContinuePlayerFormProps): JSX.Element {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    if (!isPhoneValid(phone)) {
      setError("Informe um telefone valido.");
      return;
    }

    try {
      await onSearch(phone);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Falha ao buscar jogador.");
    }
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Telefone cadastrado"
          value={phone}
          onChange={setPhone}
          type="tel"
          placeholder="(11) 99999-9999"
        />
        {error ? <ErrorState message={error} /> : null}
        <PrimaryButton label={loading ? "Buscando..." : "Buscar meu progresso"} type="submit" disabled={loading} />
      </form>
    </Card>
  );
}
