export default function ScreenTitle({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
    </div>
  );
}
