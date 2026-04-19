interface PhaseProgressProps {
  current: number;
  total: number;
}

export default function PhaseProgress({ current, total }: PhaseProgressProps): JSX.Element {
  const safeTotal = Math.max(total, 1);
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);
  const percentage = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>Progresso</span>
        <span>
          {safeCurrent}/{safeTotal}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800/90">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
