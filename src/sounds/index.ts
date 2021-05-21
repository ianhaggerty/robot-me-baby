import sound from "sound-play";
import path from "path";

enum Sounds {
  Ambience = "ambience.wav",
  Broken = "broken-robot.mp3",
  Future = "future.mp3",
  Glitch = "glitch.wav",
  Intro = "intro.wav",
  No = "no.wav",
  Explode = "nuclear_explode.mp3",
  Confirm = "retro-confirm.wav",
  Speak = "speak.wav",
  Stomps = "stomps.wav",
  Sweep = "sweep.wav",
  TypeBeep = "type-beep.wav",
  Yes = "yes.wav",
}

function playSound(file: Sounds, volume = 0.5) {
  sound.play(path.resolve(__dirname, file), volume);
}

export { Sounds, playSound };
