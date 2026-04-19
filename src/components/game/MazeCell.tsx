interface MazeCellProps {
  letter: string;
  isStart: boolean;
  isEnd: boolean;
  isSelected: boolean;
  isVisited: boolean;
  onClick: () => void;
}

export default function MazeCell({
  letter,
  isStart,
  isEnd,
  isSelected,
  isVisited,
  onClick
}: MazeCellProps): JSX.Element {
  let stateClass = "border-white/20 bg-slate-900/70 text-slate-100";

  if (isVisited) {
    stateClass = "border-sky-400/50 bg-sky-500/20 text-sky-50";
  }

  if (isSelected) {
    stateClass = "border-green-400/70 bg-green-500/25 text-green-50";
  }

  return (
    <button
      onClick={onClick}
      className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-extrabold transition ${stateClass}`}
    >
      {isStart ? <span className="absolute left-1 top-1 text-[9px] font-bold text-green-200">S</span> : null}
      {isEnd ? <span className="absolute right-1 top-1 text-[9px] font-bold text-yellow-200">F</span> : null}
      {letter}
    </button>
  );
}
