interface InputFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: "text" | "tel";
}

export default function InputField({
  label,
  value,
  placeholder,
  onChange,
  type = "text"
}: InputFieldProps): JSX.Element {
  return (
    <label className="block space-y-2 text-sm text-slate-200">
      <span>{label}</span>
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-3 py-3 text-base text-white outline-none ring-brand-300 transition focus:ring-2"
      />
    </label>
  );
}
