type Tone = "error" | "success";

export default function ErrorState({
  message,
  tone = "error"
}: {
  message: string;
  tone?: Tone;
}): JSX.Element {
  const classes =
    tone === "success"
      ? "border-green-400/40 bg-green-500/10 text-green-100"
      : "border-red-400/40 bg-red-500/10 text-red-100";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  );
}
