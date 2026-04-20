interface LoadingStateProps {
  label?: string;
  emphasis?: boolean;
}

export default function LoadingState({ label = "Carregando...", emphasis = false }: LoadingStateProps): JSX.Element {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p
        className={
          emphasis
            ? "text-center text-2xl font-extrabold tracking-wide text-sky-100"
            : "text-sm text-slate-300"
        }
      >
        {label}
      </p>
    </div>
  );
}
