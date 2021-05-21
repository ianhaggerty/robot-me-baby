import React from "react";
import { Key as KeyMeta, Text, useInput, useFocus } from "ink";
import { capitalize } from "../utility/string";

import { Key } from "../utility/enums";
import FocusText from "./FocusText";

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
  const { isFocused } = useFocus({ autoFocus: true, isActive });

  useInput((input, keyMeta) => {
    if (
      (isPressed(input, keyMeta) && isActive) ||
      (keyMeta.return && isFocused)
    ) {
      onPressed();
    }
  });

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
