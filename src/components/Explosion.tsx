import React from "react";
import { Text, TextProps } from "ink";
import Explosion from "../models/Explosion.js";
import { Color } from "../data/colors.js";

interface ExplosionProps extends TextProps {
  explosion: Explosion;
  color?: Color;
}

const ExplosionCmpt = ({
  color = Color.MUTED_RED,
  explosion,
  ...otherProps
}: ExplosionProps) => {
  return (
    <Text color={color} {...otherProps}>
      {explosion.toString()}
    </Text>
  );
};

export default ExplosionCmpt;
