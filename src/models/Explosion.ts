import { ExplosionRawData } from "../assets/explosions.js";
import { maxWidth, lineCount } from "../utility/string.js";

class Explosion {
  private readonly _str: string;
  constructor(data: ExplosionRawData) {
    this._str = data.str;
  }

  public get width(): number {
    return maxWidth(this._str);
  }

  public get height(): number {
    return lineCount(this._str);
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
