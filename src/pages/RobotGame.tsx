import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import useStdoutDimensions from "../hooks/useStdoutDimensions.js";
import { useNavigate } from "react-router";

import { selectNext } from "../utility/array.js";
import { generateName } from "../utility/string.js";
import { DirectionX, Key } from "../utility/enums.js";
import { playSound, Sounds } from "../assets/sounds.js";

import KeyPrompt from "../components/KeyPrompt.js";
import RobotCmpt from "../components/Robot.js";
import ExplosionCmpt from "../components/Explosion.js";
import Separator from "../components/Separator.js";
import Robot from "../models/Robot.js";
import Explosion from "../models/Explosion.js";
import { Color } from "../assets/colors.js";
import rawRobots from "../assets/robots.js";
import colors from "../assets/colors.js";
import rawExplosions from "../assets/explosions.js";

const robots = rawRobots.map(
  (raw) =>
    new Robot({
      str: raw.str,
      direction: raw.direction === "right" ? DirectionX.Right : DirectionX.Left,
      name: generateName(),
    })
);

const explosions = rawExplosions.map((raw) => new Explosion(raw));

type RobotGameProps = {
  initialRobot?: Robot;
  initialColor?: Color;
  initialDirection?: DirectionX;
  initialX?: number;
  initialY?: number;
};

const RobotGame = ({
  initialRobot = robots[0],
  initialColor = colors[0],
  initialDirection,
  initialX = 0,
  initialY = 0,
}: RobotGameProps = {}) => {
  const startRobot =
    initialDirection != null && initialDirection !== initialRobot.direction
      ? initialRobot.setDirection(initialDirection)
      : initialRobot;

  // react state
  const [color, setColor] = useState(initialColor);
  const [robot, setRobot] = useState(startRobot);
  const [paddingLeft, setPaddingLeft] = useState(initialX);
  const [paddingTop, setPaddingTop] = useState(initialY);

  // callbacks
  const [isExploding, setIsExploding] = useState(false);
  const [isStomping, setIsStomping] = useState(false);

  // terminal dimensions
  const [columns, rows] = useStdoutDimensions();

  // used to terminate app
  const { exit } = useApp();

  // routing logic
  const navigate = useNavigate();

  const sayYes = () => playSound(Sounds.Yes);
  const sayNo = () => playSound(Sounds.No);
  const sayIamRobot = () =>
    playSound([Sounds.Speak, Sounds.IamRobot][Math.floor(Math.random() * 2)]);

  const windowHeight = rows;
  const windowWidth = columns - 27;
  const isRobotAvailable = !robot.isExploded && !isExploding;

  const changeRobot = () => {
    playSound(Sounds.Confirm, 0.2);
    setRobot((prevRobot) =>
      selectNext(prevRobot, robots, (r1, r2) => r1.name === r2.name)
    );
  };
  const changeColor = () => {
    playSound(Sounds.Glitch, 0.2);
    setColor((prevColor) => selectNext(prevColor, colors));
  };

  const moveUp = () => {
    if (paddingTop <= 0) {
      return false;
    }
    setPaddingTop((prevPaddingTop) => prevPaddingTop - 1);
    return true;
  };
  const moveLeft = () => {
    if (paddingLeft <= 0) {
      return false;
    }
    setRobot((prevRobot) => prevRobot.setDirection(DirectionX.Left));
    setPaddingLeft((prevPaddingLeft) => prevPaddingLeft - 1);
    return true;
  };
  const moveRight = () => {
    if (paddingLeft + robot.width >= windowWidth - 2) {
      return false;
    }
    setRobot((prevRobot) => prevRobot.setDirection(DirectionX.Right));
    setPaddingLeft((prevPaddingLeft) => prevPaddingLeft + 1);
    return true;
  };
  const moveDown = () => {
    setPaddingTop((prevPaddingTop) => prevPaddingTop + 1);
  };

  const makeExplode = () => {
    if (!robot.isExploded) {
      setRobot((prevRobot) => prevRobot.explode());
      playSound(Sounds.Explode, 1);

      setIsExploding(true);
      setTimeout(() => {
        setIsExploding(false);
      }, 2000);
    }
  };

  // Introduction Sound
  useEffect(() => playSound(Sounds.Intro, 0.3), []);

  useEffect(() => {
    if (!isStomping) {
      setIsStomping(true);
      playSound(Sounds.Stomps);
      setTimeout(() => setIsStomping(false), 1000);
    }
  }, [paddingLeft, paddingTop]);

  return (
    <>
      <Box alignItems="flex-start">
        <Box
          paddingLeft={paddingLeft}
          paddingTop={paddingTop}
          height={windowHeight}
          width={windowWidth}
          alignItems="flex-start"
        >
          {isExploding ? (
            <ExplosionCmpt explosion={explosions[0]} />
          ) : (
            <RobotCmpt robot={robot} color={color} />
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
              isActive={!isExploding}
            />
            <Separator width={20} char="=" />
            <KeyPrompt
              button={Key.E}
              noun="explode"
              onPressed={makeExplode}
              isPressed={(input) => input.toUpperCase() === Key.E}
              isActive={isRobotAvailable}
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
