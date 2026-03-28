import React from "react";
import { render } from "ink";
import clear from "console-clear";
import { MemoryRouter, Routes, Route } from "react-router";

import Intro from "./pages/Intro.js";
import RobotGame from "./pages/RobotGame.js";
import Outro from "./pages/Outro.js";

// Clear the console
clear(true);

// Increase stdin listeners (stop node complaining)
process.stdin.setMaxListeners(100);

render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/robot-me-baby" element={<RobotGame />} />
      <Route path="/outro" element={<Outro />} />
    </Routes>
  </MemoryRouter>
);
