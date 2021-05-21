import React from "react";
import { Box, Text, BoxProps } from "ink";

interface SeparatorProps extends BoxProps {
  width?: number;
  char?: string;
}

const Separator = ({
  width = 8,
  char = "-",
  ...otherProps
}: SeparatorProps) => {
  return (
    <Box justifyContent="center" {...otherProps}>
      <Text color="gray">{"".padEnd(width, char)}</Text>
    </Box>
  );
};

export default Separator;
