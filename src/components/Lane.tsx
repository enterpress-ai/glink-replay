import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type {
  AgentId,
  ReplayEvent,
  MessageData,
  ArtifactData,
  HandoffData,
} from "../types";
import { useModalStore } from "../engine/modal-store";

const AGENT_DISPLAY: Record<
  AgentId,
  { role: string; colorDot: string; bgClass: string; textClass: string; borderClass: string }
> = {
  "Architect-CEO": {
    role: "CEO",
    colorDot: "bg-ceo",
    bgClass: "bg-ceo/10",
    textClass: "text-ceo",
    borderClass: "border-ceo/30",
  },
  "Architect-CTO": {
    role: "CTO",
    colorDot: "bg-cto",
    bgClass: "bg-cto/10",
    textClass: "text-cto",
    borderClass: "border-cto/30",
  },
  "Architect-COO": {
    role: "COO",
    colorDot: "bg-coo",
    bgClass: "bg-coo/10",
    textClass: "text-coo",
    borderClass: "border-coo/30",
  },
};

// Map agent ID to short display label
function shortLabel(agentId: AgentId): string {
  const display = AGENT_DISPLAY[agentId];
  return display ? display.role : agentId;
}

interface LaneEvent {
  event: ReplayEvent;
  kind: "sent" | "incoming" | "artifact" | "handoff";
}

interface LaneProps {
  agentId: AgentId;
  events: ReplayEvent[];
  eventSeqMap: Map<string, number>;
  latestEventActor: AgentId | null;
}

export default function Lane({ agentId, events, eventSeqMap, latestEventActor }: LaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const display = AGENT_DISPLAY[agentId];
  const openModal = useModalStore((s) => s.open);

  // Build lane events: messages sent by this agent, messages TO this agent,
  // artifacts by this agent, handoffs by this agent
  const laneEvents: LaneEvent[] = [];

  for (const e of events) {
    if (e.type === "message" && e.actor === agentId) {
      laneEvents.push({ event: e, kind: "sent" });
    } else if (e.type === "message" && e.actor !== agentId) {
      const data = e.data as MessageData;
      if (data.to === agentId || data.to === null) {
        laneEvents.push({ event: e, kind: "incoming" });
      }
    } else if (e.type === "artifact" && e.actor === agentId) {
      laneEvents.push({ event: e, kind: "artifact" });
    } else if (e.type === "handoff" && e.actor === agentId) {
      laneEvents.push({ event: e, kind: "handoff" });
    }
  }

  // Sort by timestamp (events are already sorted, but let's be safe)
  laneEvents.sort(
    (a, b) =>
      new Date(a.event.timestamp).getTime() -
      new Date(b.event.timestamp).getTime()
  );

  const isActive = latestEventActor === agentId;

  // Auto-scroll to bottom when event count changes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [laneEvents.length]);

  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800 last:border-r-0">
      {/* Lane header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${display.colorDot}`} />
          {isActive && (
            <div
              className={`absolute inset-0 w-3 h-3 rounded-full ${display.colorDot} animate-ping opacity-75`}
            />
          )}
        </div>
        <div>
          <span className={`text-sm font-bold ${display.textClass}`}>
            {display.role}
          </span>
          <span className="text-xs text-gray-500 ml-2">{agentId}</span>
        </div>
      </div>

      {/* Scrollable event list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {laneEvents.map(({ event, kind }) => {
          const seq = eventSeqMap.get(event.id);

          if (kind === "sent") {
            const data = event.data as MessageData;
            const isUrgent = data.urgent;
            const target = data.to ? shortLabel(data.to) : null;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => openModal(event)}
                className={`relative p-2.5 rounded-lg border text-xs cursor-pointer hover:brightness-125 ${display.bgClass} ${
                  isUrgent ? "border-urgent" : display.borderClass
                }`}
              >
                {seq && (
                  <span className="absolute top-1 right-1.5 text-[9px] font-mono text-gray-500 opacity-60">
                    {seq}
                  </span>
                )}
                {target && (
                  <div
                    className={`text-[10px] ${display.textClass} opacity-70 mb-1`}
                  >
                    {"-> "}
                    {target}
                  </div>
                )}
                <div className="text-gray-300 line-clamp-3 whitespace-pre-wrap">
                  {data.body}
                </div>
              </motion.div>
            );
          }

          if (kind === "incoming") {
            const data = event.data as MessageData;
            const senderLabel = shortLabel(event.actor);

            return (
              <motion.div
                key={event.id + "-in"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => openModal(event)}
                className="relative p-2.5 rounded-lg border border-dashed border-gray-600 text-xs opacity-60 cursor-pointer hover:brightness-125"
              >
                {seq && (
                  <span className="absolute top-1 right-1.5 text-[9px] font-mono text-gray-500">
                    {seq}
                  </span>
                )}
                <div className="text-[10px] text-gray-400 mb-1">
                  {"<- "}
                  {senderLabel}
                </div>
                <div className="text-gray-400 line-clamp-2 whitespace-pre-wrap">
                  {data.body}
                </div>
              </motion.div>
            );
          }

          if (kind === "artifact") {
            const data = event.data as ArtifactData;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => openModal(event)}
                className="relative p-2.5 rounded-lg border border-gray-700 bg-gray-900/50 text-xs cursor-pointer hover:brightness-125"
              >
                {seq && (
                  <span className="absolute top-1 right-1.5 text-[9px] font-mono text-gray-500">
                    {seq}
                  </span>
                )}
                <div className="text-[10px] text-gray-500 mb-0.5">
                  artifact
                </div>
                <div className="text-gray-300 truncate">{data.filename}</div>
              </motion.div>
            );
          }

          if (kind === "handoff") {
            const data = event.data as HandoffData;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => openModal(event)}
                className="relative p-2.5 rounded-lg border border-gray-700 text-xs cursor-pointer hover:brightness-125"
              >
                {seq && (
                  <span className="absolute top-1 right-1.5 text-[9px] font-mono text-gray-500">
                    {seq}
                  </span>
                )}
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                  Handoff
                </div>
                <div className="text-gray-300 line-clamp-2 whitespace-pre-wrap">
                  {data.summary}
                </div>
              </motion.div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
