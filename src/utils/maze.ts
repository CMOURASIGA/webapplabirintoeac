import type { Coord } from "../types/game";

export function coordToKey(coord: Coord): string {
  return `${coord.row}:${coord.col}`;
}

export function isSameCoord(a: Coord, b: Coord): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isAdjacent(a: Coord, b: Coord): boolean {
  const rowDistance = Math.abs(a.row - b.row);
  const colDistance = Math.abs(a.col - b.col);
  return rowDistance + colDistance === 1;
}

export function getCellLetter(grid: string[][], coord: Coord): string {
  return grid[coord.row]?.[coord.col] ?? "";
}

export function pathToWord(grid: string[][], path: Coord[]): string {
  return path.map((coord) => getCellLetter(grid, coord)).join("").toUpperCase();
}

export function getAvailableMoves(
  grid: string[][],
  current: Coord,
  visited: Set<string>
): Coord[] {
  const directions: Coord[] = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];

  const moves: Coord[] = [];

  directions.forEach((direction) => {
    const next = {
      row: current.row + direction.row,
      col: current.col + direction.col
    };

    const isInside =
      next.row >= 0 &&
      next.row < grid.length &&
      next.col >= 0 &&
      next.col < (grid[next.row]?.length ?? 0);

    if (!isInside) {
      return;
    }

    if (visited.has(coordToKey(next))) {
      return;
    }

    moves.push(next);
  });

  return moves;
}
