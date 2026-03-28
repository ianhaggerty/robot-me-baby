import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const artDir = path.resolve(path.dirname(__filename), "..", "..", "art");

const readArt = (file: string) =>
  fs.readFileSync(path.join(artDir, file), "utf8");

export type ExplosionRawData = {
  str: string;
};

const explosions: Array<ExplosionRawData> = [
  { str: readArt("explosion-1.txt") },
];

export default explosions;
