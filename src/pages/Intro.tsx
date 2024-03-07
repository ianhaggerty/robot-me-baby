import React, { useEffect, useState } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { useHistory } from "react-router";
import useStdoutDimensions from "ink-use-stdout-dimensions";

import { ian2, robotMeBaby } from "../data/ascii";
import FadeIn from "../transforms/FadeIn";
import { playSound, Sounds } from "../sounds/index";
import TypeIn from "../transforms/TypeIn";
import Delayed from "../components/Delayed";

const Intro = () => {
  const maxSpaces = 3;
  const maxTime = 30000;
  const interval = 1000;

  const history = useHistory();
  const [cols, rows] = useStdoutDimensions();
  const { exit } = useApp();

  const [spaces, setSpaces] = useState(maxSpaces);
  const [timer, setTimer] = useState(maxTime);

  // on component mount, play sound
  useEffect(() => {
    playSound(Sounds.TypeBeep, 0.1);
  }, []);

  // if space if pressed, decrement space count
  useInput((input) => {
    if (input === " ") {
      setSpaces((spaces) => spaces - 1);
    }
  });

  // if space is pressed enough, navigate to app
  useEffect(() => {
    if (spaces === 0) {
      return history.push("/robot-me-baby");
    }
  }, [spaces]);

  // it timer runs out, exit app
  useEffect(() => {
    if (timer <= 0) {
      exit();
    }

    const timerId = setTimeout(() => {
      setTimer((timer) => timer - interval);
    }, interval);

    return () => {
      clearTimeout(timerId);
    };
  }, [timer]);

  return (
    <Box
      justifyContent="space-around"
      alignItems="center"
      flexDirection="column"
      minHeight={rows}
      width={cols}
    >
      <Box>
        <Text color="yellow" dimColor={true}>
          <FadeIn>
            <Text>{robotMeBaby}</Text>
          </FadeIn>
        </Text>
      </Box>
      <Box flexDirection="column" alignItems="center">
        <Box flexDirection="column" alignItems="center">
          <Delayed delay={2000}>
            <TypeIn>
              <>
                <Text>A little CLI game - Made By</Text>
              </>
            </TypeIn>
          </Delayed>
        </Box>
      </Box>
      <Box>
        <Delayed delay={4500}>
          <Text color="cyan" dimColor={true}>
            <FadeIn>
              <Text>{ian2}</Text>
            </FadeIn>
          </Text>
        </Delayed>
      </Box>
      <Box flexDirection="column" alignItems="center">
        <Delayed delay={6500}>
          <Text color="gray">
            <FadeIn>
              <Text>
                Press <Text color="yellow">space</Text>{" "}
                <Text color="cyan">{spaces}</Text> more times
              </Text>
            </FadeIn>
          </Text>
        </Delayed>
        <Delayed delay={8500}>
          <Text color="gray" dimColor={true}>
            <FadeIn>
              <Text>{timer / 1000} seconds left</Text>
            </FadeIn>
          </Text>
        </Delayed>
      </Box>
    </Box>
  );
};

export default Intro;
