import React from "react";
import { Text, TextProps } from "ink";

interface FocusTextProps extends TextProps {
  children: React.ReactNode;
  isFocused: boolean;
}

const FocusText = ({ children, isFocused, ...otherProps }: FocusTextProps) => {
  return (
    <Text {...otherProps}>
      {isFocused ? "👉 " : "   "}
      {children}
    </Text>
  );
};

export default FocusText;
