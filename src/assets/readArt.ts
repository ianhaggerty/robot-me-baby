import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const artDir = path.resolve(path.dirname(__filename), "..", "..", "art");

export const readArt = (file: string) =>
  fs.readFileSync(path.join(artDir, file), "utf8");
