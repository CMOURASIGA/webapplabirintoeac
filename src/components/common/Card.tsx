export default function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`rounded-3xl border border-sky-200/20 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-4 shadow-game backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
