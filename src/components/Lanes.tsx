import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useReplayStore } from "../engine/replay-store";
import { useModalStore } from "../engine/modal-store";
import type {
  AgentId,
  ReplayEvent,
  MessageData,
  ArtifactData,
  HandoffData,
  DecisionData,
} from "../types";

const AGENTS: AgentId[] = ["Architect-CTO", "Architect-CEO", "Architect-COO"];

const AGENT_STYLE: Record<
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

function shortLabel(agentId: AgentId): string {
  return AGENT_STYLE[agentId]?.role ?? agentId;
}

export default function Lanes() {
  const visibleEvents = useReplayStore((s) => s.visibleEvents);
  const openModal = useModalStore((s) => s.open);
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestEventActor =
    visibleEvents.length > 0
      ? visibleEvents[visibleEvents.length - 1].actor
      : null;

  // Filter to renderable event types
  const timelineItems = useMemo(
    () =>
      visibleEvents.filter(
        (e) =>
          e.type === "message" ||
          e.type === "decision" ||
          e.type === "artifact" ||
          e.type === "handoff"
      ),
    [visibleEvents]
  );

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [timelineItems.length]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sticky column headers */}
      <div className="flex border-b border-gray-800">
        {AGENTS.map((agentId) => {
          const style = AGENT_STYLE[agentId];
          const isActive = latestEventActor === agentId;
          return (
            <div
              key={agentId}
              className="flex-1 px-4 py-3 border-r border-gray-800 last:border-r-0 flex items-center gap-3"
            >
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${style.colorDot}`} />
                {isActive && (
                  <div
                    className={`absolute inset-0 w-3 h-3 rounded-full ${style.colorDot} animate-ping opacity-75`}
                  />
                )}
              </div>
              <div>
                <span className={`text-sm font-bold ${style.textClass}`}>
                  {style.role}
                </span>
                <span className="text-xs text-gray-500 ml-2">{agentId}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified scrolling timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {timelineItems.map((event) => {
          // Decision: full-width banner row
          if (event.type === "decision") {
            const data = event.data as DecisionData;
            return (
              <div key={event.id} className="px-3 py-1.5">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => openModal(event)}
                  className="bg-gray-900 border border-decision/40 hover:border-decision/70 rounded-lg px-4 py-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-decision">
                      Decision
                    </span>
                    <span className="text-xs text-gray-200 truncate flex-1">
                      {data.title}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono shrink-0">
                      {data.hash}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          }

          // Message / artifact / handoff: placed in actor's column
          const colIndex = AGENTS.indexOf(event.actor);
          const style = AGENT_STYLE[event.actor];

          return (
            <div key={event.id} className="flex">
              {AGENTS.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-gray-800/20 last:border-r-0"
                >
                  {i === colIndex && (
                    <div className="px-2 py-1">
                      <EventCard
                        event={event}
                        style={style}
                        onClick={() => openModal(event)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Event card ──────────────────────────────────────────────────

interface EventCardProps {
  event: ReplayEvent;
  style: (typeof AGENT_STYLE)[AgentId];
  onClick: () => void;
}

function EventCard({ event, style, onClick }: EventCardProps) {
  if (event.type === "message") {
    const data = event.data as MessageData;
    const target = data.to ? shortLabel(data.to) : "all";
    const isUrgent = data.urgent;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:brightness-125 ${style.bgClass} ${
          isUrgent ? "border-urgent" : style.borderClass
        }`}
      >
        <div className={`text-[10px] ${style.textClass} opacity-70 mb-1`}>
          → {target}
        </div>
        <div className="text-gray-300 line-clamp-3 whitespace-pre-wrap">
          {data.body}
        </div>
      </motion.div>
    );
  }

  if (event.type === "artifact") {
    const data = event.data as ArtifactData;
    const ghUrl = `https://github.com/bulwark-live/glink-channel/blob/${data.hash}/workspace/active/${data.filename}`;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className="p-2.5 rounded-lg border border-gray-700 bg-gray-900/50 text-xs cursor-pointer hover:brightness-125"
      >
        <div className="text-[10px] text-gray-500 mb-0.5">artifact</div>
        <a
          href={ghUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-300 truncate block hover:text-white hover:underline"
        >
          {data.filename}
        </a>
      </motion.div>
    );
  }

  if (event.type === "handoff") {
    const data = event.data as HandoffData;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className="p-2.5 rounded-lg border border-gray-700 text-xs cursor-pointer hover:brightness-125"
      >
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
}
