import { useReplayStore } from "../engine/replay-store";
import type { AgentId } from "../types";
import Lane from "./Lane";

const AGENTS: AgentId[] = ["Architect-CEO", "Architect-CTO", "Architect-COO"];

export default function Lanes() {
  const visibleEvents = useReplayStore((s) => s.visibleEvents);

  // The actor of the most recent visible event
  const latestEventActor =
    visibleEvents.length > 0
      ? visibleEvents[visibleEvents.length - 1].actor
      : null;

  return (
    <div className="flex-1 flex min-h-0">
      {AGENTS.map((agentId) => (
        <Lane
          key={agentId}
          agentId={agentId}
          events={visibleEvents}
          latestEventActor={latestEventActor}
        />
      ))}
    </div>
  );
}
