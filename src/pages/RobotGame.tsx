import React, { useState, useEffect, useRef } from "react";
import { Box, Text, useInput } from "ink";
import useStdoutDimensions from "../hooks/useStdoutDimensions.js";
import useDebouncedSound from "../hooks/useDebouncedSound.js";
import { useNavigate } from "react-router";

import { selectNext, randomSelect } from "../utility/array.js";
import { generateName } from "../utility/string.js";
import { DirectionX, Key } from "../utility/enums.js";
import { playSound, Sounds } from "../assets/sounds.js";
import {
  resolveMove,
  isCharacterValid,
  findValidPositionByCharacter,
  type PositionedArt,
} from "../utility/collision.js";

import RobotCmpt from "../components/Robot.js";
import ExplosionCmpt from "../components/Explosion.js";
import SideMenu from "../components/SideMenu.js";
import colors from "../assets/colors.js";

import {
  SIDEBAR_WIDTH,
  DEFAULT_TERMINAL_HEIGHT,
  EXPLOSION_DURATION_MS,
  DISABLED_ACTION_KEYS,
} from "./RobotGame.config.js";
import {
  robotTemplates,
  explosions,
  entryPositionedArt,
  normalizeProps,
  type RobotEntry,
  type RobotGameProps,
} from "./RobotGame.helpers.js";

function getNonSpaceSegments(
  line: string,
): { start: number; text: string }[] {
  const segments: { start: number; text: string }[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === " ") {
      i++;
      continue;
    }
    const start = i;
    while (i < line.length && line[i] !== " ") {
      i++;
    }
    segments.push({ start, text: line.substring(start, i) });
  }
  return segments;
}

const RobotGame = (props: RobotGameProps = {}) => {
  const [columns, rows] = useStdoutDimensions();
  const windowHeight = rows ?? DEFAULT_TERMINAL_HEIGHT;
  const windowWidth = columns - SIDEBAR_WIDTH;

  const [initial] = useState(() =>
    normalizeProps(props, windowWidth, windowHeight),
  );

  const [robots, setRobots] = useState<RobotEntry[]>(initial.entries);
  const [selectedIndex, setSelectedIndex] = useState(initial.selected);
  const [explodingIndex, setExplodingIndex] = useState<number | null>(null);

  const navigate = useNavigate();
  const triggerNoOp = useDebouncedSound(Sounds.Wrong);
  const triggerStomp = useDebouncedSound(Sounds.Stomps);

  const isExploding = explodingIndex !== null;
  const safeIndex = Math.min(selectedIndex, robots.length - 1);
  const selected = robots[safeIndex] as RobotEntry | undefined;
  const selectedRobot = selected?.robot;
  const isRobotAvailable =
    !!selectedRobot && !selectedRobot.isExploded && !isExploding;

  const robotArts = (): PositionedArt[] => robots.map(entryPositionedArt);

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
    const newArt: PositionedArt = {
      art: next.toString(),
      x: selected.x,
      y: selected.y,
      width: next.width,
      height: next.height,
    };
    const otherArts = robotArts().filter((_, i) => i !== safeIndex);
    if (!isCharacterValid(newArt, otherArts, windowWidth, windowHeight)) {
      triggerNoOp();
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

    const arts = robotArts();
    const result = resolveMove(
      safeIndex,
      dx,
      dy,
      arts,
      windowWidth,
      windowHeight,
    );

    if (!result) {
      triggerNoOp();
      return false;
    }

    setRobots((prev) =>
      prev.map((entry, i) => ({
        ...entry,
        x: result[i].x,
        y: result[i].y,
      })),
    );
    triggerStomp();
    return true;
  };

  const moveUp = () => tryMove(0, -1);
  const moveDown = () => tryMove(0, 1);

  const moveHorizontal = (direction: DirectionX, dx: number) => {
    if (!selected || !isRobotAvailable) return false;
    if (selected.robot.direction !== direction) {
      updateSelected((e) => ({
        ...e,
        robot: e.robot.setDirection(direction),
      }));
      triggerStomp();
      return true;
    }
    return tryMove(dx, 0);
  };

  const moveLeft = () => moveHorizontal(DirectionX.Left, -1);
  const moveRight = () => moveHorizontal(DirectionX.Right, 1);

  // --- Create / Select ---
  const createRobot = () => {
    if (isExploding) return;
    const template = randomSelect(robotTemplates)
      .setDirection(Math.random() > 0.5 ? DirectionX.Right : DirectionX.Left)
      .setName(generateName());
    const allArts = robotArts();
    const pos = findValidPositionByCharacter(
      template.toString(),
      template.width,
      template.height,
      allArts,
      windowWidth,
      windowHeight,
    );
    if (!pos) {
      triggerNoOp();
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
  const explosionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const makeExplode = () => {
    if (isExploding || !selected) return;
    playSound(Sounds.Explode, 1);

    const idx = safeIndex;
    setExplodingIndex(idx);

    // Scramble all OTHER robots
    setRobots((prev) =>
      prev.map((entry, i) =>
        i === idx ? entry : { ...entry, robot: entry.robot.explode() },
      ),
    );

    explosionTimerRef.current = setTimeout(() => {
      explosionTimerRef.current = null;
      setExplodingIndex(null);
      setRobots((prev) => {
        const remaining = prev.filter((_, i) => i !== idx);
        return remaining.map((e) => ({ ...e, robot: e.robot.explode() }));
      });
      // robots.length is safe here because isExploding blocks all mutations
      setSelectedIndex((prev) => {
        const remainingLength = robots.length - 1;
        if (remainingLength <= 0) return 0;
        return prev >= remainingLength ? 0 : prev;
      });
    }, EXPLOSION_DURATION_MS);
  };

  // Cleanup explosion timer on unmount
  useEffect(() => {
    return () => {
      if (explosionTimerRef.current !== null) {
        clearTimeout(explosionTimerRef.current);
      }
    };
  }, []);

  // Play wrong.mp3 when action keys are pressed on an over-exploded robot
  useInput((input, key) => {
    if (isExploding || !selectedRobot?.isExploded) return;
    const isActionKey =
      key.leftArrow ||
      key.rightArrow ||
      key.upArrow ||
      key.downArrow ||
      key.return ||
      DISABLED_ACTION_KEYS.has(input.toUpperCase() as Key);
    if (isActionKey) {
      triggerNoOp();
    }
  });

  // --- Effects ---
  useEffect(() => playSound(Sounds.Intro, 0.3), []);

  useEffect(() => {
    if (robots.length === 0 && !isExploding) {
      navigate("/outro");
    }
  }, [robots.length, isExploding, navigate]);

  // --- Render ---
  const explodingEntry =
    explodingIndex !== null ? robots[explodingIndex] : null;
  const croppedExplosion = explodingEntry
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
            <>
              {/* Names first (lower z-order) */}
              {robots.map((entry, i) => (
                <Box
                  key={`name-${i}`}
                  position="absolute"
                  marginLeft={
                    entry.x +
                    Math.floor(
                      (entry.robot.width - entry.robot.name.length) / 2,
                    )
                  }
                  marginTop={entry.y + entry.robot.height}
                >
                  <RobotCmpt
                    robot={entry.robot}
                    dimColor={i !== safeIndex}
                    showArt={false}
                  />
                </Box>
              ))}
              {/* Art on top (higher z-order) — render only non-space segments
                  so that spaces are transparent and overlapping bounding boxes
                  display correctly regardless of scene order. */}
              {robots.flatMap((entry, i) => {
                const lines = entry.robot.toString().split("\n");
                return lines.flatMap((line, ly) =>
                  getNonSpaceSegments(line).map((seg, si) => (
                    <Box
                      key={`art-${i}-${ly}-${si}`}
                      position="absolute"
                      marginLeft={entry.x + seg.start}
                      marginTop={entry.y + ly}
                    >
                      <Text
                        color={entry.robot.color}
                        dimColor={i !== safeIndex}
                      >
                        {seg.text}
                      </Text>
                    </Box>
                  )),
                );
              })}
            </>
          )}
        </Box>
        <SideMenu
          isRobotAvailable={isRobotAvailable}
          isExploding={isExploding}
          onMoveLeft={moveLeft}
          onMoveUp={moveUp}
          onMoveRight={moveRight}
          onMoveDown={moveDown}
          onSayYes={sayYes}
          onSayNo={sayNo}
          onSayRobot={sayIamRobot}
          onChangeColor={changeColor}
          onChangeRobot={changeRobot}
          onCreateRobot={createRobot}
          onSelectRobot={cycleSelection}
          onExplode={makeExplode}
          onQuit={() => navigate("/outro")}
        />
      </Box>
    </>
  );
};

export default RobotGame;
