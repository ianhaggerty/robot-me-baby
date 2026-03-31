import { bboxOverlap, bboxInBounds } from "./bbox.js";

export type PositionedArt = {
  art: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Check if two positioned arts have overlapping non-space characters.
 */
export function hasCharacterCollision(
  a: PositionedArt,
  b: PositionedArt,
): boolean {
  if (!bboxOverlap(a, b)) return false;

  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  if (left >= right || top >= bottom) return false;

  const linesA = a.art.split("\n");
  const linesB = b.art.split("\n");

  for (let y = top; y < bottom; y++) {
    const lineA = linesA[y - a.y] ?? "";
    const lineB = linesB[y - b.y] ?? "";

    for (let x = left; x < right; x++) {
      const charA = x - a.x < lineA.length ? lineA[x - a.x] : " ";
      const charB = x - b.x < lineB.length ? lineB[x - b.x] : " ";

      if (charA !== " " && charB !== " ") return true;
    }
  }

  return false;
}

/**
 * Check if a positioned art is in bounds and has no character-level collisions.
 */
export function isCharacterValid(
  target: PositionedArt,
  others: PositionedArt[],
  windowWidth: number,
  windowHeight: number,
): boolean {
  if (!bboxInBounds(target, windowWidth, windowHeight)) return false;
  return others.every((other) => !hasCharacterCollision(target, other));
}

/**
 * Find a random valid position using character-level collision.
 * Allows bounding box overlap as long as non-space characters don't collide.
 */
export function findValidPositionByCharacter(
  art: string,
  width: number,
  height: number,
  others: PositionedArt[],
  windowWidth: number,
  windowHeight: number,
  maxAttempts = 1000,
): { x: number; y: number } | null {
  const maxX = windowWidth - width;
  const maxY = windowHeight - height;
  if (maxX < 0 || maxY < 0) return null;

  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.floor(Math.random() * (maxX + 1));
    const y = Math.floor(Math.random() * (maxY + 1));
    const target: PositionedArt = { art, x, y, width, height };
    if (isCharacterValid(target, others, windowWidth, windowHeight)) {
      return { x, y };
    }
  }
  return null;
}

/**
 * Resolve a move with push/pull chain reactions.
 *
 * When the moving robot's new position causes character-level collisions,
 * the colliding robots are pushed in the same direction. This cascades:
 * each pushed robot may in turn push others. All pushed robots move by
 * the same (dx, dy) delta.
 *
 * Returns new positions for all entries, or null if any pushed robot
 * would leave the window bounds (the entire move is a no-op).
 */
export function resolveMove(
  movingIndex: number,
  dx: number,
  dy: number,
  arts: PositionedArt[],
  windowWidth: number,
  windowHeight: number,
): { x: number; y: number }[] | null {
  const positions = arts.map((a) => ({ x: a.x, y: a.y }));

  positions[movingIndex].x += dx;
  positions[movingIndex].y += dy;

  const moved = new Set<number>([movingIndex]);
  const queue: number[] = [movingIndex];

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const movedArt: PositionedArt = {
      ...arts[idx],
      x: positions[idx].x,
      y: positions[idx].y,
    };

    for (let j = 0; j < arts.length; j++) {
      if (moved.has(j)) continue;

      if (hasCharacterCollision(movedArt, arts[j])) {
        positions[j].x += dx;
        positions[j].y += dy;
        moved.add(j);
        queue.push(j);
      }
    }
  }

  for (const idx of moved) {
    if (
      !bboxInBounds(
        {
          x: positions[idx].x,
          y: positions[idx].y,
          width: arts[idx].width,
          height: arts[idx].height,
        },
        windowWidth,
        windowHeight,
      )
    ) {
      return null;
    }
  }

  return positions;
}
