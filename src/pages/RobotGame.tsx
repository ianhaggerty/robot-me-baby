import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import useStdoutDimensions from "ink-use-stdout-dimensions";
import { useHistory } from "react-router";

import { selectNext } from "../utility/array";
import { DirectionX, Key } from "../utility/enums";
import { playSound, Sounds } from "../sounds/index";

import KeyPrompt from "../components/KeyPrompt";
import RobotCmpt from "../components/Robot";
import ExplosionCmpt from "../components/Explosion";
import Separator from "../components/Separator";
import robots from "../data/robots";
import colors from "../data/colors";
import explosions from "../data/explosions";

const RobotGame = () => {
  // react state
  const [color, setColor] = useState(colors[0]);
  const [robot, setRobot] = useState(robots[0]);
  const [paddingLeft, setPaddingLeft] = useState(0);
  const [paddingTop, setPaddingTop] = useState(0);

  // callbacks
  const [isExploding, setIsExploding] = useState(false);
  const [isStomping, setIsStomping] = useState(false);

  // terminal dimensions
  const [columns, rows] = useStdoutDimensions();

  // used to terminate app
  const { exit } = useApp();

  // routing logic
  const history = useHistory();

  const sayYes = () => playSound(Sounds.Yes);
  const sayNo = () => playSound(Sounds.No);
  const sayIamRobot = () =>
    playSound([Sounds.Speak, Sounds.IamRobot][Math.floor(Math.random() * 2)]);

  const windowHeight = rows;
  const windowWidth = columns - 27; // TODO soft code?
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

      // TODO refactor out to React-Router?
      // TODO will throw if component unmounted
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
      // TODO will throw if component unmounted
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
              onPressed={() => history.push("/outro")}
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
