import { useMemo } from "react";
import { useReplayStore } from "../engine/replay-store";
import { useModalStore } from "../engine/modal-store";
import type { AgentId } from "../types";
import Lane from "./Lane";
import DecisionBanner from "./DecisionBanner";

const AGENTS: AgentId[] = ["Architect-CTO", "Architect-CEO", "Architect-COO"];

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

  // Build global sequence map: event id -> 1-based chronological index
  // Only count events that appear in lanes (messages, artifacts, handoffs)
  const eventSeqMap = useMemo(() => {
    const map = new Map<string, number>();
    let seq = 1;
    for (const e of visibleEvents) {
      if (e.type === "message" || e.type === "artifact" || e.type === "handoff") {
        map.set(e.id, seq++);
      }
    }
    return map;
  }, [visibleEvents]);

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
            eventSeqMap={eventSeqMap}
            latestEventActor={latestEventActor}
          />
        ))}
      </div>
    </div>
  );
}
