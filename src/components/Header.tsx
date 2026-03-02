import { useReplayStore } from "../engine/replay-store";

export default function Header() {
  const meta = useReplayStore((s) => s.meta);
  const visibleEvents = useReplayStore((s) => s.visibleEvents);

  const messageCount = visibleEvents.filter((e) => e.type === "message").length;
  const decisionCount = visibleEvents.filter(
    (e) => e.type === "decision"
  ).length;
  const artifactCount = visibleEvents.filter(
    (e) => e.type === "artifact"
  ).length;

  return (
    <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between bg-gray-900/80 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-bold text-white">GLink Replay</h1>
        <p className="text-xs text-gray-400">{meta.title}</p>
      </div>
      <div className="flex items-center gap-6 text-xs">
        <div className="text-gray-400">
          <span className="text-white font-bold">{messageCount}</span> messages
        </div>
        <div className="text-gray-400">
          <span className="text-decision font-bold">{decisionCount}</span>{" "}
          decisions
        </div>
        <div className="text-gray-400">
          <span className="text-white font-bold">{artifactCount}</span>{" "}
          artifacts
        </div>
      </div>
    </header>
  );
}
