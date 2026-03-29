import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Text, useApp } from "ink";
import useStdoutDimensions from "../hooks/useStdoutDimensions.js";
import { useNavigate } from "react-router";

import { selectNext, randomSelect } from "../utility/array.js";
import { generateName } from "../utility/string.js";
import { DirectionX, Key } from "../utility/enums.js";
import { playSound, Sounds } from "../assets/sounds.js";
import {
  bboxIsValid,
  bboxInBounds,
  bboxOverlap,
  findValidPosition,
  type BBox,
} from "../utility/bbox.js";

import KeyPrompt from "../components/KeyPrompt.js";
import RobotCmpt from "../components/Robot.js";
import ExplosionCmpt from "../components/Explosion.js";
import Separator from "../components/Separator.js";
import Robot from "../models/Robot.js";
import Explosion from "../models/Explosion.js";
import rawRobots from "../assets/robots.js";
import colors from "../assets/colors.js";
import rawExplosions from "../assets/explosions.js";

const robotTemplates = rawRobots.map(
  (raw) =>
    new Robot({
      str: raw.str,
      direction: raw.direction,
      name: generateName(),
    }),
);

const explosions = rawExplosions.map((raw) => new Explosion(raw));

type RobotEntry = { robot: Robot; x: number; y: number };

type RobotGameProps = {
  initialRobot?: Robot[] | Robot;
  initialSelected?: number;
  initialX?: number[] | number;
  initialY?: number[] | number;
};

function entryBBox(entry: RobotEntry): BBox {
  return {
    x: entry.x,
    y: entry.y,
    width: entry.robot.width,
    height: entry.robot.height,
  };
}

function normalizeProps(
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
        { robot: initialRobot, x: (initialX as number) ?? 0, y: (initialY as number) ?? 0 },
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
      if (bboxOverlap(bbox, entryBBox(entries[j]))) {
        throw new Error(`Robot ${i} and ${j} bounding boxes overlap`);
      }
    }
  }

  return { entries, selected: initialSelected };
}

const RobotGame = (props: RobotGameProps = {}) => {
  const [columns, rows] = useStdoutDimensions();
  const windowHeight = rows ?? 24;
  const windowWidth = columns - 27;

  const initial = useMemo(
    () => normalizeProps(props, windowWidth, windowHeight),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [robots, setRobots] = useState<RobotEntry[]>(initial.entries);
  const [selectedIndex, setSelectedIndex] = useState(initial.selected);
  const [explodingIndex, setExplodingIndex] = useState<number | null>(null);
  const [isStomping, setIsStomping] = useState(false);
  const [moveCounter, setMoveCounter] = useState(0);

  const { exit } = useApp();
  const navigate = useNavigate();

  const isExploding = explodingIndex !== null;
  const safeIndex = Math.min(selectedIndex, robots.length - 1);
  const selected = robots[safeIndex] as RobotEntry | undefined;
  const selectedRobot = selected?.robot;
  const isRobotAvailable =
    !!selectedRobot && !selectedRobot.isExploded && !isExploding;

  const otherBBoxes = (excludeIndex: number): BBox[] =>
    robots
      .filter((_, i) => i !== excludeIndex)
      .map(entryBBox);

  const updateSelected = (fn: (entry: RobotEntry) => RobotEntry) => {
    setRobots((prev) =>
      prev.map((entry, i) => (i === safeIndex ? fn(entry) : entry)),
    );
  };

  // --- Sound actions ---
  const sayYes = () => playSound(Sounds.Yes);
  const sayNo = () => playSound(Sounds.No);
  const sayIamRobot = () =>
    playSound([Sounds.Speak, Sounds.IamRobot][Math.floor(Math.random() * 2)]);

  // --- Robot actions ---
  const changeRobot = () => {
    if (!selected || !isRobotAvailable) return;
    const next = selectNext(
      selected.robot,
      robotTemplates,
      (r1, r2) => r1.name === r2.name,
    );
    const newBBox: BBox = {
      x: selected.x,
      y: selected.y,
      width: next.width,
      height: next.height,
    };
    if (!bboxIsValid(newBBox, otherBBoxes(safeIndex), windowWidth, windowHeight)) {
      return;
    }
    playSound(Sounds.Confirm, 0.2);
    updateSelected((e) => ({ ...e, robot: next }));
  };

  const changeColor = () => {
    if (!isRobotAvailable) return;
    playSound(Sounds.Glitch, 0.2);
    updateSelected((e) => ({
      ...e,
      robot: e.robot.setColor(selectNext(e.robot.color, colors)),
    }));
  };

  // --- Movement ---
  const tryMove = (dx: number, dy: number): boolean => {
    if (!selected || !isRobotAvailable) return false;
    const newBBox: BBox = {
      x: selected.x + dx,
      y: selected.y + dy,
      width: selected.robot.width,
      height: selected.robot.height,
    };
    if (!bboxIsValid(newBBox, otherBBoxes(safeIndex), windowWidth, windowHeight)) {
      playSound(Sounds.Wrong);
      return false;
    }
    updateSelected((e) => ({ ...e, x: e.x + dx, y: e.y + dy }));
    setMoveCounter((c) => c + 1);
    return true;
  };

  const moveUp = () => tryMove(0, -1);
  const moveDown = () => tryMove(0, 1);

  const moveLeft = () => {
    if (!selected || !isRobotAvailable) return false;
    if (selected.robot.direction !== DirectionX.Left) {
      updateSelected((e) => ({
        ...e,
        robot: e.robot.setDirection(DirectionX.Left),
      }));
      setMoveCounter((c) => c + 1);
      return true;
    }
    return tryMove(-1, 0);
  };

  const moveRight = () => {
    if (!selected || !isRobotAvailable) return false;
    if (selected.robot.direction !== DirectionX.Right) {
      updateSelected((e) => ({
        ...e,
        robot: e.robot.setDirection(DirectionX.Right),
      }));
      setMoveCounter((c) => c + 1);
      return true;
    }
    return tryMove(1, 0);
  };

  // --- Create / Select ---
  const createRobot = () => {
    if (isExploding) return;
    const template = randomSelect(robotTemplates)
      .setDirection(Math.random() > 0.5 ? DirectionX.Right : DirectionX.Left)
      .setName(generateName());
    const allBBoxes = robots.map(entryBBox);
    const pos = findValidPosition(
      template.width,
      template.height,
      allBBoxes,
      windowWidth,
      windowHeight,
    );
    if (!pos) {
      playSound(Sounds.Wrong);
      return;
    }
    playSound(Sounds.Confirm, 0.2);
    setRobots((prev) => [...prev, { robot: template, x: pos.x, y: pos.y }]);
    setSelectedIndex(robots.length);
  };

  const cycleSelection = () => {
    if (isExploding || robots.length <= 1) return;
    playSound(Sounds.Confirm, 0.2);
    setSelectedIndex((prev) => (prev + 1) % robots.length);
  };

  // --- Explosion ---
  const explodingRef = useRef<number | null>(null);

  const makeExplode = () => {
    if (isExploding || !selected) return;
    playSound(Sounds.Explode, 1);

    const idx = safeIndex;
    setExplodingIndex(idx);
    explodingRef.current = idx;

    // Scramble all OTHER robots
    setRobots((prev) =>
      prev.map((entry, i) =>
        i === idx ? entry : { ...entry, robot: entry.robot.explode() },
      ),
    );

    setTimeout(() => {
      const removedIdx = explodingRef.current!;
      setRobots((prev) => {
        const remaining = prev.filter((_, i) => i !== removedIdx);
        // Scramble remaining once more
        return remaining.map((e) => ({ ...e, robot: e.robot.explode() }));
      });
      setSelectedIndex(0);
      setExplodingIndex(null);
      explodingRef.current = null;
    }, 2000);
  };

  // --- Effects ---
  useEffect(() => playSound(Sounds.Intro, 0.3), []);

  useEffect(() => {
    if (!isStomping) {
      setIsStomping(true);
      playSound(Sounds.Stomps);
      setTimeout(() => setIsStomping(false), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCounter]);

  // End game when no robots remain
  useEffect(() => {
    if (robots.length === 0 && !isExploding) {
      navigate("/outro");
    }
  }, [robots.length, isExploding, navigate]);

  // --- Render ---
  const explodingEntry = explodingIndex !== null ? robots[explodingIndex] : null;
  const croppedExplosion =
    explodingEntry
      ? explosions[0].crop(
          windowWidth - explodingEntry.x,
          windowHeight - explodingEntry.y,
        )
      : null;

  return (
    <>
      <Box alignItems="flex-start">
        <Box width={windowWidth} height={windowHeight}>
          {isExploding && explodingEntry && croppedExplosion ? (
            <Box
              position="absolute"
              marginLeft={explodingEntry.x}
              marginTop={explodingEntry.y}
            >
              <ExplosionCmpt explosion={croppedExplosion} />
            </Box>
          ) : (
            robots.map((entry, i) => (
              <Box
                key={i}
                position="absolute"
                marginLeft={entry.x}
                marginTop={entry.y}
              >
                <RobotCmpt
                  robot={entry.robot}
                  dimColor={i !== safeIndex}
                />
              </Box>
            ))
          )}
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Box flexDirection="column">
            <Text color="gray" italic>
              {"   "}
              <Text color="cyan">↹ tab</Text> to cycle focus
            </Text>
            <Text color="gray" italic>
              {"   "}
              <Text color="cyan">⏎ enter</Text> to activate
            </Text>
          </Box>
          <Separator width={20} char="=" />
          <Box flexDirection="column">
            <KeyPrompt
              button={Key.LEFT_ARROW}
              verb="move"
              noun="left"
              onPressed={moveLeft}
              isPressed={(_, keyMeta) => keyMeta.leftArrow}
              isActive={isRobotAvailable}
            />
            <KeyPrompt
              button={Key.UP_ARROW}
              verb="move"
              noun="up"
              onPressed={moveUp}
              isPressed={(_, keyMeta) => keyMeta.upArrow}
              isActive={isRobotAvailable}
            />
            <KeyPrompt
              button={Key.RIGHT_ARROW}
              verb="move"
              noun="right"
              onPressed={moveRight}
              isPressed={(_, keyMeta) => keyMeta.rightArrow}
              isActive={isRobotAvailable}
            />
            <KeyPrompt
              button={Key.DOWN_ARROW}
              verb="move"
              noun="down"
              onPressed={moveDown}
              isPressed={(_, key) => key.downArrow}
              isActive={isRobotAvailable}
            />
            <Separator />
            <KeyPrompt
              button={Key.Y}
              verb="say"
              noun="yes"
              onPressed={sayYes}
              isPressed={(input) => input.toUpperCase() === Key.Y}
              isActive={isRobotAvailable}
            />
            <KeyPrompt
              button={Key.N}
              verb="say"
              noun="no"
              onPressed={sayNo}
              isPressed={(input) => input.toUpperCase() === Key.N}
              isActive={isRobotAvailable}
            />
            <KeyPrompt
              button={Key.I}
              verb="say"
              noun="Robot"
              onPressed={sayIamRobot}
              isPressed={(input) => input.toUpperCase() === Key.I}
              isActive={isRobotAvailable}
            />
            <Separator />
            <KeyPrompt
              button={Key.C}
              verb="change"
              noun="color"
              onPressed={changeColor}
              isPressed={(input) => input.toUpperCase() === Key.C}
              isActive={isRobotAvailable}
            />
            <KeyPrompt
              button={Key.R}
              verb="change"
              noun="robot"
              onPressed={changeRobot}
              isPressed={(input) => input.toUpperCase() === Key.R}
              isActive={isRobotAvailable}
            />
            <Separator />
            <KeyPrompt
              button={Key.Z}
              verb="create"
              noun="robot"
              onPressed={createRobot}
              isPressed={(input) => input.toUpperCase() === Key.Z}
              isActive={!isExploding}
            />
            <KeyPrompt
              button={Key.X}
              verb="select"
              noun="robot"
              onPressed={cycleSelection}
              isPressed={(input) => input.toUpperCase() === Key.X}
              isActive={!isExploding}
            />
            <Separator width={20} char="=" />
            <KeyPrompt
              button={Key.E}
              noun="explode"
              onPressed={makeExplode}
              isPressed={(input) => input.toUpperCase() === Key.E}
              isActive={!isExploding}
            />
            <KeyPrompt
              button={Key.Q}
              noun="quit"
              onPressed={() => navigate("/outro")}
              isPressed={(input) => input.toUpperCase() === Key.Q}
              isActive
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default RobotGame;
