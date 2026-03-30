import React from "react";
import { Box, Text } from "ink";

import { Key } from "../utility/enums.js";
import { isKeyMatch } from "../pages/RobotGame.config.js";

import KeyPrompt from "./KeyPrompt.js";
import Separator from "./Separator.js";

type SideMenuProps = {
  isRobotAvailable: boolean;
  isExploding: boolean;
  onMoveLeft: () => void;
  onMoveUp: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onSayYes: () => void;
  onSayNo: () => void;
  onSayRobot: () => void;
  onChangeColor: () => void;
  onChangeRobot: () => void;
  onCreateRobot: () => void;
  onSelectRobot: () => void;
  onExplode: () => void;
  onQuit: () => void;
};

const SideMenu = ({
  isRobotAvailable,
  isExploding,
  onMoveLeft,
  onMoveUp,
  onMoveRight,
  onMoveDown,
  onSayYes,
  onSayNo,
  onSayRobot,
  onChangeColor,
  onChangeRobot,
  onCreateRobot,
  onSelectRobot,
  onExplode,
  onQuit,
}: SideMenuProps) => (
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
        onPressed={onMoveLeft}
        isPressed={(_, k) => k.leftArrow}
        isActive={isRobotAvailable}
      />
      <KeyPrompt
        button={Key.UP_ARROW}
        verb="move"
        noun="up"
        onPressed={onMoveUp}
        isPressed={(_, k) => k.upArrow}
        isActive={isRobotAvailable}
      />
      <KeyPrompt
        button={Key.RIGHT_ARROW}
        verb="move"
        noun="right"
        onPressed={onMoveRight}
        isPressed={(_, k) => k.rightArrow}
        isActive={isRobotAvailable}
      />
      <KeyPrompt
        button={Key.DOWN_ARROW}
        verb="move"
        noun="down"
        onPressed={onMoveDown}
        isPressed={(_, k) => k.downArrow}
        isActive={isRobotAvailable}
      />
      <Separator />
      <KeyPrompt
        button={Key.Y}
        verb="say"
        noun="yes"
        onPressed={onSayYes}
        isPressed={isKeyMatch(Key.Y)}
        isActive={isRobotAvailable}
      />
      <KeyPrompt
        button={Key.N}
        verb="say"
        noun="no"
        onPressed={onSayNo}
        isPressed={isKeyMatch(Key.N)}
        isActive={isRobotAvailable}
      />
      <KeyPrompt
        button={Key.I}
        verb="say"
        noun="Robot"
        onPressed={onSayRobot}
        isPressed={isKeyMatch(Key.I)}
        isActive={isRobotAvailable}
      />
      <Separator />
      <KeyPrompt
        button={Key.C}
        verb="change"
        noun="color"
        onPressed={onChangeColor}
        isPressed={isKeyMatch(Key.C)}
        isActive={isRobotAvailable}
      />
      <KeyPrompt
        button={Key.R}
        verb="change"
        noun="robot"
        onPressed={onChangeRobot}
        isPressed={isKeyMatch(Key.R)}
        isActive={isRobotAvailable}
      />
      <Separator width={20} char="=" />
      <KeyPrompt
        button={Key.Z}
        verb="create"
        noun="robot"
        onPressed={onCreateRobot}
        isPressed={isKeyMatch(Key.Z)}
        isActive={!isExploding}
      />
      <KeyPrompt
        button={Key.X}
        verb="select"
        noun="robot"
        onPressed={onSelectRobot}
        isPressed={isKeyMatch(Key.X)}
        isActive={!isExploding}
      />
      <Separator width={20} char="=" />
      <KeyPrompt
        button={Key.E}
        noun="explode"
        onPressed={onExplode}
        isPressed={isKeyMatch(Key.E)}
        isActive={!isExploding}
      />
      <KeyPrompt
        button={Key.Q}
        noun="quit"
        onPressed={onQuit}
        isPressed={isKeyMatch(Key.Q)}
        isActive
      />
    </Box>
  </Box>
);

export default SideMenu;
