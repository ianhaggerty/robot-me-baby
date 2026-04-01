import React from "react";
import { Box, Text } from "ink";

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

const TransparentArt = ({
  art,
  x,
  y,
  color,
  dimColor = false,
  keyPrefix,
}: {
  art: string;
  x: number;
  y: number;
  color: string;
  dimColor?: boolean;
  keyPrefix: string;
}) => {
  const lines = art.split("\n");
  return (
    <>
      {lines.flatMap((line, ly) =>
        getNonSpaceSegments(line).map((seg, si) => (
          <Box
            key={`${keyPrefix}-${ly}-${si}`}
            position="absolute"
            marginLeft={x + seg.start}
            marginTop={y + ly}
          >
            <Text color={color} dimColor={dimColor}>
              {seg.text}
            </Text>
          </Box>
        )),
      )}
    </>
  );
};

export default TransparentArt;
