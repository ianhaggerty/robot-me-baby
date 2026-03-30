export type BBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function bboxOverlap(a: BBox, b: BBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function bboxInBounds(
  bbox: BBox,
  windowWidth: number,
  windowHeight: number,
): boolean {
  return (
    bbox.x >= 0 &&
    bbox.y >= 0 &&
    bbox.x + bbox.width <= windowWidth &&
    bbox.y + bbox.height <= windowHeight
  );
}

export function bboxIsValid(
  bbox: BBox,
  others: BBox[],
  windowWidth: number,
  windowHeight: number,
): boolean {
  if (!bboxInBounds(bbox, windowWidth, windowHeight)) return false;
  return others.every((other) => !bboxOverlap(bbox, other));
}

export function findValidPosition(
  width: number,
  height: number,
  others: BBox[],
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
    const bbox: BBox = { x, y, width, height };
    if (bboxIsValid(bbox, others, windowWidth, windowHeight)) {
      return { x, y };
    }
  }
  return null;
}
