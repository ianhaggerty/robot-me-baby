import React from "react";
import { Box, Text } from "ink";
import Robot from "../models/Robot.js";

const RobotCmpt = ({ robot }: { robot: Robot }) => (
  <Box flexDirection="column" alignItems="center" justifyContent="center">
    <Text color={robot.color}>{robot.toString()}</Text>
    <Text color="magentaBright">{robot.name}</Text>
    {robot.isExploded ? <Text color="red">is no more 😥</Text> : null}
  </Box>
);

export default RobotCmpt;
