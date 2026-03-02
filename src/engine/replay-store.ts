import { create } from "zustand";
import type { ReplayData, ReplayEvent } from "../types";
import replayDataRaw from "../data/replay-data.json";

const replayData = replayDataRaw as ReplayData;

// ── Gap compression ────────────────────────────────────────────
// Raw session: 8.3 hours with long human-input waits.
// Compress gaps so the replay feels natural without dead stalls.
//
// Strategy:
//   gap < 60s   → keep as-is (natural conversation pace)
//   gap 60-300s → compress to 15s + 20% of excess (light squeeze)
//   gap > 300s  → compress to 30s (hard cap — session breaks)

const GAP_TIER1 = 60_000;   // 1 min in ms
const GAP_TIER2 = 300_000;  // 5 min in ms

function compressGap(rawGapMs: number): number {
  if (rawGapMs <= GAP_TIER1) return rawGapMs;
  if (rawGapMs <= GAP_TIER2) {
    // 15s base + 20% of excess over 1min
    return 15_000 + (rawGapMs - GAP_TIER1) * 0.2;
  }
  // Hard cap: 30s for anything over 5min
  return 30_000;
}

// Pre-compute compressed offsets
const rawTimes = replayData.events.map((e) => new Date(e.timestamp).getTime());
const compressedOffsets: number[] = [0];
for (let i = 1; i < rawTimes.length; i++) {
  const rawGap = rawTimes[i] - rawTimes[i - 1];
  compressedOffsets.push(compressedOffsets[i - 1] + compressGap(rawGap));
}

const duration = compressedOffsets[compressedOffsets.length - 1] || 0;

const eventsWithOffset = replayData.events.map((event, i) => ({
  ...event,
  _offset: compressedOffsets[i],
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
