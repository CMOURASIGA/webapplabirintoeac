export default function LoadingState({ label = "Carregando..." }: { label?: string }): JSX.Element {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}
