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
      className={`w-full rounded-2xl bg-brand-500 px-4 py-4 text-base font-semibold text-white transition hover:bg-brand-400 ${className}`}
    >
      {label}
    </button>
  );
}
