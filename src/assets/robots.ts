import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const artDir = path.resolve(path.dirname(__filename), "..", "..", "art");

const readArt = (file: string) =>
  fs.readFileSync(path.join(artDir, file), "utf8");

export type RawRobotData = {
  str: string;
  direction: "left" | "right";
};

const robots: Array<RawRobotData> = [
  { str: readArt("robot-1.txt"), direction: "left" },
  { str: readArt("robot-2.txt"), direction: "right" },
  { str: readArt("robot-3.txt"), direction: "right" },
  { str: readArt("robot-4.txt"), direction: "right" },
  { str: readArt("robot-5.txt"), direction: "right" },
  { str: readArt("robot-6.txt"), direction: "right" },
];

export default robots;
