import { create } from "zustand";
import type { ReplayData, ReplayEvent } from "../types";
import replayDataRaw from "../data/replay-data.json";

const replayData = replayDataRaw as ReplayData;

const startTime = new Date(replayData.meta.startTime).getTime();
const endTime = new Date(replayData.meta.endTime).getTime();
const duration = endTime - startTime;

// Pre-compute event offsets for efficient filtering
const eventsWithOffset = replayData.events.map((event) => ({
  ...event,
  _offset: new Date(event.timestamp).getTime() - startTime,
}));

// Pre-compute decision event offsets for skip navigation
const decisionOffsets = eventsWithOffset
  .filter((e) => e.type === "decision")
  .map((e) => e._offset);

interface ReplayState {
  // Data
  meta: ReplayData["meta"];
  allEvents: (ReplayEvent & { _offset: number })[];

  // Playback state
  playing: boolean;
  speed: number;
  currentTime: number;

  // Derived
  startTime: number;
  endTime: number;
  duration: number;
  visibleEvents: ReplayEvent[];

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  seek: (timeMs: number) => void;
  tick: (deltaMs: number) => void;
  skipToNextDecision: () => void;
  skipToPrevDecision: () => void;
}

function computeVisibleEvents(
  allEvents: (ReplayEvent & { _offset: number })[],
  currentTime: number
): ReplayEvent[] {
  return allEvents.filter((e) => e._offset <= currentTime);
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  // Data
  meta: replayData.meta,
  allEvents: eventsWithOffset,

  // Playback state
  playing: false,
  speed: 10,
  currentTime: 0,

  // Derived
  startTime,
  endTime,
  duration,
  visibleEvents: [],

  // Actions
  play: () => set({ playing: true }),

  pause: () => set({ playing: false }),

  togglePlay: () => set((state) => ({ playing: !state.playing })),

  setSpeed: (speed: number) => set({ speed }),

  seek: (timeMs: number) => {
    const clamped = Math.max(0, Math.min(timeMs, duration));
    const { allEvents } = get();
    set({
      currentTime: clamped,
      visibleEvents: computeVisibleEvents(allEvents, clamped),
    });
  },

  tick: (deltaMs: number) => {
    const { currentTime, speed, allEvents } = get();
    const newTime = Math.min(currentTime + deltaMs * speed, duration);
    const visible = computeVisibleEvents(allEvents, newTime);
    set({
      currentTime: newTime,
      visibleEvents: visible,
      playing: newTime < duration,
    });
  },

  skipToNextDecision: () => {
    const { currentTime } = get();
    const next = decisionOffsets.find((offset) => offset > currentTime);
    if (next !== undefined) {
      get().seek(next);
    }
  },

  skipToPrevDecision: () => {
    const { currentTime } = get();
    // Find the last decision offset that is before currentTime (with a small margin)
    const prev = [...decisionOffsets]
      .reverse()
      .find((offset) => offset < currentTime - 100);
    if (prev !== undefined) {
      get().seek(prev);
    }
  },
}));
