import { ExplosionRawData } from "../assets/explosions.js";

class Explosion {
  private readonly _str: string;
  constructor(data: ExplosionRawData) {
    this._str = data.str;
  }

  public get width(): number {
    return Math.max(...this._str.split("\n").map((line) => line.length));
  }

  public get height(): number {
    return this._str.split("\n").length;
  }

  public crop(maxWidth: number, maxHeight: number): Explosion {
    const cropped = this._str
      .split("\n")
      .slice(0, maxHeight)
      .map((line) => line.slice(0, maxWidth))
      .join("\n");
    return new Explosion({ str: cropped });
  }

  toString() {
    return this._str;
  }
}

export default Explosion;
