import React, { useRef, useCallback } from "react";
import { Key as KeyMeta, Text, useInput, useFocus } from "ink";
import { capitalize } from "../utility/string.js";

import { Key } from "../utility/enums.js";
import FocusText from "./FocusText.js";

type KeyPromptProps = {
  button: Key;
  verb?: string;
  noun: string;
  autoFocus?: boolean;
  onPressed: () => void;
  isPressed: (input: string, key: KeyMeta) => boolean;
  isActive?: boolean;
};

const KeyPrompt = ({
  button,
  verb,
  noun,
  onPressed,
  isPressed,
  isActive = true,
  ...otherProps
}: KeyPromptProps) => {
  const { isFocused } = useFocus({ autoFocus: true });

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const onPressedRef = useRef(onPressed);
  onPressedRef.current = onPressed;
  const isFocusedRef = useRef(isFocused);
  isFocusedRef.current = isFocused;
  const isPressedRef = useRef(isPressed);
  isPressedRef.current = isPressed;

  const stableHandler = useCallback((input: string, keyMeta: KeyMeta) => {
    if (
      (isPressedRef.current(input, keyMeta) && isActiveRef.current) ||
      (keyMeta.return && isFocusedRef.current && isActiveRef.current)
    ) {
      onPressedRef.current();
    }
  }, []);

  useInput(stableHandler);

  const getColor = (str: string) => (isActive ? str : "gray");
  const verbMaxWidth = 6;

  return (
    <FocusText isFocused={isFocused} color={getColor("white")} {...otherProps}>
      <Text color={getColor("cyan")}>{button}</Text> to{verb && " "}
      {((verb || "") + " ").padEnd(verbMaxWidth + 4 + Number(!verb), ".")}{" "}
      <Text color={getColor("yellow")}>{capitalize(noun)}</Text>
    </FocusText>
  );
};

export default KeyPrompt;
