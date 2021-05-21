import React from "react";
import { render } from "ink";
import clear from "console-clear";
import { MemoryRouter, Route } from "react-router";

import Intro from "./pages/Intro";
import RobotGame from "./pages/RobotGame";
import Outro from "./pages/Outro";

// Clear the console
clear(true);

// Increase stdin listeners (stop node complaining)
process.stdin.setMaxListeners(100);

render(
  <MemoryRouter>
    <Route path="/" component={Intro} exact={true} />
    <Route path="/robot-me-baby" component={RobotGame} exact={true} />
    <Route path="/outro" component={Outro} exact={true} />
  </MemoryRouter>
);
