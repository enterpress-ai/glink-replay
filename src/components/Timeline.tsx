import { useCallback, useRef } from "react";
import { useReplayStore } from "../engine/replay-store";

const SPEED_PRESETS = [1, 5, 10, 50, 100] as const;

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Timeline() {
  const scrubberRef = useRef<HTMLDivElement>(null);

  const playing = useReplayStore((s) => s.playing);
  const speed = useReplayStore((s) => s.speed);
  const currentTime = useReplayStore((s) => s.currentTime);
  const duration = useReplayStore((s) => s.duration);
  const allEvents = useReplayStore((s) => s.allEvents);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const setSpeed = useReplayStore((s) => s.setSpeed);
  const seek = useReplayStore((s) => s.seek);
  const skipToNextDecision = useReplayStore((s) => s.skipToNextDecision);
  const skipToPrevDecision = useReplayStore((s) => s.skipToPrevDecision);

  const progress = duration > 0 ? currentTime / duration : 0;

  // Decision markers as percentage positions
  const decisionMarkers = allEvents
    .filter((e) => e.type === "decision")
    .map((e) => (e._offset / duration) * 100);

  const handleScrubberClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = scrubberRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      seek(ratio * duration);
    },
    [seek, duration]
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3 z-50">
      {/* Scrubber bar */}
      <div
        ref={scrubberRef}
        className="relative h-2 bg-gray-700 rounded-full cursor-pointer mb-3 group"
        onClick={handleScrubberClick}
      >
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-white/40 rounded-full transition-none"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Decision markers */}
        {decisionMarkers.map((pos, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-decision rounded-full"
            style={{ left: `${pos}%` }}
          />
        ))}
        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
          style={{ left: `${progress * 100}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Left: transport controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={skipToPrevDecision}
            className="text-gray-400 hover:text-white text-sm px-1"
            title="Previous decision"
          >
            {"◀◀"}
          </button>
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300 text-lg w-8 h-8 flex items-center justify-center"
            title={playing ? "Pause" : "Play"}
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            onClick={skipToNextDecision}
            className="text-gray-400 hover:text-white text-sm px-1"
            title="Next decision"
          >
            {"▶▶"}
          </button>
        </div>

        {/* Center: speed buttons */}
        <div className="flex items-center gap-1">
          {SPEED_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-xs rounded ${
                speed === s
                  ? "bg-white text-gray-900 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Right: time display */}
        <div className="text-gray-400 text-xs font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
