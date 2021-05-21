import Explosion from "../models/Explosion";

export type ExplosionRawData = {
  str: string;
};

const explosions: Array<Explosion> = [
  {
    str: `          _ ._  _ , _ ._
        (_ ' ( \`  )_  .__)
      ( (  (    )   \`)  ) _)
     (__ (_   (_ . _) _) ,__)
         \`~~\`\\ ' . /\`~~\`
              ;   ;
              /   \\
_____________/_ __ \\_____________`,
  },
].map((explosion) => new Explosion(explosion));

export default explosions;
