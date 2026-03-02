import { useEffect, useRef } from "react";
import { useReplayStore } from "../engine/replay-store";

export function usePlaybackLoop() {
  const lastFrameRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const loop = (now: number) => {
      const { playing, tick } = useReplayStore.getState();

      if (playing) {
        if (lastFrameRef.current !== null) {
          const delta = now - lastFrameRef.current;
          tick(delta);
        }
        lastFrameRef.current = now;
      } else {
        lastFrameRef.current = null;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
}
