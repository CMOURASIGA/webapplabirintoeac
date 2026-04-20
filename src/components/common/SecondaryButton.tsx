interface SecondaryButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export default function SecondaryButton({
  label,
  onClick,
  type = "button",
  disabled = false,
  className = ""
}: SecondaryButtonProps): JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-2xl border border-sky-200/25 bg-slate-900/55 px-4 py-4 text-base font-semibold text-slate-100 transition hover:border-sky-300/40 hover:bg-slate-800/60 ${className}`}
    >
      {label}
    </button>
  );
}
