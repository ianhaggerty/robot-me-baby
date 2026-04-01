import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

import {
  frameContainsArt,
  frameContainsExplosion,
  frameContainsPartialExplosion,
  findArtPositions,
  findTextOnRow,
  stripAnsi,
  delay,
  countArtOccurrences,
  countColorOccurrences,
  countDimColorOccurrences,
  totalRobotCount,
  allRobotArts,
  robotA,
  robotB,
  robotC,
  robotAArt,
  robotBArt,
  robotCArt,
  robotBScramble3,
  robotBScramble3Art,
  renderRobotGame,
  renderRobotGameExpectError,
  renderRobotGameExpectNoError,
  pressKey,
  mockNavigate,
  mockPlaySound,
  resetMocks,
  solveMaze,
  art_1x1,
  art_2x2,
  art_3x3_hollow,
  art_disjoint,
  art_K,
  art_L,
  art_J,
  art_irregular,
  art_maze,
  MAZE_A_START,
} from "../utility/test.js";
import Robot from "../models/Robot.js";
import { DirectionX } from "../utility/enums.js";
import rawRobots from "../assets/robots.js";
import rawExplosions from "../assets/explosions.js";
import { Color } from "../assets/colors.js";

vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");
  const _navigate = vi.fn();
  return { ...actual, useNavigate: () => _navigate };
});

vi.mock("../assets/sounds.js", async () => {
  const { Sounds } =
    await vi.importActual<typeof import("../assets/sounds.js")>(
      "../assets/sounds.js",
    );
  return { Sounds, playSound: vi.fn() };
});

const ARROW: Record<string, string> = {
  right: "\x1B[C",
  left: "\x1B[D",
  up: "\x1B[A",
  down: "\x1B[B",
};

const WINDOW_WIDTH = 73;
const WINDOW_HEIGHT = 24;

type DirConfig = {
  name: string;
  dx: number;
  dy: number;
  arrow: string;
  initialDir: DirectionX;
};

const DIRS: DirConfig[] = [
  {
    name: "right",
    dx: 1,
    dy: 0,
    arrow: ARROW.right,
    initialDir: DirectionX.Right,
  },
  {
    name: "left",
    dx: -1,
    dy: 0,
    arrow: ARROW.left,
    initialDir: DirectionX.Left,
  },
  {
    name: "down",
    dx: 0,
    dy: 1,
    arrow: ARROW.down,
    initialDir: DirectionX.Right,
  },
  { name: "up", dx: 0, dy: -1, arrow: ARROW.up, initialDir: DirectionX.Right },
];

function makeRobot(art: string, dir: DirectionX, name: string) {
  return new Robot({ str: art, direction: dir, name });
}

function edgePos(size: number, windowSize: number) {
  return windowSize - size;
}

function move(
  stdin: { write: (s: string) => void },
  dir: DirConfig,
  count = 1,
) {
  for (let i = 0; i < count; i++) {
    stdin.write(dir.arrow);
    if (dir.dy === 0) stdin.write(dir.arrow);
  }
}

function replayMoves(
  stdin: { write: (s: string) => void },
  moves: { dx: number; dy: number }[],
) {
  let facing: DirectionX | null = null;
  for (const { dx, dy } of moves) {
    if (dy !== 0) {
      stdin.write(dy === -1 ? ARROW.up : ARROW.down);
    } else {
      const dir = dx === 1 ? DirectionX.Right : DirectionX.Left;
      const arrow = dx === 1 ? ARROW.right : ARROW.left;
      if (facing !== dir) {
        stdin.write(arrow);
        facing = dir;
      }
      stdin.write(arrow);
    }
  }
}

function iRobot() {
  return makeRobot(art_L, DirectionX.Right, "I");
}
function jRobot(name = "J") {
  return makeRobot(art_J, DirectionX.Right, name);
}

// bounding box of art_irregular: 8 wide × 5 tall
const ART_W = 8;
const ART_H = 5;

afterEach(resetMocks);

function renderThreeRobots(selected = 0) {
  return renderRobotGame({
    initialRobot: [robotA, robotB, robotC],
    initialSelected: selected,
    initialX: [0, 30, 0],
    initialY: [0, 0, 14],
  });
}

describe("RobotGame", () => {
  const robot = new Robot({
    str: rawRobots[0].str,
    direction: rawRobots[0].direction,
    name: "Test Robot",
  });

  beforeAll(() => {
    expect(allRobotArts.length).toBeGreaterThanOrEqual(rawRobots.length);
  });

  it("renders the first robot ASCII art", async () => {
    const { lastFrame } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", robot.toString())).toBe(true);
    });
  });

  it("flips the robot when pressing right arrow", async () => {
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    const flippedRobot = robot.setDirection(DirectionX.Right);

    stdin.write("\x1B[C");

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", flippedRobot.toString())).toBe(
        true,
      );
    });
  });

  it("shows explosion art when 'e' is pressed", async () => {
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    stdin.write("e");

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", rawExplosions[0].str)).toBe(
        true,
      );
    });
  });

  it("moves the robot right when facing right and space is available", async () => {
    const rightRobot = robot.setDirection(DirectionX.Right);
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: rightRobot,
      initialX: 0,
      initialY: 0,
    });

    let frameBefore: string;
    await vi.waitFor(() => {
      frameBefore = lastFrame() ?? "";
      expect(frameContainsArt(frameBefore, rightRobot.toString())).toBe(true);
    });

    stdin.write("\x1B[C");

    await vi.waitFor(() => {
      const frameAfter = lastFrame() ?? "";
      expect(frameContainsArt(frameAfter, rightRobot.toString())).toBe(true);
      expect(frameAfter).not.toBe(frameBefore!);
    });
  });

  it("changes robot color when tabbing to 'change color' and pressing enter", async () => {
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    let frameBefore: string;
    await vi.waitFor(() => {
      frameBefore = lastFrame() ?? "";
      expect(frameContainsArt(frameBefore, robot.toString())).toBe(true);
    });

    pressKey(stdin, "\t", 7);
    stdin.write("\r");

    await vi.waitFor(() => {
      const frameAfter = lastFrame() ?? "";
      expect(frameContainsArt(frameAfter, robot.toString())).toBe(true);
      expect(frameAfter).not.toBe(frameBefore!);
    });
  });

  it("adds a robot to the scene when 'z' is pressed", async () => {
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(totalRobotCount(lastFrame() ?? "")).toBe(1);
    });

    stdin.write("z");

    await vi.waitFor(() => {
      expect(totalRobotCount(lastFrame() ?? "")).toBe(2);
    });
  });

  it("creates a new robot via tab navigation and enter", async () => {
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(totalRobotCount(lastFrame() ?? "")).toBe(1);
    });

    // Tab until the focused item is "Z to create", verifying each tab changes the frame
    let found = false;
    for (let i = 0; i < 13; i++) {
      const frameBefore = lastFrame();
      stdin.write("\t");
      await vi.waitFor(() => {
        expect(lastFrame()).not.toBe(frameBefore);
      });
      if (stripAnsi(lastFrame() ?? "").includes("\u{1F449} Z to create")) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);

    stdin.write("\r");

    await vi.waitFor(() => {
      expect(totalRobotCount(lastFrame() ?? "")).toBe(2);
    });
  });

  it("triggers explosion of the currently selected robot when 'e' is pressed", async () => {
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", robot.toString())).toBe(true);
      expect(frameContainsExplosion(lastFrame() ?? "")).toBe(false);
    });

    stdin.write("e");

    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      // Explosion graphic is shown
      expect(frameContainsExplosion(frame)).toBe(true);
      // Robot art is no longer visible (replaced by explosion)
      expect(frameContainsArt(frame, robot.toString())).toBe(false);
    });
  });

  it("removes the exploded robot from the scene when other robots exist", async () => {
    const { lastFrame, stdin } = renderThreeRobots(0);

    // Verify all three robots' art is present
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countArtOccurrences(frame, robotAArt)).toBe(1);
      expect(countArtOccurrences(frame, robotBArt)).toBe(1);
      expect(countArtOccurrences(frame, robotCArt)).toBe(1);
    });

    // Explode A (currently selected)
    stdin.write("e");

    await vi.waitFor(() => {
      expect(frameContainsExplosion(lastFrame() ?? "")).toBe(true);
    });

    // Wait for explosion to finish
    await vi.waitFor(
      () => {
        expect(frameContainsExplosion(lastFrame() ?? "")).toBe(false);
      },
      { timeout: 5000 },
    );

    // A's art should be gone (removed from scene)
    const frame = lastFrame() ?? "";
    expect(countArtOccurrences(frame, robotAArt)).toBe(0);
    // B and C's original art is also gone (scrambled by explosion)
    expect(countArtOccurrences(frame, robotBArt)).toBe(0);
    expect(countArtOccurrences(frame, robotCArt)).toBe(0);
  });

  it("ends the game when the last robot is exploded", async () => {
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", robot.toString())).toBe(true);
    });

    // Explode the only robot
    stdin.write("e");

    await vi.waitFor(() => {
      expect(frameContainsExplosion(lastFrame() ?? "")).toBe(true);
    });

    // Wait for explosion to finish and game to end
    await vi.waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/outro");
      },
      { timeout: 5000 },
    );
  });

  it("dims unselected robots using dimColor", async () => {
    const { lastFrame } = renderThreeRobots(0);

    // A is selected — its color (RED) is not dimmed; B (GREEN) and C (TEAL) are dimmed
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_RED)).toBe(0);
      expect(countColorOccurrences(frame, Color.MUTED_RED)).toBeGreaterThan(0);
      expect(
        countDimColorOccurrences(frame, Color.MUTED_GREEN),
      ).toBeGreaterThan(0);
      expect(countDimColorOccurrences(frame, Color.MUTED_TEAL)).toBeGreaterThan(
        0,
      );
    });
  });

  it("selects the next robot in creation order after exploding the selected one", async () => {
    const { lastFrame, stdin } = renderThreeRobots(0);

    // Verify A is selected (not dimmed), B and C are dimmed
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_RED)).toBe(0);
      expect(
        countDimColorOccurrences(frame, Color.MUTED_GREEN),
      ).toBeGreaterThan(0);
      expect(countDimColorOccurrences(frame, Color.MUTED_TEAL)).toBeGreaterThan(
        0,
      );
    });

    // Select B (x once: A -> B)
    const frameBefore = lastFrame();
    stdin.write("x");
    await vi.waitFor(() => {
      expect(lastFrame()).not.toBe(frameBefore);
    });

    // B is now selected (not dimmed)
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_GREEN)).toBe(0);
      expect(countDimColorOccurrences(frame, Color.MUTED_RED)).toBeGreaterThan(
        0,
      );
    });

    // Explode B
    stdin.write("e");
    await vi.waitFor(() => {
      expect(frameContainsExplosion(lastFrame() ?? "")).toBe(true);
    });

    // Wait for explosion to finish
    await vi.waitFor(
      () => {
        expect(frameContainsExplosion(lastFrame() ?? "")).toBe(false);
      },
      { timeout: 5000 },
    );

    // C should now be selected (next after B in creation order)
    // C's color is MUTED_TEAL — it should NOT be dimmed
    // A's color is MUTED_RED — it should be dimmed
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_TEAL)).toBe(0);
      expect(countDimColorOccurrences(frame, Color.MUTED_RED)).toBeGreaterThan(
        0,
      );
    });
  });

  it("scrambles remaining robots on explosion, but not over-exploded ones", async () => {
    // Use robotA (count=0), robotB (count=0), and robotBScramble3 (count=3, over-exploded)
    // at known valid positions
    const overExploded = robotBScramble3.setColor(Color.MUTED_YELLOW);
    const overExplodedArt = robotBScramble3Art;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [robotA, robotB, overExploded],
      initialSelected: 0,
      initialX: [0, 30, 48],
      initialY: [0, 0, 0],
    });

    // Verify initial art is present
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countArtOccurrences(frame, robotAArt)).toBe(1);
      expect(countArtOccurrences(frame, robotBArt)).toBe(1);
      expect(countArtOccurrences(frame, overExplodedArt)).toBe(1);
    });

    // Explode A (selected)
    stdin.write("e");

    await vi.waitFor(() => {
      expect(frameContainsExplosion(lastFrame() ?? "")).toBe(true);
    });

    // Wait for explosion to finish
    await vi.waitFor(
      () => {
        expect(frameContainsExplosion(lastFrame() ?? "")).toBe(false);
      },
      { timeout: 5000 },
    );

    const frame = lastFrame() ?? "";

    // A was removed
    expect(countArtOccurrences(frame, robotAArt)).toBe(0);

    // B (explodeCount=0) was scrambled — its original art is gone
    expect(countArtOccurrences(frame, robotBArt)).toBe(0);

    // Over-exploded robot (explodeCount=3) was NOT scrambled — art unchanged
    expect(countArtOccurrences(frame, overExplodedArt)).toBe(1);
  });

  it("does not interrupt wrong.mp3 if another no-op is performed", async () => {
    // Robot at top-left, facing up — moving up is a no-op (y=0)
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", robot.toString())).toBe(true);
    });

    mockPlaySound.mockClear();

    // First no-op: move up at y=0
    stdin.write("\x1B[A");

    await vi.waitFor(() => {
      expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
    });

    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    // Second no-op immediately: move up again
    stdin.write("\x1B[A");

    // Wait to ensure the second keypress is processed
    await delay(100);

    // wrong.mp3 should still have been called only once (debounced)
    const wrongCalls = mockPlaySound.mock.calls.filter(
      (call) => call[0] === "wrong.mp3",
    );
    expect(wrongCalls.length).toBe(1);
  });

  it("shows 'Z to create ... Robot' in the side menu", async () => {
    const { lastFrame } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      const frame = stripAnsi(lastFrame() ?? "");
      expect(frame).toContain("Z to create ... Robot");
    });
  });

  it("shows 'X to select ... Robot' in the side menu", async () => {
    const { lastFrame } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      const frame = stripAnsi(lastFrame() ?? "");
      expect(frame).toContain("X to select ... Robot");
    });
  });

  it("positions dynamically created robots randomly", async () => {
    const frames: string[] = [];

    // Run multiple attempts — collect the frame after pressing 'z' each time
    for (let attempt = 0; attempt < 10; attempt++) {
      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: robot,
        initialX: 0,
        initialY: 0,
      });

      await vi.waitFor(() => {
        expect(totalRobotCount(lastFrame() ?? "")).toBe(1);
      });

      stdin.write("z");

      await vi.waitFor(() => {
        expect(totalRobotCount(lastFrame() ?? "")).toBe(2);
      });

      frames.push(stripAnsi(lastFrame() ?? ""));

      // As soon as we see two different frames, randomness is confirmed
      if (frames.length >= 2 && new Set(frames).size > 1) break;
    }

    expect(new Set(frames).size).toBeGreaterThan(1);
  });

  it(
    "ends the game when all robots have been removed from the scene",
    { timeout: 20000 },
    async () => {
      const { lastFrame, stdin } = renderThreeRobots(0);

      // Verify all three are present
      await vi.waitFor(() => {
        const frame = lastFrame() ?? "";
        expect(countArtOccurrences(frame, robotAArt)).toBe(1);
        expect(countArtOccurrences(frame, robotBArt)).toBe(1);
        expect(countArtOccurrences(frame, robotCArt)).toBe(1);
      });

      // Explode each robot in turn
      for (let i = 0; i < 3; i++) {
        const frameBefore = lastFrame();
        stdin.write("e");
        await vi.waitFor(
          () => {
            expect(frameContainsExplosion(lastFrame() ?? "")).toBe(true);
          },
          { timeout: 5000 },
        );
        await vi.waitFor(
          () => {
            expect(frameContainsExplosion(lastFrame() ?? "")).toBe(false);
            expect(lastFrame()).not.toBe(frameBefore);
          },
          { timeout: 5000 },
        );
      }

      // Game should end — navigate to outro
      await vi.waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/outro");
        },
        { timeout: 5000 },
      );
    },
  );

  it("makes all operations no-ops on over-exploded robots except explosion", async () => {
    // robotBScramble3 is over-exploded (explodeCount=3, isExploded=true)
    const overExploded = robotBScramble3.setColor(Color.MUTED_YELLOW);
    const overExplodedArt = robotBScramble3Art;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: overExploded,
      initialX: 10,
      initialY: 5,
    });

    await vi.waitFor(() => {
      expect(countArtOccurrences(lastFrame() ?? "", overExplodedArt)).toBe(1);
    });

    const pos = () => findArtPositions(lastFrame() ?? "", overExplodedArt);
    const colorCount = () =>
      countColorOccurrences(lastFrame() ?? "", Color.MUTED_YELLOW);

    const posBefore = pos();
    const colorBefore = colorCount();
    mockPlaySound.mockClear();

    // Try move right — should be a no-op, position unchanged
    stdin.write("\x1B[C");
    await delay(100);
    expect(pos()).toEqual(posBefore);

    // Try move up — should be a no-op, position unchanged
    stdin.write("\x1B[A");
    await delay(100);
    expect(pos()).toEqual(posBefore);

    // Try change color — should be a no-op
    stdin.write("c");
    await delay(100);
    expect(colorCount()).toBe(colorBefore);

    // Try change robot — should be a no-op, position unchanged
    stdin.write("r");
    await delay(100);
    expect(pos()).toEqual(posBefore);

    // No success sounds should have played (confirm, glitch, etc.)
    const successSounds = mockPlaySound.mock.calls.filter(
      (call) =>
        call[0] !== "stomps.wav" &&
        call[0] !== "intro.wav" &&
        call[0] !== "wrong.mp3",
    );
    expect(successSounds.length).toBe(0);
    // wrong.mp3 should have played for the disabled key presses
    expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");

    // Explode should still work — robot can be removed
    stdin.write("e");
    await vi.waitFor(() => {
      expect(frameContainsExplosion(lastFrame() ?? "")).toBe(true);
    });
  });

  it("crops explosion art when robot is near the right edge of the window", async () => {
    // Place robot at x=50. Explosion is 33w, window is 73w.
    // Available width for explosion: 73 - 50 = 23. Explosion must be cropped.
    const edgeRobot = new Robot({
      str: rawRobots[0].str,
      direction: DirectionX.Right,
      name: "Edge Robot",
    });

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: edgeRobot,
      initialX: 50,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", edgeRobot.toString())).toBe(
        true,
      );
    });

    stdin.write("e");

    // Some explosion content should be visible (partial/cropped)
    await vi.waitFor(() => {
      expect(frameContainsPartialExplosion(lastFrame() ?? "")).toBe(true);
    });

    // The full (uncropped) explosion should NOT be present
    expect(frameContainsExplosion(lastFrame() ?? "")).toBe(false);
  });

  it("crops explosion art when robot is near the bottom edge of the window", async () => {
    // Place a small robot at y=20. Explosion is 8h, window is 24h.
    // Available height: 24 - 20 = 4. Explosion must be cropped to 4 lines.
    const smallRobot = new Robot({
      str: "X",
      direction: DirectionX.Right,
      name: "Small",
    });

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: smallRobot,
      initialX: 0,
      initialY: 20,
    });

    await vi.waitFor(() => {
      expect(lastFrame()).not.toBe(undefined);
    });

    stdin.write("e");

    // Some explosion content should be visible (partial/cropped)
    await vi.waitFor(() => {
      expect(frameContainsPartialExplosion(lastFrame() ?? "")).toBe(true);
    });

    // The full (uncropped) explosion should NOT be present
    expect(frameContainsExplosion(lastFrame() ?? "")).toBe(false);
  });

  describe("props validation", () => {
    function expectError(props: Record<string, unknown>, pattern?: RegExp) {
      const { hasError } = renderRobotGameExpectError(props, pattern);
      expect(hasError).toBe(true);
    }

    function expectNoError(props: Record<string, unknown>) {
      const { hasError } = renderRobotGameExpectNoError(props);
      expect(hasError).toBe(false);
    }

    it("errors if initialSelected is set when initialRobot is a single Robot", () => {
      expectError({ initialRobot: robot, initialSelected: 0 });
    });

    it("errors if initialX is an array when initialRobot is a single Robot", () => {
      expectError({ initialRobot: robot, initialX: [0] });
    });

    it("errors if initialY is an array when initialRobot is a single Robot", () => {
      expectError({ initialRobot: robot, initialY: [0] });
    });

    it("errors if initialSelected is undefined when initialRobot is an array", () => {
      expectError({
        initialRobot: [robotA, robotB],
        initialX: [0, 30],
        initialY: [0, 0],
      });
    });

    it("errors if initialSelected is out of bounds", () => {
      expectError({
        initialRobot: [robotA, robotB],
        initialSelected: 5,
        initialX: [0, 30],
        initialY: [0, 0],
      });
    });

    it("errors if initialX length doesn't match initialRobot length", () => {
      expectError({
        initialRobot: [robotA, robotB],
        initialSelected: 0,
        initialX: [0],
        initialY: [0, 0],
      });
    });

    it("errors if initialY length doesn't match initialRobot length", () => {
      expectError({
        initialRobot: [robotA, robotB],
        initialSelected: 0,
        initialX: [0, 30],
        initialY: [0],
      });
    });

    it("errors if initial robot characters overlap", () => {
      expectError(
        {
          initialRobot: [robotA, robotB],
          initialSelected: 0,
          initialX: [0, 5],
          initialY: [0, 0],
        },
        /overlap/,
      );
    });

    it("errors if initial robot bbox escapes the window", () => {
      expectError(
        {
          initialRobot: [robotA],
          initialSelected: 0,
          initialX: [70],
          initialY: [0],
        },
        /escapes/,
      );
    });

    it("does not error for valid single Robot props", () => {
      expectNoError({ initialRobot: robot, initialX: 0, initialY: 0 });
    });

    it("does not error for valid Robot array props", () => {
      expectNoError({
        initialRobot: [robotA, robotB],
        initialSelected: 0,
        initialX: [0, 30],
        initialY: [0, 0],
      });
    });
  });

  it("cycles selection through initial robots in array order", async () => {
    // Start with B selected (index 1)
    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [robotA, robotB, robotC],
      initialSelected: 1,
      initialX: [0, 30, 0],
      initialY: [0, 0, 14],
    });

    // B is selected (not dimmed), A and C are dimmed
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_GREEN)).toBe(0);
      expect(countDimColorOccurrences(frame, Color.MUTED_RED)).toBeGreaterThan(
        0,
      );
      expect(countDimColorOccurrences(frame, Color.MUTED_TEAL)).toBeGreaterThan(
        0,
      );
    });

    // Press x: B(1) -> C(2)
    let frameBefore = lastFrame();
    stdin.write("x");
    await vi.waitFor(() => {
      expect(lastFrame()).not.toBe(frameBefore);
    });
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_TEAL)).toBe(0);
      expect(
        countDimColorOccurrences(frame, Color.MUTED_GREEN),
      ).toBeGreaterThan(0);
    });

    // Press x: C(2) -> A(0) (wraps around)
    frameBefore = lastFrame();
    stdin.write("x");
    await vi.waitFor(() => {
      expect(lastFrame()).not.toBe(frameBefore);
    });
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_RED)).toBe(0);
      expect(countDimColorOccurrences(frame, Color.MUTED_TEAL)).toBeGreaterThan(
        0,
      );
    });

    // Press x: A(0) -> B(1) (back to start)
    frameBefore = lastFrame();
    stdin.write("x");
    await vi.waitFor(() => {
      expect(lastFrame()).not.toBe(frameBefore);
    });
    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(countDimColorOccurrences(frame, Color.MUTED_GREEN)).toBe(0);
      expect(countDimColorOccurrences(frame, Color.MUTED_RED)).toBeGreaterThan(
        0,
      );
    });
  });

  describe("no-op", () => {
    it("plays wrong.mp3 when moving up at the top edge", async () => {
      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: robot,
        initialX: 0,
        initialY: 0,
      });

      await vi.waitFor(() => {
        expect(frameContainsArt(lastFrame() ?? "", robot.toString())).toBe(
          true,
        );
      });

      mockPlaySound.mockClear();
      stdin.write("\x1B[A");

      await vi.waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      });
    });

    it("plays wrong.mp3 when moving left at the left edge", async () => {
      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: robot,
        initialX: 0,
        initialY: 0,
      });

      // Robot starts facing left, first left press flips (not a no-op).
      // Need to be facing left already at x=0.
      await vi.waitFor(() => {
        expect(frameContainsArt(lastFrame() ?? "", robot.toString())).toBe(
          true,
        );
      });

      // Press left once to ensure facing left (robot already faces left)
      // Now press left again — movement blocked at x=0
      mockPlaySound.mockClear();
      stdin.write("\x1B[D");
      await vi.waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      });
    });

    it("plays wrong.mp3 when pushing another robot out of bounds", async () => {
      // art_1x1 robots: A at right edge minus 1, B at right edge.
      // Moving A right pushes B out of bounds.
      const rA = new Robot({ str: art_1x1, direction: DirectionX.Right, name: "A" });
      const rB = new Robot({ str: art_1x1, direction: DirectionX.Right, name: "B" });
      const bx = WINDOW_WIDTH - 1;
      const ax = bx - 1;

      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: [rA, rB],
        initialSelected: 0,
        initialX: [ax, bx],
        initialY: [5, 5],
      });

      await vi.waitFor(() => {
        expect(findArtPositions(lastFrame() ?? "", art_1x1).length).toBe(2);
      });

      mockPlaySound.mockClear();
      stdin.write("\x1B[C");

      await vi.waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      });

      // Neither robot moved.
      const p = findArtPositions(lastFrame() ?? "", art_1x1);
      expect(p).toContainEqual({ x: ax, y: 5 });
      expect(p).toContainEqual({ x: bx, y: 5 });
    });

    it("plays wrong.mp3 on over-exploded robots for action keys", async () => {
      const overExploded = robotBScramble3.setColor(Color.MUTED_YELLOW);
      const overExplodedArt = robotBScramble3Art;

      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: overExploded,
        initialX: 10,
        initialY: 5,
      });

      await vi.waitFor(() => {
        expect(countArtOccurrences(lastFrame() ?? "", overExplodedArt)).toBe(1);
      });

      const posBefore = findArtPositions(lastFrame() ?? "", overExplodedArt);

      // Move right — no-op, plays wrong.mp3
      mockPlaySound.mockClear();
      stdin.write("\x1B[C");
      await delay(100);
      expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      expect(findArtPositions(lastFrame() ?? "", overExplodedArt)).toEqual(
        posBefore,
      );
    });

    it("plays wrong.mp3 when changing robot type would exceed the window width", async () => {
      // A tiny robot at the right edge — all templates (min 15w) exceed the window
      const tinyRobot = new Robot({
        str: "X",
        direction: DirectionX.Right,
        name: "Tiny",
      });

      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: tinyRobot,
        initialX: 72,
        initialY: 0,
      });

      await vi.waitFor(() => {
        expect(lastFrame()).not.toBe(undefined);
      });

      mockPlaySound.mockClear();
      stdin.write("r");

      await vi.waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      });

      // No success sounds played (robot didn't change)
      const successSounds = mockPlaySound.mock.calls.filter(
        (call) => call[0] === "retro-confirm.wav",
      );
      expect(successSounds.length).toBe(0);
    });

    it("plays wrong.mp3 when changing robot type would exceed the window height", async () => {
      // A tiny robot at the bottom edge — all templates (min 8h) exceed the window
      const tinyRobot = new Robot({
        str: "X",
        direction: DirectionX.Right,
        name: "Tiny",
      });

      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: tinyRobot,
        initialX: 0,
        initialY: 23,
      });

      await vi.waitFor(() => {
        expect(lastFrame()).not.toBe(undefined);
      });

      mockPlaySound.mockClear();
      stdin.write("r");

      await vi.waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      });

      // No success sounds played (robot didn't change)
      const successSounds = mockPlaySound.mock.calls.filter(
        (call) => call[0] === "retro-confirm.wav",
      );
      expect(successSounds.length).toBe(0);
    });
  });

  it("uses '===' separator style above and below create/select robot options", async () => {
    const { lastFrame } = renderRobotGame({
      initialRobot: robot,
      initialX: 0,
      initialY: 0,
    });

    await vi.waitFor(() => {
      expect(lastFrame()).not.toBe(undefined);
    });

    const lines = stripAnsi(lastFrame() ?? "").split("\n");
    const separator = "====================";
    const createLine = lines.findIndex((l) => l.includes("Z to create"));
    const selectLine = lines.findIndex((l) => l.includes("X to select"));

    expect(createLine).toBeGreaterThan(-1);
    expect(selectLine).toBeGreaterThan(-1);

    // === separator above create robot
    const aboveLine = lines
      .slice(0, createLine)
      .findLastIndex((l) => l.includes(separator));
    expect(aboveLine).toBeGreaterThan(-1);
    // No other menu items between separator and create
    const between = lines.slice(aboveLine + 1, createLine);
    expect(
      between.every((l) => l.trim() === "" || l.includes("--------")),
    ).toBe(true);

    // === separator below select robot
    const belowLine = lines
      .slice(selectLine + 1)
      .findIndex((l) => l.includes(separator));
    expect(belowLine).toBeGreaterThan(-1);
  });

  it("renders robot art on top of robot names when stacked vertically", async () => {
    // robotA (8h) at (0,9) is first in array (rendered first, lower z-order).
    // robotB (9h) at (0,0) is second in array (rendered second, higher z-order).
    // robotB's name renders at row 9 (just below its 9-row art bbox).
    // robotA's art starts at row 9.
    // The bug: robotB (rendered on top) has its name at row 9, overwriting
    // robotA's art at row 9. Art should always render on top of names.
    const { lastFrame } = renderRobotGame({
      initialRobot: [robotA, robotB],
      initialSelected: 0,
      initialX: [0, 0],
      initialY: [9, 0],
    });

    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      // Both robot arts should be fully visible as intact blocks
      expect(frameContainsArt(frame, robotA.toString())).toBe(true);
      expect(frameContainsArt(frame, robotB.toString())).toBe(true);
    });
  });

  it("centres robot names with respect to the robot art", async () => {
    // Use robots with deliberately short and long names to test centering
    const shortNameRobot = new Robot({
      str: rawRobots[0].str, // 15w x 8h
      direction: DirectionX.Right,
      name: "AB",
      color: Color.MUTED_RED,
    });
    const longNameRobot = new Robot({
      str: rawRobots[2].str, // 15w x 9h
      direction: DirectionX.Right,
      name: "A Very Long Robot Name",
      color: Color.MUTED_GREEN,
    });

    const { lastFrame } = renderRobotGame({
      initialRobot: [shortNameRobot, longNameRobot],
      initialSelected: 0,
      initialX: [0, 30],
      initialY: [0, 0],
    });

    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(frameContainsArt(frame, shortNameRobot.toString())).toBe(true);
      expect(frameContainsArt(frame, longNameRobot.toString())).toBe(true);
    });

    const frame = lastFrame() ?? "";

    // For each robot, find the art position, find the name position,
    // and verify the name is centred relative to the art.
    for (const robot of [shortNameRobot, longNameRobot]) {
      const artPos = findArtPositions(frame, robot.toString());
      expect(artPos.length).toBe(1);
      const { x: artX, y: artY } = artPos[0];

      const nameRow = artY + robot.height;
      const nameCol = findTextOnRow(frame, nameRow, robot.name);
      expect(nameCol).not.toBeNull();

      // The name's centre should align with the art's centre (within 1 char)
      const artCentre = artX + robot.width / 2;
      const nameCentre = nameCol! + robot.name.length / 2;
      expect(Math.abs(artCentre - nameCentre)).toBeLessThanOrEqual(1);
    }
  });
});

describe("irregular robot bounding box constrains movement", () => {
  it.each([
    {
      edge: "right",
      x: WINDOW_WIDTH - ART_W,
      y: 5,
      arrow: ARROW.right,
      dir: DirectionX.Right,
      needsTurn: false,
    },
    {
      edge: "left",
      x: 0,
      y: 5,
      arrow: ARROW.left,
      dir: DirectionX.Left,
      needsTurn: false,
    },
    {
      edge: "bottom",
      x: 5,
      y: WINDOW_HEIGHT - ART_H,
      arrow: ARROW.down,
      dir: DirectionX.Right,
      needsTurn: false,
    },
    {
      edge: "top",
      x: 5,
      y: 0,
      arrow: ARROW.up,
      dir: DirectionX.Right,
      needsTurn: false,
    },
  ])(
    "cannot move past the $edge edge of the window",
    async ({ x, y, arrow, dir }) => {
      const robot = new Robot({
        str: art_irregular,
        direction: dir,
        name: "A",
      });

      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: robot,
        initialX: x,
        initialY: y,
      });

      await vi.waitFor(() => {
        const pos = findArtPositions(lastFrame() ?? "", art_irregular);
        expect(pos).toContainEqual({ x, y });
      });

      mockPlaySound.mockClear();

      stdin.write(arrow);

      await vi.waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      });

      const pos = findArtPositions(lastFrame() ?? "", art_irregular);
      expect(pos).toContainEqual({ x, y });
    },
  );
});

describe("single block push", () => {
  it.each(DIRS)("pushes B $name", async (dir) => {
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rB = makeRobot(art_1x1, dir.initialDir, "B");
    const ax = 5,
      ay = 5;
    const bx = ax + dir.dx,
      by = ay + dir.dy;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rA, rB],
      initialSelected: 0,
      initialX: [ax, bx],
      initialY: [ay, by],
    });
    await vi.waitFor(() => {
      expect(findArtPositions(lastFrame() ?? "", art_1x1).length).toBe(2);
    });

    move(stdin, dir);

    await vi.waitFor(() => {
      const p = findArtPositions(lastFrame() ?? "", art_1x1);
      expect(p).toContainEqual({ x: ax + dir.dx, y: ay + dir.dy });
      expect(p).toContainEqual({ x: bx + dir.dx, y: by + dir.dy });
    });
  });
});

describe("single block push — no window space", () => {
  it.each(DIRS)("cannot push B $name at window edge", async (dir) => {
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rB = makeRobot(art_1x1, dir.initialDir, "B");
    const bx = dir.dx === 1 ? edgePos(1, WINDOW_WIDTH) : dir.dx === -1 ? 0 : 5;
    const by = dir.dy === 1 ? edgePos(1, WINDOW_HEIGHT) : dir.dy === -1 ? 0 : 5;
    const ax = bx - dir.dx,
      ay = by - dir.dy;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rA, rB],
      initialSelected: 0,
      initialX: [ax, bx],
      initialY: [ay, by],
    });
    await vi.waitFor(() => {
      expect(findArtPositions(lastFrame() ?? "", art_1x1).length).toBe(2);
    });

    mockPlaySound.mockClear();
    move(stdin, dir);

    await vi.waitFor(() => {
      expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
    });
    const p = findArtPositions(lastFrame() ?? "", art_1x1);
    expect(p).toContainEqual({ x: ax, y: ay });
    expect(p).toContainEqual({ x: bx, y: by });
  });
});

describe("simultaneous parallel block push", () => {
  it.each(DIRS)("C pushes A and B $name", async (dir) => {
    const rC = makeRobot(art_2x2, dir.initialDir, "C");
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rB = makeRobot(art_1x1, dir.initialDir, "B");
    const cx = 5,
      cy = 5;
    let ax: number, ay: number, bx: number, by: number;
    if (dir.dx !== 0) {
      const col = dir.dx === 1 ? cx + 2 : cx - 1;
      ax = col;
      ay = cy;
      bx = col;
      by = cy + 1;
    } else {
      const row = dir.dy === 1 ? cy + 2 : cy - 1;
      ax = cx;
      ay = row;
      bx = cx + 1;
      by = row;
    }

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rC, rA, rB],
      initialSelected: 0,
      initialX: [cx, ax, bx],
      initialY: [cy, ay, by],
    });
    await vi.waitFor(() => {
      expect(lastFrame()).toBeDefined();
    });

    move(stdin, dir);

    await vi.waitFor(() => {
      const p = findArtPositions(lastFrame() ?? "", art_1x1);
      expect(p).toContainEqual({ x: ax + dir.dx, y: ay + dir.dy });
      expect(p).toContainEqual({ x: bx + dir.dx, y: by + dir.dy });
    });
  });
});

describe("single block pull by engulfing robot", () => {
  it.each(DIRS)("A pulls D $name", async (dir) => {
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rD = makeRobot(art_3x3_hollow, dir.initialDir, "D");
    const ddx = 5,
      ddy = 5;
    const ax = ddx + 1,
      ay = ddy + 1;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rA, rD],
      initialSelected: 0,
      initialX: [ax, ddx],
      initialY: [ay, ddy],
    });
    await vi.waitFor(() => {
      expect(lastFrame()).toBeDefined();
    });

    move(stdin, dir);

    await vi.waitFor(() => {
      const p = findArtPositions(lastFrame() ?? "", art_3x3_hollow);
      expect(p).toContainEqual({ x: ddx + dir.dx, y: ddy + dir.dy });
    });
  });
});

describe("self-intersecting bounding boxes", () => {
  it("does not error when A is inside D", () => {
    const rA = makeRobot(art_1x1, DirectionX.Right, "A");
    const rD = makeRobot(art_3x3_hollow, DirectionX.Right, "D");
    const { hasError } = renderRobotGameExpectNoError({
      initialRobot: [rA, rD],
      initialSelected: 0,
      initialX: [6, 5],
      initialY: [6, 5],
    });
    expect(hasError).toBe(false);
  });
});

describe("single block pull — no window space", () => {
  it.each(DIRS)("A cannot pull D $name at window edge", async (dir) => {
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rD = makeRobot(art_3x3_hollow, dir.initialDir, "D");
    const ddx = dir.dx === 1 ? edgePos(3, WINDOW_WIDTH) : dir.dx === -1 ? 0 : 5;
    const ddy =
      dir.dy === 1 ? edgePos(3, WINDOW_HEIGHT) : dir.dy === -1 ? 0 : 5;
    const ax = ddx + 1,
      ay = ddy + 1;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rA, rD],
      initialSelected: 0,
      initialX: [ax, ddx],
      initialY: [ay, ddy],
    });
    await vi.waitFor(() => {
      expect(lastFrame()).toBeDefined();
    });

    mockPlaySound.mockClear();
    move(stdin, dir);

    await vi.waitFor(() => {
      expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
    });
    const p = findArtPositions(lastFrame() ?? "", art_3x3_hollow);
    expect(p).toContainEqual({ x: ddx, y: ddy });
  });
});

describe("simultaneous sequential block push", () => {
  it.each(DIRS)("A pushes B and E $name", async (dir) => {
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rB = makeRobot(art_1x1, dir.initialDir, "B");
    const rE = makeRobot(art_1x1, dir.initialDir, "E");
    const ax = 10,
      ay = 10;
    const bx = ax + dir.dx,
      by = ay + dir.dy;
    const ex = bx + dir.dx,
      ey = by + dir.dy;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rA, rB, rE],
      initialSelected: 0,
      initialX: [ax, bx, ex],
      initialY: [ay, by, ey],
    });
    await vi.waitFor(() => {
      expect(findArtPositions(lastFrame() ?? "", art_1x1).length).toBe(3);
    });

    move(stdin, dir);

    await vi.waitFor(() => {
      const p = findArtPositions(lastFrame() ?? "", art_1x1);
      expect(p).toContainEqual({ x: ax + dir.dx, y: ay + dir.dy });
      expect(p).toContainEqual({ x: bx + dir.dx, y: by + dir.dy });
      expect(p).toContainEqual({ x: ex + dir.dx, y: ey + dir.dy });
    });
  });
});

describe("parallel 2-block push -> simultaneous push on single block", () => {
  it.each(DIRS)("C pushes A, B and F $name", async (dir) => {
    const rC = makeRobot(art_2x2, dir.initialDir, "C");
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rB = makeRobot(art_1x1, dir.initialDir, "B");
    const rF = makeRobot(art_2x2, dir.initialDir, "F");
    const cx = 5,
      cy = 5;
    let ax: number, ay: number, bx: number, by: number, fx: number, fy: number;
    if (dir.dx !== 0) {
      const col = dir.dx === 1 ? cx + 2 : cx - 1;
      ax = col;
      ay = cy;
      bx = col;
      by = cy + 1;
      fx = dir.dx === 1 ? col + 1 : col - 2;
      fy = cy;
    } else {
      const row = dir.dy === 1 ? cy + 2 : cy - 1;
      ax = cx;
      ay = row;
      bx = cx + 1;
      by = row;
      fx = cx;
      fy = dir.dy === 1 ? row + 1 : row - 2;
    }

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rC, rA, rB, rF],
      initialSelected: 0,
      initialX: [cx, ax, bx, fx],
      initialY: [cy, ay, by, fy],
    });
    await vi.waitFor(() => {
      expect(lastFrame()).toBeDefined();
    });

    move(stdin, dir);

    await vi.waitFor(() => {
      const p = findArtPositions(lastFrame() ?? "", art_2x2);
      expect(p).toContainEqual({ x: cx + dir.dx, y: cy + dir.dy });
      expect(p).toContainEqual({ x: fx + dir.dx, y: fy + dir.dy });
    });
  });
});

describe("sequential block push -> parallel block push", () => {
  it.each(DIRS)("A pushes C, B and E $name", async (dir) => {
    const rA = makeRobot(art_1x1, dir.initialDir, "A");
    const rC = makeRobot(art_2x2, dir.initialDir, "C");
    const rB = makeRobot(art_1x1, dir.initialDir, "B");
    const rE = makeRobot(art_1x1, dir.initialDir, "E");
    const ax = 10,
      ay = 10;
    let cx: number, cy: number, bx: number, by: number, ex: number, ey: number;
    if (dir.dx !== 0) {
      cx = dir.dx === 1 ? ax + 1 : ax - 2;
      cy = ay;
      const far = dir.dx === 1 ? cx + 2 : cx - 1;
      bx = far;
      by = cy;
      ex = far;
      ey = cy + 1;
    } else {
      cx = ax;
      cy = dir.dy === 1 ? ay + 1 : ay - 2;
      const far = dir.dy === 1 ? cy + 2 : cy - 1;
      bx = cx;
      by = far;
      ex = cx + 1;
      ey = far;
    }

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rA, rC, rB, rE],
      initialSelected: 0,
      initialX: [ax, cx, bx, ex],
      initialY: [ay, cy, by, ey],
    });
    await vi.waitFor(() => {
      expect(lastFrame()).toBeDefined();
    });

    move(stdin, dir);

    await vi.waitFor(() => {
      const p = findArtPositions(lastFrame() ?? "", art_1x1);
      expect(p).toContainEqual({ x: ax + dir.dx, y: ay + dir.dy });
      expect(p).toContainEqual({ x: bx + dir.dx, y: by + dir.dy });
      expect(p).toContainEqual({ x: ex + dir.dx, y: ey + dir.dy });
    });
  });
});

describe("self-intersection with disjoint robot art", () => {
  it("G completes a loop returning to its original position", async () => {
    const rG = makeRobot(art_disjoint, DirectionX.Left, "G");
    const rH = makeRobot(art_disjoint, DirectionX.Left, "H");
    const gx = 1,
      gy = 1,
      hx = 1,
      hy = 2;

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rG, rH],
      initialSelected: 0,
      initialX: [gx, hx],
      initialY: [gy, hy],
    });
    await vi.waitFor(() => {
      expect(lastFrame()).toBeDefined();
    });

    stdin.write(ARROW.left);
    stdin.write(ARROW.down);
    stdin.write(ARROW.down);
    stdin.write(ARROW.right);
    stdin.write(ARROW.right);
    stdin.write(ARROW.up);
    stdin.write(ARROW.up);

    await vi.waitFor(() => {
      const p = findArtPositions(lastFrame() ?? "", art_disjoint);
      expect(p).toContainEqual({ x: gx, y: gy });
    });
  });
});

describe("maze escape", () => {
  it("robot A can escape maze A", async () => {
    const rMaze = makeRobot(art_maze, DirectionX.Right, "Maze");
    const rA = makeRobot(art_1x1, DirectionX.Right, "A");
    const mx = 0,
      my = 0;
    const ax = mx + MAZE_A_START.x,
      ay = my + MAZE_A_START.y;
    const path = solveMaze(art_maze, MAZE_A_START.x, MAZE_A_START.y);
    expect(path).not.toBeNull();

    const { lastFrame, stdin } = renderRobotGame({
      initialRobot: [rMaze, rA],
      initialSelected: 1,
      initialX: [mx, ax],
      initialY: [my, ay],
    });
    await vi.waitFor(() => {
      expect(lastFrame()).toBeDefined();
    });

    let ex = ax,
      ey = ay;
    for (const step of path!) {
      ex += step.dx;
      ey += step.dy;
    }

    replayMoves(stdin, path!);

    const mazeW = Math.max(...art_maze.split("\n").map((l) => l.length));
    const mazeH = art_maze.split("\n").length;
    expect(ex < mx || ex >= mx + mazeW || ey < my || ey >= my + mazeH).toBe(
      true,
    );

    await vi.waitFor(() => {
      expect(frameContainsArt(lastFrame() ?? "", art_maze)).toBe(true);
    });
  });

  it("solution uses at most 20 steps per direction", () => {
    const path = solveMaze(art_maze, MAZE_A_START.x, MAZE_A_START.y);
    expect(path).not.toBeNull();
    let run = 0,
      prev = "";
    for (const step of path!) {
      const key = `${step.dx},${step.dy}`;
      run = key === prev ? run + 1 : 1;
      prev = key;
      expect(run).toBeLessThanOrEqual(20);
    }
  });
});

describe("overlapping bounding box rendering", () => {
  it.each([
    { order: "I then J", first: "I" as const },
    { order: "J then I", first: "J" as const },
  ])("I and J fully visible ($order)", async ({ first }) => {
    const robots = first === "I" ? [iRobot(), jRobot()] : [jRobot(), iRobot()];
    const xs = first === "I" ? [0, 0] : [0, 0];
    const ys = first === "I" ? [0, 1] : [1, 0];

    const { lastFrame } = renderRobotGame({
      initialRobot: robots,
      initialSelected: 0,
      initialX: xs,
      initialY: ys,
    });

    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(frameContainsArt(frame, art_L)).toBe(true);
      expect(frameContainsArt(frame, art_J)).toBe(true);
    });
  });

  const perms = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];
  it.each(
    perms.map((p) => ({
      label: p.map((i) => ["I", "J1", "J2"][i]).join(", "),
      perm: p,
    })),
  )("I, J1, J2 fully visible ($label)", async ({ perm }) => {
    const all = [iRobot(), jRobot("J1"), jRobot("J2")];
    const allX = [1, 0, 1],
      allY = [0, 1, 2];
    const ordered = perm.map((i) => all[i]);
    const orderedX = perm.map((i) => allX[i]);
    const orderedY = perm.map((i) => allY[i]);

    const { lastFrame } = renderRobotGame({
      initialRobot: ordered,
      initialSelected: 0,
      initialX: orderedX,
      initialY: orderedY,
    });

    await vi.waitFor(() => {
      const frame = lastFrame() ?? "";
      expect(frameContainsArt(frame, art_L)).toBe(true);
      expect(frameContainsArt(frame, art_J)).toBe(true);
    });
  });
});

describe("staircase bbox overlap (K)", () => {
  const K_SETUPS = [
    {
      name: "right",
      dx: 1,
      dy: 0,
      arrow: ARROW.right,
      dir: DirectionX.Right,
      k1: { x: WINDOW_WIDTH - 6, y: 5 },
      k2: { x: WINDOW_WIDTH - 3, y: 5 },
    },
    {
      name: "left",
      dx: -1,
      dy: 0,
      arrow: ARROW.left,
      dir: DirectionX.Left,
      k1: { x: 3, y: 5 },
      k2: { x: 0, y: 5 },
    },
    {
      name: "down",
      dx: 0,
      dy: 1,
      arrow: ARROW.down,
      dir: DirectionX.Right,
      k1: { x: 5, y: WINDOW_HEIGHT - 4 },
      k2: { x: 4, y: WINDOW_HEIGHT - 2 },
    },
    {
      name: "up",
      dx: 0,
      dy: -1,
      arrow: ARROW.up,
      dir: DirectionX.Right,
      k1: { x: 5, y: 2 },
      k2: { x: 6, y: 0 },
    },
  ];

  it.each(K_SETUPS)(
    "K1 can overlap K2 bounding box moving $name",
    async ({ arrow, dir, k1, k2, dx, dy }) => {
      const rK1 = makeRobot(art_K, dir, "K1");
      const rK2 = makeRobot(art_K, dir, "K2");

      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: [rK1, rK2],
        initialSelected: 0,
        initialX: [k1.x, k2.x],
        initialY: [k1.y, k2.y],
      });

      await vi.waitFor(() => {
        expect(lastFrame()).toBeDefined();
      });

      stdin.write(arrow);

      await vi.waitFor(() => {
        const p = findArtPositions(lastFrame() ?? "", art_K);
        expect(p).toContainEqual({ x: k1.x + dx, y: k1.y + dy });
        expect(p).toContainEqual({ x: k2.x, y: k2.y });
      });
    },
  );

  it.each(K_SETUPS)(
    "K1 cannot push K2 outside of the window moving $name",
    async ({ arrow, dir, k1, k2, dx, dy }) => {
      const rK1 = makeRobot(art_K, dir, "K1");
      const rK2 = makeRobot(art_K, dir, "K2");

      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: [rK1, rK2],
        initialSelected: 0,
        initialX: [k1.x, k2.x],
        initialY: [k1.y, k2.y],
      });

      await vi.waitFor(() => {
        expect(lastFrame()).toBeDefined();
      });

      stdin.write(arrow);

      await vi.waitFor(() => {
        const p = findArtPositions(lastFrame() ?? "", art_K);
        expect(p).toContainEqual({ x: k1.x + dx, y: k1.y + dy });
      });

      stdin.write(arrow);

      await vi.waitFor(() => {
        const p = findArtPositions(lastFrame() ?? "", art_K);
        expect(p).toContainEqual({ x: k1.x + dx, y: k1.y + dy });
        expect(p).toContainEqual({ x: k2.x, y: k2.y });
      });
    },
  );
});
