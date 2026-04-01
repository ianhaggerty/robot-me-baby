import { DirectionX } from "../utility/enums.js";
import { readArt } from "./readArt.js";

export type RawRobotData = {
  str: string;
  direction: DirectionX;
};

const robots: Array<RawRobotData> = [
  { str: readArt("robots/robot-1.txt"), direction: DirectionX.Left },
  { str: readArt("robots/robot-2.txt"), direction: DirectionX.Right },
  { str: readArt("robots/robot-3.txt"), direction: DirectionX.Right },
  { str: readArt("robots/robot-4.txt"), direction: DirectionX.Right },
  { str: readArt("robots/robot-5.txt"), direction: DirectionX.Right },
  { str: readArt("robots/robot-6.txt"), direction: DirectionX.Right },
];

export default robots;
