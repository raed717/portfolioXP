/** Arrow-key navigation over laid-out elements (icon grids, menus) using their on-screen positions. */

export type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export function isArrowKey(key: string): key is ArrowKey {
  return key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight";
}

export function findNeighbor<T extends Element>(
  current: T,
  candidates: T[],
  key: ArrowKey,
): T | null {
  const from = current.getBoundingClientRect();
  const cx = from.left + from.width / 2;
  const cy = from.top + from.height / 2;
  const horizontal = key === "ArrowLeft" || key === "ArrowRight";

  let best: T | null = null;
  let bestScore = Infinity;
  for (const el of candidates) {
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;
    const inDirection =
      (key === "ArrowRight" && dx > 1) ||
      (key === "ArrowLeft" && dx < -1) ||
      (key === "ArrowDown" && dy > 1) ||
      (key === "ArrowUp" && dy < -1);
    if (!inDirection) continue;
    // Prefer elements in the same row/column: off-axis distance weighs more.
    const score = horizontal ? Math.abs(dx) + Math.abs(dy) * 4 : Math.abs(dy) + Math.abs(dx) * 4;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}
