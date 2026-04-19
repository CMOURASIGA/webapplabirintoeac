import { useNavigate } from "react-router-dom";
import LogoBlock from "../common/LogoBlock";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export default function AppHeader({ title, showBack = false, rightSlot }: AppHeaderProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100"
          >
            Voltar
          </button>
        ) : null}
        <div>
          <LogoBlock compact />
          <p className="mt-1 text-sm text-slate-200">{title}</p>
        </div>
      </div>
      {rightSlot ? <div className="text-sm text-slate-100">{rightSlot}</div> : null}
    </header>
  );
}
