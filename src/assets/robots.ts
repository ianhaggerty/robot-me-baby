import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DirectionX } from "../utility/enums.js";

const __filename = fileURLToPath(import.meta.url);
const artDir = path.resolve(path.dirname(__filename), "..", "..", "art");

const readArt = (file: string) =>
  fs.readFileSync(path.join(artDir, file), "utf8");

export type RawRobotData = {
  str: string;
  direction: DirectionX;
};

const robots: Array<RawRobotData> = [
  { str: readArt("robot-1.txt"), direction: DirectionX.Left },
  { str: readArt("robot-2.txt"), direction: DirectionX.Right },
  { str: readArt("robot-3.txt"), direction: DirectionX.Right },
  { str: readArt("robot-4.txt"), direction: DirectionX.Right },
  { str: readArt("robot-5.txt"), direction: DirectionX.Right },
  { str: readArt("robot-6.txt"), direction: DirectionX.Right },
];

export default robots;
