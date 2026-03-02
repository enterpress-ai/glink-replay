import { useReplayStore } from "../engine/replay-store";
import { useModalStore } from "../engine/modal-store";
import type { AgentId } from "../types";
import Lane from "./Lane";
import DecisionBanner from "./DecisionBanner";

const AGENTS: AgentId[] = ["Architect-CEO", "Architect-CTO", "Architect-COO"];

export default function Lanes() {
  const visibleEvents = useReplayStore((s) => s.visibleEvents);
  const openModal = useModalStore((s) => s.open);

  // The actor of the most recent visible event
  const latestEventActor =
    visibleEvents.length > 0
      ? visibleEvents[visibleEvents.length - 1].actor
      : null;

  // Filter decisions for banners
  const decisions = visibleEvents.filter((e) => e.type === "decision");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Decision banners — full-width above lanes */}
      {decisions.length > 0 && (
        <div className="border-b border-gray-800 max-h-32 overflow-y-auto px-4 py-2 space-y-1.5">
          {decisions.map((event) => (
            <DecisionBanner
              key={event.id}
              event={event}
              onClick={() => openModal(event)}
            />
          ))}
        </div>
      )}

      {/* Three-lane columns */}
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
    </div>
  );
}
