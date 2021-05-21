import { PropsWithChildren, useState, useEffect } from "react";

type DelayedProps = PropsWithChildren<{
  delay?: number;
  children: JSX.Element;
}>;

const Delayed = ({ children, delay: waitBeforeShow = 500 }: DelayedProps) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);

    return () => clearTimeout(timerId);
  }, [waitBeforeShow]);

  return isShown ? children : null;
};

export default Delayed;
