import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { cleanup } from "ink-testing-library";

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
} from "../utility/test.js";
import Robot from "../models/Robot.js";
import { DirectionX } from "../utility/enums.js";
import rawRobots from "../assets/robots.js";
import rawExplosions from "../assets/explosions.js";
import { Color } from "../assets/colors.js";
import { playSound } from "../assets/sounds.js";

const mockNavigate = vi.fn();
const mockPlaySound = vi.mocked(playSound);
vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../assets/sounds.js", () => ({
  playSound: vi.fn(),
  Sounds: {
    Ambience: "ambience.wav",
    Broken: "broken-robot.mp3",
    Future: "future.mp3",
    Glitch: "glitch.wav",
    Intro: "intro.wav",
    No: "no.wav",
    Explode: "nuclear_explode.mp3",
    Confirm: "retro-confirm.wav",
    Speak: "speak.wav",
    IamRobot: "i_am_robot_2.wav",
    Stomps: "stomps.wav",
    Sweep: "sweep.wav",
    TypeBeep: "type-beep.wav",
    Yes: "yes.wav",
    Wrong: "wrong.mp3",
  },
}));

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

  afterEach(() => {
    cleanup();
    mockPlaySound.mockClear();
    mockNavigate.mockClear();
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
      cleanup();

      // As soon as we see two different frames, randomness is confirmed
      if (frames.length >= 2 && new Set(frames).size > 1) break;
    }

    expect(new Set(frames).size).toBeGreaterThan(1);
  });

  it(
    "ends the game when all robots have been removed from the scene",
    { timeout: 15000 },
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
      cleanup();
    }

    function expectNoError(props: Record<string, unknown>) {
      const { hasError } = renderRobotGameExpectNoError(props);
      expect(hasError).toBe(false);
      cleanup();
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

    it("errors if initial robot bboxes overlap", () => {
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

    it("plays wrong.mp3 when moving into another robot's bounding box", async () => {
      // robotA (15w) at x=0, robotB at x=15 — touching, no gap.
      // Moving robotA right (x=0 -> x=1) would overlap with robotB.
      const { lastFrame, stdin } = renderRobotGame({
        initialRobot: [robotA, robotB],
        initialSelected: 0,
        initialX: [0, 15],
        initialY: [0, 0],
      });

      await vi.waitFor(() => {
        expect(countArtOccurrences(lastFrame() ?? "", robotAArt)).toBe(1);
      });

      // robotA already faces right — press right to attempt move
      mockPlaySound.mockClear();
      stdin.write("\x1B[C");
      await vi.waitFor(() => {
        expect(mockPlaySound).toHaveBeenCalledWith("wrong.mp3");
      });
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
