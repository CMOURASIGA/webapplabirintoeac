interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export default function PrimaryButton({
  label,
  onClick,
  type = "button",
  disabled = false,
  className = ""
}: PrimaryButtonProps): JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-2xl border border-sky-200/35 bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 px-4 py-4 text-base font-bold text-white shadow-[0_12px_22px_rgba(8,47,73,0.45)] transition hover:-translate-y-0.5 hover:brightness-110 ${className}`}
    >
      {label}
    </button>
  );
}
