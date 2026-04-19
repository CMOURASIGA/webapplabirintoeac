import Card from "../common/Card";

interface ReflectionCardProps {
  message: string;
  reflection: string;
}

export default function ReflectionCard({ message, reflection }: ReflectionCardProps): JSX.Element {
  return (
    <Card className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mensagem</p>
        <p className="mt-1 text-sm text-slate-100">{message}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reflexao</p>
        <p className="mt-1 text-sm text-slate-100">{reflection}</p>
      </div>
    </Card>
  );
}
