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
      className={`w-full rounded-2xl border border-white/25 bg-white/5 px-4 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10 ${className}`}
    >
      {label}
    </button>
  );
}
