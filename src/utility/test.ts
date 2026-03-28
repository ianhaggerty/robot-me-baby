// eslint-disable-next-line no-control-regex
const ANSI_REGEX =
  /[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

export function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, "");
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function frameContainsArt(frame: string, art: string): boolean {
  const clean = stripAnsi(frame);
  return art.split("\n").every((line) => clean.includes(line));
}

export function pressKey(
  stdin: { write: (data: string) => void },
  key: string,
  count = 1,
): void {
  for (let i = 0; i < count; i++) {
    stdin.write(key);
  }
}
