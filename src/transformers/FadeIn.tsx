import React, { PropsWithChildren, useEffect, useState } from "react";
import { Transform } from "ink";

import { sigmoid } from "../utility/maths";

type FadeInProps = PropsWithChildren<{
  inputStart?: number;
  inputEnd?: number;
  interval?: number;
  step?: number;
  isActive?: boolean;
  onEnd?: () => void;
}>;

const FadeIn = ({
  children,
  inputStart = -10,
  inputEnd = 10,
  interval = 100,
  step = 1,
  isActive = true,
  onEnd = () => null,
}: FadeInProps) => {
  const [input, setInput] = useState(inputStart);

  useEffect(() => {
    if (isActive && input <= inputEnd) {
      const timerId = setTimeout(() => {
        setInput((prevInput) => prevInput + step);
      }, interval);

      return () => {
        clearTimeout(timerId);
      };
    }

    if (input > inputEnd) {
      onEnd();
    }
  }, [input, isActive]);

  const transform = (output: string) => {
    const prob = sigmoid(input);
    return output
      .split("")
      .map((c) => {
        if (c === "\n") {
          return "\n";
        } else {
          if (Math.random() < prob) {
            return c;
          } else {
            return " ";
          }
        }
      })
      .join("");
  };

  return <Transform transform={transform}>{children}</Transform>;
};

export default FadeIn;
