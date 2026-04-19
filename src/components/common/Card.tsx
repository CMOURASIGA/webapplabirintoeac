export default function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`rounded-3xl border border-white/15 bg-slate-900/70 p-4 shadow-game backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
