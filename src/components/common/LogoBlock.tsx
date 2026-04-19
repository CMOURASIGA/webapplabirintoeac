export default function LogoBlock({ compact = false }: { compact?: boolean }): JSX.Element {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
          E
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">Game EAC</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-3xl font-extrabold text-white shadow-game">
        E
      </div>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Encontro de Adolescentes com Cristo</p>
        <h1 className="text-2xl font-black text-white">Game EAC</h1>
      </div>
    </div>
  );
}
