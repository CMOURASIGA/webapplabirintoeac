import type { Coord } from "../../types/game";
import { coordToKey, isSameCoord } from "../../utils/maze";
import MazeCell from "./MazeCell";

interface MazeGridProps {
  grid: string[][];
  path: Coord[];
  start: Coord;
  end: Coord;
  onCellClick: (coord: Coord) => void;
}

export default function MazeGrid({
  grid,
  path,
  start,
  end,
  onCellClick
}: MazeGridProps): JSX.Element {
  const safeGrid = Array.isArray(grid) ? grid.filter((row): row is string[] => Array.isArray(row)) : [];
  const visited = new Set(path.map((coord) => coordToKey(coord)));
  const selected = path[path.length - 1];

  return (
    <div className="mx-auto inline-grid gap-2 rounded-3xl border border-white/10 bg-slate-950/50 p-3">
      {safeGrid.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-2">
          {row.map((letter, colIndex) => {
            const coord: Coord = { row: rowIndex, col: colIndex };
            const key = coordToKey(coord);
            return (
              <MazeCell
                key={key}
                letter={letter}
                isStart={isSameCoord(coord, start)}
                isEnd={isSameCoord(coord, end)}
                isVisited={visited.has(key)}
                isSelected={Boolean(selected && isSameCoord(coord, selected))}
                onClick={() => onCellClick(coord)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
