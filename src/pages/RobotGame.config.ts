import { Key } from "../utility/enums.js";

export const SIDEBAR_WIDTH = 27;
export const DEFAULT_TERMINAL_HEIGHT = 24;
export const EXPLOSION_DURATION_MS = 2000;

export const DISABLED_ACTION_KEYS = new Set([
  Key.Y,
  Key.N,
  Key.I,
  Key.C,
  Key.R,
]);

export const isKeyMatch =
  (key: Key) =>
  (input: string): boolean =>
    input.toUpperCase() === key;
