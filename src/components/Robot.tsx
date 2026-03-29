import React from "react";
import { Box, Text } from "ink";
import Robot from "../models/Robot.js";

const RobotCmpt = ({
  robot,
  dimColor = false,
}: {
  robot: Robot;
  dimColor?: boolean;
}) => (
  <Box flexDirection="column" alignItems="center" justifyContent="center">
    <Text color={robot.color} dimColor={dimColor}>
      {robot.toString()}
    </Text>
    <Text color="magentaBright" dimColor={dimColor}>
      {robot.name}
    </Text>
    {robot.isExploded ? (
      <Text color="red" dimColor={dimColor}>
        is no more 😥
      </Text>
    ) : null}
  </Box>
);

export default RobotCmpt;
