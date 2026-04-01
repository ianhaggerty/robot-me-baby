import React from "react";
import { vi } from "vitest";
import { render, cleanup } from "ink-testing-library";
import { MemoryRouter, useNavigate } from "react-router";
import RobotGame from "../pages/RobotGame.js";

import Robot from "../models/Robot.js";
import Explosion from "../models/Explosion.js";
import { DirectionX } from "./enums.js";
import { Color } from "../assets/colors.js";
import rawRobots from "../assets/robots.js";
import rawExplosions from "../assets/explosions.js";
import { playSound } from "../assets/sounds.js";
import { readArt } from "../assets/readArt.js";

export const art_1x1 = readArt("test/shapes/1x1.txt");
export const art_2x2 = readArt("test/shapes/2x2.txt");
export const art_3x3_hollow = readArt("test/shapes/3x3-hollow.txt");
export const art_disjoint = readArt("test/shapes/disjoint.txt");
export const art_L = readArt("test/shapes/L.txt");
export const art_J = readArt("test/shapes/J.txt");
export const art_K = readArt("test/shapes/K-staircase.txt");
export const art_irregular = readArt("test/shapes/irregular.txt");
export const art_maze = readArt("test/maze/maze-1.txt");
export const MAZE_A_START = { x: 7, y: 9 } as const;

// Mock references — these resolve to the vi.fn() instances created by
// each test file's vi.mock() factories. The factories must NOT dynamically
// import this file (circular dep through RobotGame → sounds.js).
export const mockPlaySound = vi.mocked(playSound);
export const mockNavigate = useNavigate() as unknown as ReturnType<typeof vi.fn>;

export function resetMocks() {
  cleanup();
  mockPlaySound.mockClear();
  mockNavigate.mockClear();
}

// eslint-disable-next-line no-control-regex
const ANSI_REGEX =
  /[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

export function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, "");
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function trimmedArtLines(art: string): string[] {
  return art.split("\n").map((line) => line.trimEnd());
}

function blockMatch(
  frameLines: string[],
  artLines: string[],
  row: number,
  col: number,
): boolean {
  return artLines.every((artLine, i) => {
    const frameLine = frameLines[row + i];
    for (let c = 0; c < artLine.length; c++) {
      if (artLine[c] === " ") continue;
      if (col + c >= frameLine.length || frameLine[col + c] !== artLine[c])
        return false;
    }
    return true;
  });
}

export function frameContainsArt(frame: string, art: string): boolean {
  const frameLines = stripAnsi(frame).split("\n");
  const artLines = trimmedArtLines(art);
  if (artLines.length === 0) return true;

  // Find the first non-space segment in the first art line to anchor the search
  const firstLine = artLines[0];
  const anchor = firstLine.match(/\S+/);
  if (!anchor) return true;
  const anchorOffset = anchor.index!;
  const anchorText = anchor[0];

  for (let row = 0; row <= frameLines.length - artLines.length; row++) {
    let startCol = 0;
    while (true) {
      const anchorCol = frameLines[row].indexOf(anchorText, startCol);
      if (anchorCol === -1) break;
      const col = anchorCol - anchorOffset;
      if (col >= 0 && blockMatch(frameLines, artLines, row, col)) return true;
      startCol = anchorCol + 1;
    }
  }
  return false;
}

function countSingleArt(frameLines: string[], art: string): number {
  const artLines = trimmedArtLines(art);
  if (artLines.length === 0) return 0;

  const anchor = artLines[0].match(/\S+/);
  if (!anchor) return 0;
  const anchorOffset = anchor.index!;
  const anchorText = anchor[0];

  let count = 0;
  for (let row = 0; row <= frameLines.length - artLines.length; row++) {
    let startCol = 0;
    while (true) {
      const anchorCol = frameLines[row].indexOf(anchorText, startCol);
      if (anchorCol === -1) break;
      const col = anchorCol - anchorOffset;
      if (col >= 0 && blockMatch(frameLines, artLines, row, col)) count++;
      startCol = anchorCol + 1;
    }
  }
  return count;
}

export function findArtPositions(
  frame: string,
  art: string,
): { x: number; y: number }[] {
  const frameLines = stripAnsi(frame).split("\n");
  const artLines = trimmedArtLines(art);
  if (artLines.length === 0) return [];

  const anchor = artLines[0].match(/\S+/);
  if (!anchor) return [];
  const anchorOffset = anchor.index!;
  const anchorText = anchor[0];

  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row <= frameLines.length - artLines.length; row++) {
    let startCol = 0;
    while (true) {
      const anchorCol = frameLines[row].indexOf(anchorText, startCol);
      if (anchorCol === -1) break;
      const col = anchorCol - anchorOffset;
      if (col >= 0 && blockMatch(frameLines, artLines, row, col)) {
        positions.push({ x: col, y: row });
      }
      startCol = anchorCol + 1;
    }
  }
  return positions;
}

export function countArtOccurrences(frame: string, art: string): number;
export function countArtOccurrences(frame: string, art: string[]): number[];
export function countArtOccurrences(
  frame: string,
  art: string | string[],
): number | number[] {
  const frameLines = stripAnsi(frame).split("\n");
  if (Array.isArray(art)) {
    return art.map((a) => countSingleArt(frameLines, a));
  }
  return countSingleArt(frameLines, art);
}

function normalizeArt(art: string): string {
  return art
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}

// Three test robots with distinct colors for multi-robot tests
export const robotA = new Robot({
  str: rawRobots[0].str,
  direction: DirectionX.Right,
  name: "Robot A",
  color: Color.MUTED_RED,
});
export const robotB = new Robot({
  str: rawRobots[1].str,
  direction: DirectionX.Right,
  name: "Robot B",
  color: Color.MUTED_GREEN,
});
export const robotC = new Robot({
  str: rawRobots[2].str,
  direction: DirectionX.Right,
  name: "Robot C",
  color: Color.MUTED_TEAL,
});

export const robotAArt = normalizeArt(robotA.toString());
export const robotBArt = normalizeArt(robotB.toString());
export const robotCArt = normalizeArt(robotC.toString());

// Scrambled variants (1st, 2nd, 3rd explosion)
export const robotAScramble1 = robotA.explode();
export const robotAScramble2 = robotAScramble1.explode();
export const robotAScramble3 = robotAScramble2.explode();

export const robotBScramble1 = robotB.explode();
export const robotBScramble2 = robotBScramble1.explode();
export const robotBScramble3 = robotBScramble2.explode();

export const robotCScramble1 = robotC.explode();
export const robotCScramble2 = robotCScramble1.explode();
export const robotCScramble3 = robotCScramble2.explode();

export const robotAScramble1Art = normalizeArt(robotAScramble1.toString());
export const robotAScramble2Art = normalizeArt(robotAScramble2.toString());
export const robotAScramble3Art = normalizeArt(robotAScramble3.toString());

export const robotBScramble1Art = normalizeArt(robotBScramble1.toString());
export const robotBScramble2Art = normalizeArt(robotBScramble2.toString());
export const robotBScramble3Art = normalizeArt(robotBScramble3.toString());

export const robotCScramble1Art = normalizeArt(robotCScramble1.toString());
export const robotCScramble2Art = normalizeArt(robotCScramble2.toString());
export const robotCScramble3Art = normalizeArt(robotCScramble3.toString());

export const allRobotArts = [
  ...new Set([
    ...rawRobots.flatMap((raw) => {
      const r = new Robot({ str: raw.str, direction: raw.direction, name: "" });
      const left = r.setDirection(DirectionX.Left);
      const right = r.setDirection(DirectionX.Right);
      return [normalizeArt(left.toString()), normalizeArt(right.toString())];
    }),
    robotAScramble1Art,
    robotAScramble2Art,
    robotAScramble3Art,
    robotBScramble1Art,
    robotBScramble2Art,
    robotBScramble3Art,
    robotCScramble1Art,
    robotCScramble2Art,
    robotCScramble3Art,
  ]),
];

export const allExplosionArts = rawExplosions.map((raw) =>
  normalizeArt(new Explosion(raw).toString()),
);

export function frameContainsExplosion(frame: string): boolean {
  return allExplosionArts.some((art) => frameContainsArt(frame, art));
}

export function frameContainsPartialExplosion(
  frame: string,
  minMatchLength = 10,
): boolean {
  const clean = stripAnsi(frame);
  return allExplosionArts.some((art) =>
    trimmedArtLines(art).some((line) => {
      const prefix = line.trimStart().slice(0, minMatchLength);
      return prefix.length >= minMatchLength && clean.includes(prefix);
    }),
  );
}

export function totalRobotCount(frame: string): number {
  return (countArtOccurrences(frame, allRobotArts) as number[]).reduce(
    (a, b) => a + b,
    0,
  );
}

function hexToAnsiPattern(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1B[38;2;${r};${g};${b}m`;
}

function hexToDimAnsiPattern(hex: string): string {
  return hexToAnsiPattern(hex) + "\x1B[2m";
}

function countSingleColor(frame: string, color: string): number {
  const pattern = hexToAnsiPattern(color);
  let count = 0;
  let idx = 0;
  while ((idx = frame.indexOf(pattern, idx)) !== -1) {
    count++;
    idx += pattern.length;
  }
  return count;
}

export function countColorOccurrences(frame: string, color: string): number;
export function countColorOccurrences(frame: string, color: string[]): number[];
export function countColorOccurrences(
  frame: string,
  color: string | string[],
): number | number[] {
  if (Array.isArray(color)) {
    return color.map((c) => countSingleColor(frame, c));
  }
  return countSingleColor(frame, color);
}

function countSingleDimColor(frame: string, color: string): number {
  const pattern = hexToDimAnsiPattern(color);
  let count = 0;
  let idx = 0;
  while ((idx = frame.indexOf(pattern, idx)) !== -1) {
    count++;
    idx += pattern.length;
  }
  return count;
}

export function countDimColorOccurrences(frame: string, color: string): number;
export function countDimColorOccurrences(
  frame: string,
  color: string[],
): number[];
export function countDimColorOccurrences(
  frame: string,
  color: string | string[],
): number | number[] {
  if (Array.isArray(color)) {
    return color.map((c) => countSingleDimColor(frame, c));
  }
  return countSingleDimColor(frame, color);
}

export function findTextOnRow(
  frame: string,
  row: number,
  text: string,
): number | null {
  const lines = stripAnsi(frame).split("\n");
  if (row < 0 || row >= lines.length) return null;
  const col = lines[row].indexOf(text);
  return col === -1 ? null : col;
}

export function pressKey(
  stdin: { write: (data: string) => void },
  key: string,
  count = 1,
): void {
  for (let i = 0; i < count; i++) {
    stdin.write(key);
  }
}

export function renderRobotGame(props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <RobotGame {...props} />
    </MemoryRouter>,
  );
}

export function renderRobotGameExpectError(
  props: Record<string, unknown>,
  pattern?: RegExp,
) {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const { lastFrame } = renderRobotGame(props);
  consoleSpy.mockRestore();
  const frame = stripAnsi(lastFrame() ?? "");
  if (pattern) {
    return { frame, hasError: frame.includes("ERROR") && pattern.test(frame) };
  }
  return { frame, hasError: frame.includes("ERROR") };
}

export function renderRobotGameExpectNoError(props: Record<string, unknown>) {
  const { lastFrame } = renderRobotGame(props);
  const frame = stripAnsi(lastFrame() ?? "");
  return { frame, hasError: frame.includes("ERROR") };
}

/**
 * BFS maze solver. Given a maze art string and a start position (in maze
 * coordinates), returns a sequence of {dx, dy} moves to reach any cell
 * adjacent to (but outside) the maze bounding box. Returns null if no
 * path exists.
 */
export function solveMaze(
  mazeArt: string,
  startX: number,
  startY: number,
): { dx: number; dy: number }[] | null {
  const lines = mazeArt.split("\n");
  const h = lines.length;
  const w = Math.max(...lines.map((l) => l.length));

  const isWall = (x: number, y: number): boolean => {
    if (y < 0 || y >= h || x < 0 || x >= w) return false;
    return (lines[y]?.[x] ?? " ") !== " ";
  };

  const isExit = (x: number, y: number): boolean =>
    x < 0 || x >= w || y < 0 || y >= h;

  type State = { x: number; y: number; path: { dx: number; dy: number }[] };
  const queue: State[] = [{ x: startX, y: startY, path: [] }];
  const visited = new Set<string>();
  visited.add(`${startX},${startY}`);

  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;
    for (const { dx, dy } of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (isExit(nx, ny)) return [...path, { dx, dy }];
      const key = `${nx},${ny}`;
      if (visited.has(key) || isWall(nx, ny)) continue;
      visited.add(key);
      queue.push({ x: nx, y: ny, path: [...path, { dx, dy }] });
    }
  }
  return null;
}
