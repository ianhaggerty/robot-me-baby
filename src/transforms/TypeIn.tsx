import React, { PropsWithChildren, useEffect, useState } from "react";
import { Transform } from "ink";

type TypeInProps = PropsWithChildren<{
  interval?: number;
  intervalRandomness?: number;
  blink?: boolean;
  blinkInterval?: number;
  blinkSequence?: Array<string>;
  isActive?: boolean;
  onEnd?: () => void;
}>;

const TypeIn = ({
  interval = 75,
  intervalRandomness = 50,
  blink = true,
  blinkInterval = 200,
  blinkSequence = ["_", " "],
  isActive = true,
  children,
}: TypeInProps) => {
  // next character to render
  const [index, setIndex] = useState(0);
  const [blinkIndex, setBlinkIndex] = useState(0);

  useEffect(() => {
    if (isActive) {
      const timerId = setTimeout(() => {
        setIndex((prevIndex) => prevIndex + 1);
      }, Math.max(0, interval + intervalRandomness * Math.random()));

      return () => clearTimeout(timerId);
    }
  }, [index, isActive]);

  useEffect(() => {
    if (blink) {
      const timerId = setTimeout(() => {
        setBlinkIndex(
          (prevBlinkIndex) => (prevBlinkIndex + 1) % blinkSequence.length
        );
      }, blinkInterval);

      return () => clearTimeout(timerId);
    }
  }, [blinkIndex]);

  const transform = (output: string) =>
    output.slice(0, index) +
    (blink ? blinkSequence[blinkIndex] : "") +
    output.slice(index).replace(/\w/g, " ");

  return <Transform transform={transform}>{children}</Transform>;
};

export default TypeIn;
