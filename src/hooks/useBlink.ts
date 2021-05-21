import { useState, useEffect } from "react";

type UseBlinkProps = {
  interval?: number;
  isActive?: boolean;
  initial?: boolean;
};

const useBlink = ({
  interval = 100,
  isActive = true,
  initial = false,
}: UseBlinkProps = {}) => {
  const [on, setOn] = useState(initial && isActive);

  useEffect(() => {
    if (isActive) {
      const timerId = setTimeout(() => {
        setOn((prevOn) => !prevOn);
      }, interval);

      return () => clearTimeout(timerId);
    } else {
      setOn(false);
    }
  }, [on, isActive]);

  return on;
};

export default useBlink;
