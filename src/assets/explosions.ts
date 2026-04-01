import { readArt } from "./readArt.js";

export type ExplosionRawData = {
  str: string;
};

const explosions: Array<ExplosionRawData> = [
  { str: readArt("explosions/explosion-1.txt") },
];

export default explosions;
