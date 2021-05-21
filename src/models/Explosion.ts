import { ExplosionRawData } from "../data/explosions";

class Explosion {
  private readonly _str: string;
  constructor(data: ExplosionRawData) {
    this._str = data.str;
  }

  toString() {
    return this._str;
  }
}

export default Explosion;
