import { useEffect, useState } from "react";

import { random } from "../utility/maths";

type UseAccumulateOptions = {
  start?: number;
  end?: number;
  step?: number;
  stepFluctuation?: number;
  interval?: number;
  intervalFluctuation?: number;
  monotonic?: boolean;
  isActive?: boolean;
  onEnd?: () => void;
};

const useAccumulate = ({
  start = 0,
  end = 1,
  step = 0.01,
  stepFluctuation = 0,
  interval = 100,
  intervalFluctuation = 0,
  monotonic = false,
  isActive = true,
  onEnd = () => null,
}: UseAccumulateOptions): [
  number,
  React.Dispatch<React.SetStateAction<number>>
] => {
  const [number, setNumber] = useState(start);

  const getStep = () => {
    let newStep = step;
    if (stepFluctuation) {
      newStep += random(-1, 1) * stepFluctuation;
    }
    if (monotonic) {
      newStep =
        (end > start && step < 0) || (end < start && step > 0)
          ? -newStep
          : newStep;
    }
    return newStep;
  };

  useEffect(() => {
    if (
      (isActive && start < end && number < end) ||
      (start > end && number > end)
    ) {
      const timerId = setTimeout(() => {
        setNumber((number) => number + getStep());
      }, Math.max(0, interval + random(-1, 1) * intervalFluctuation));

      return () => clearTimeout(timerId);
    } else {
      onEnd();
    }
  }, [number, isActive]);

  return [number, setNumber];
};

export default useAccumulate;
