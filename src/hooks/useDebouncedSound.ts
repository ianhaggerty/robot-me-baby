import { useRef, useEffect } from "react";
import { playSound, Sounds } from "../assets/sounds.js";

export default function useDebouncedSound(
  sound: Sounds,
  debounceMs = 1000,
): () => void {
  const isPlayingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return () => {
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      playSound(sound);
      timerRef.current = setTimeout(() => {
        isPlayingRef.current = false;
        timerRef.current = null;
      }, debounceMs);
    }
  };
}
