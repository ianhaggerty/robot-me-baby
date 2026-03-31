import { generateName } from "../utility/string.js";
import { DirectionX } from "../utility/enums.js";
import { bboxInBounds, type BBox } from "../utility/bbox.js";
import {
  hasCharacterCollision,
  type PositionedArt,
} from "../utility/collision.js";

import Robot from "../models/Robot.js";
import Explosion from "../models/Explosion.js";
import rawRobots from "../assets/robots.js";
import rawExplosions from "../assets/explosions.js";

export const robotTemplates = rawRobots.map(
  (raw) =>
    new Robot({
      str: raw.str,
      direction: raw.direction,
      name: generateName(),
    }),
);

export const explosions = rawExplosions.map((raw) => new Explosion(raw));

export type RobotEntry = { robot: Robot; x: number; y: number };

export type RobotGameProps = {
  initialRobot?: Robot[] | Robot;
  initialSelected?: number;
  initialX?: number[] | number;
  initialY?: number[] | number;
};

export function entryBBox(entry: RobotEntry): BBox {
  return {
    x: entry.x,
    y: entry.y,
    width: entry.robot.width,
    height: entry.robot.height,
  };
}

export function entryPositionedArt(entry: RobotEntry): PositionedArt {
  return {
    art: entry.robot.toString(),
    x: entry.x,
    y: entry.y,
    width: entry.robot.width,
    height: entry.robot.height,
  };
}

export function normalizeProps(
  props: RobotGameProps,
  windowWidth: number,
  windowHeight: number,
): { entries: RobotEntry[]; selected: number } {
  const { initialRobot, initialSelected, initialX, initialY } = props;

  if (initialRobot === undefined) {
    return {
      entries: [
        {
          robot: robotTemplates[0].setDirection(DirectionX.Right),
          x: 0,
          y: 0,
        },
      ],
      selected: 0,
    };
  }

  if (!Array.isArray(initialRobot)) {
    if (initialSelected !== undefined) {
      throw new Error(
        "initialSelected must be undefined when initialRobot is a single Robot",
      );
    }
    if (initialX !== undefined && typeof initialX !== "number") {
      throw new Error(
        "initialX must be a number when initialRobot is a single Robot",
      );
    }
    if (initialY !== undefined && typeof initialY !== "number") {
      throw new Error(
        "initialY must be a number when initialRobot is a single Robot",
      );
    }
    return {
      entries: [
        {
          robot: initialRobot,
          x: (initialX as number) ?? 0,
          y: (initialY as number) ?? 0,
        },
      ],
      selected: 0,
    };
  }

  if (
    initialSelected === undefined ||
    initialSelected < 0 ||
    initialSelected >= initialRobot.length
  ) {
    throw new Error(
      "initialSelected must be a valid index for initialRobot array",
    );
  }
  if (!Array.isArray(initialX) || initialX.length !== initialRobot.length) {
    throw new Error("initialX must be an array matching initialRobot length");
  }
  if (!Array.isArray(initialY) || initialY.length !== initialRobot.length) {
    throw new Error("initialY must be an array matching initialRobot length");
  }

  const entries: RobotEntry[] = initialRobot.map((robot, i) => ({
    robot,
    x: initialX[i],
    y: initialY[i],
  }));

  for (let i = 0; i < entries.length; i++) {
    const bbox = entryBBox(entries[i]);
    if (!bboxInBounds(bbox, windowWidth, windowHeight)) {
      throw new Error(`Robot ${i} bounding box escapes the window`);
    }
    for (let j = i + 1; j < entries.length; j++) {
      if (
        hasCharacterCollision(
          entryPositionedArt(entries[i]),
          entryPositionedArt(entries[j]),
        )
      ) {
        throw new Error(`Robot ${i} and ${j} characters overlap`);
      }
    }
  }

  return { entries, selected: initialSelected };
}
