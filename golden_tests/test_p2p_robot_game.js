// golden_tests/test_p2p_existing_suite.test.js
import { execSync } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const currentFileDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentFileDir, "..");

const result = execSync("npx vitest run src/pages/RobotGame.test.tsx", {
  cwd: repoRoot,
  encoding: "utf8",
  stdio: "inherit",
});
