declare module "console-clear" {
  function clear(clearHistory?: boolean): void;
  export default clear;
}

declare module "sound-play" {
  const sound: {
    play(filePath: string, volume?: number): Promise<void>;
  };
  export default sound;
}
