import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "ink-testing-library";
import { MemoryRouter } from "react-router";

import { frameContainsArt, pressKey } from "../utility/test.js";
import RobotGame from "./RobotGame.js";
import Robot from "../models/Robot.js";
import { DirectionX } from "../utility/enums.js";
import rawRobots from "../assets/robots.js";
import rawExplosions from "../assets/explosions.js";

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
  },
}));

function renderRobotGame(
  props: { initialRobot?: Robot; initialX?: number; initialY?: number } = {},
) {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <RobotGame {...props} />
    </MemoryRouter>,
  );
}

describe("RobotGame", () => {
  const robot = new Robot({
    str: rawRobots[0].str,
    direction: rawRobots[0].direction,
    name: "Test Robot",
  });

  afterEach(() => {
    cleanup();
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
      initialRobot: robot, // defaults to direction left
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
});
