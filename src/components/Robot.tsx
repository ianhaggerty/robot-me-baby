import React from "react";
import { Box, Text } from "ink";
import Robot from "../models/Robot.js";

const RobotCmpt = ({
  robot,
  dimColor = false,
  showArt = true,
  showName = true,
}: {
  robot: Robot;
  dimColor?: boolean;
  showArt?: boolean;
  showName?: boolean;
}) => (
  <Box flexDirection="column" alignItems="center" justifyContent="center">
    {showArt && (
      <Text color={robot.color} dimColor={dimColor}>
        {robot.toString()}
      </Text>
    )}
    {showName && (
      <Text color="magentaBright" dimColor={dimColor}>
        {robot.name}
      </Text>
    )}
    {showName && robot.isExploded ? (
      <Text color="red" dimColor={dimColor}>
        is no more 😥
      </Text>
    ) : null}
  </Box>
);

export default RobotCmpt;
