import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const artDir = path.resolve(path.dirname(__filename), "..", "..", "art");

const readArt = (file: string) =>
  fs.readFileSync(path.join(artDir, file), "utf8");

export const ian2 = readArt("ian.txt");
export const robotMeBaby = readArt("robot-me-baby.txt");
export const myFace = readArt("my-face.txt");
