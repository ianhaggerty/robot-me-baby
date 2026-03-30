# Golden Tests (Node.js)

Use this naming convention (filename must contain 'f2p' or 'p2p'):
- *.f2p.test.js / *.f2p.test.ts — Fail-to-Pass tests (fail before fix, pass after)
- *.p2p.test.js / *.p2p.test.ts — Pass-to-Pass tests (regression tests, always pass)

Examples:
  golden_tests/parser.f2p.test.ts
  golden_tests/parser.p2p.test.ts

All files here will be hidden from the agent before the task run.
