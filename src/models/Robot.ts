import { DirectionX } from "../utility/enums";
import {
  reverse,
  shuffle,
  transpose,
  swapPalindromes,
} from "../utility/string";

export type RobotData = {
  str: string;
  direction: DirectionX;
  name: string;
  explodeCount?: number;
  maxExplodeCount?: number;
};

// Using models with React state may not be such a good idea...
// https://daveceddia.com/why-not-modify-react-state-directly/
// This should be ok as an immutable structure...
class Robot {
  private readonly _str: string;
  private readonly _dirn: DirectionX;
  private readonly _name: string;
  private readonly _explodeCount: number;
  private readonly _maxExplodeCount: number;

  constructor({
    str,
    direction,
    name,
    explodeCount = 0,
    maxExplodeCount = 3,
  }: RobotData) {
    this._str = str;
    this._dirn = direction;
    this._name = name;
    this._explodeCount = explodeCount;
    this._maxExplodeCount = maxExplodeCount;
  }

  public get name() {
    return this._name;
  }

  // TODO remove?? not being used
  public setName(newName: string) {
    if (newName === this._name) {
      return this;
    }

    return this._clone({
      name: newName,
    });
  }

  public get direction() {
    return this._dirn;
  }

  private _clone({
    str = this._str,
    name = this._name,
    direction = this._dirn,
    explodeCount = this._explodeCount,
    maxExplodeCount = this._maxExplodeCount,
  }: Partial<RobotData>) {
    return new Robot({ str, name, direction, explodeCount, maxExplodeCount });
  }

  public setDirection(newDirn: DirectionX) {
    if (this._dirn === newDirn) {
      return this;
    }

    const width = this.width;

    const newStr = this._str
      .split("\n")
      .map((line) => line.padEnd(width))
      .map(reverse)
      .map(swapPalindromes)
      .join("\n");

    return this._clone({
      str: newStr,
      direction: newDirn,
    });
  }

  public explode() {
    if (this.isExploded) {
      return this;
    }

    const newStr = transpose(shuffle(transpose(shuffle(this._str, 1)), 1));
    return this._clone({
      str: newStr,
      explodeCount: this._explodeCount + 1,
    });
  }

  public get explodeCount() {
    return this._explodeCount;
  }

  public get isExploded() {
    return this._explodeCount >= this._maxExplodeCount;
  }

  public get height() {
    return this._str.split("\n").length;
  }

  public get width() {
    return Math.max(...this._str.split("\n").map((line) => line.length));
  }

  toString() {
    return this._str;
  }
}

export default Robot;
