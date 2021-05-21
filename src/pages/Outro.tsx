import React, { useEffect, useState } from "react";
import { Text, useInput, Box, useApp } from "ink";
import useStdoutDimensions from "ink-use-stdout-dimensions";
import figlet from "figlet";

import { myFace } from "../data/ascii";
import useAccumulate from "../hooks/useAccumulate";
import useBlink from "../hooks/useBlink";

const Outro = () => {
  const messages = ["Thanks\nFor\nPlaying\n:)", "Press\nQ\nTo Quit\n:("];

  const [messageIndex, setMessageIndex] = useState(0);
  const [cols, rows] = useStdoutDimensions();

  const [index, setIndex] = useAccumulate({
    end: messages[messageIndex].length,
    step: 1,
    interval: 300,
    intervalFluctuation: 50,
  });

  const blink = useBlink({ interval: 300 });
  const { exit } = useApp();

  useInput((input) => {
    if (input.toUpperCase() === "Q") {
      exit();
    }
  });

  useEffect(() => {
    if (messageIndex === 0 && index === messages[0].length) {
      const timerId = setTimeout(() => {
        setMessageIndex(1);
        setIndex(0);
      }, 1000);

      return () => clearTimeout(timerId);
    }
  }, [index]);

  const str = messages[messageIndex].slice(0, index) + (blink ? "_" : " ");

  return (
    <Box
      justifyContent="space-around"
      alignItems="center"
      width={cols}
      height={rows}
    >
      <Box flexDirection="column" alignItems="center">
        <Box>
          <Text>{myFace}</Text>
        </Box>
        <Text>Spawned from the mind of </Text>
        <Text color="green">Ian Haggerty</Text>
        <Text color="cyan" dimColor={true}>
          (https://github.com/ianhaggerty)
        </Text>
      </Box>
      <Box>
        <Text>{figlet.textSync(str, "ANSI Regular")}</Text>
      </Box>
    </Box>
  );
};

export default Outro;
