import { capitalize } from "../utility/string";
import { DirectionX } from "../utility/enums";

import {
  uniqueNamesGenerator,
  names,
  adjectives,
} from "unique-names-generator";
import Robot from "../models/Robot";

const getName = () =>
  capitalize(
    uniqueNamesGenerator({
      dictionaries: [adjectives, names],
      length: 2,
      separator: " ",
    })
  );

const robots: Array<Robot> = [
  {
    str: `
      \\_/
     (* *)
    __)#(__
   ( )...( )(_)
   || |_| ||//
>==() | | ()/
    _(___)_
   [-]   [-]`.slice(1),
    direction: "left",
    name: getName(),
  },
  {
    str: `
     ,     ,
    (\\____/)
     (_oo_)
       (O)
     __||__    \\)
  []/______\\[] /
  / \\______/ \\/
 /    /__\\
(\\   /____\\`.slice(1),
    direction: "right",
    name: getName(),
  },
  {
    str: `
    \\_\\
   (_**)
  __) #_
 ( )...()
 || | |I|
 || | |()__/
 /\\(___)
_-"""""""-_""-_
-,,,,,,,,- ,,`.slice(1),
    direction: "right",
    name: getName(),
  },
  {
    str: `
       _
      [ ]
     (   )
      |>|
   __/===\\__
  //| o=o |\\\\
<]  | o=o |  [>
    \\=====/
   / / | \\ \\
  <_________>`.slice(1),
    direction: "right",
    name: getName(),
  },

  {
    str: `
       __
   _  |@@|
  / \\ \\--/ __
  ) O|----|  |   __
 / / \\ }{ /\\ )_ / _\\
 )/  /\\__/\\ \\__O (__
|/  (--/\\--)    \\__/
/   _)(  )(_
   \`---''---\``.slice(1),
    direction: "right",
    name: getName(),
  },
  {
    str: `
       _______
     _/       \\_
    / |       | \\
   /  |__   __|  \\
  |__/((o| |o))\\__|
  |      | |      |
  |\\     |_|     /|
  | \\           / |
   \\| /  ___  \\ |/
    \\ | / _ \\ | /
     \\_________/
      _|_____|_
 ____|_________|____
/                   \\`.slice(1),
    direction: "right",
    name: getName(),
  },
]
  .map((robotRaw) => ({
    // this demonstrates a typical scenerio
    // pulling data from API and mapping to a typed enum
    ...robotRaw,
    direction:
      robotRaw.direction === "right" ? DirectionX.Right : DirectionX.Left,
  }))
  // here we map to Model instance
  .map((robot) => new Robot(robot));

export default robots;
