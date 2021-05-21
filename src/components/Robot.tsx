import React from "react";
import { Box, Text } from "ink";
import Robot from "../models/Robot";

import { Color } from "../data/colors";

type RobotProps = {
  robot: Robot;
  color?: Color;
};

const RobotCmpt = ({ robot, color = Color.MUTED_WHITE }: RobotProps) => (
  <Box flexDirection="column" alignItems="center" justifyContent="center">
    <Text color={color}>{robot.toString()}</Text>
    <Text color="magentaBright">{robot.name}</Text>
    {robot.isExploded ? <Text color="red">is no more 😥</Text> : null}
  </Box>
);

export default RobotCmpt;
