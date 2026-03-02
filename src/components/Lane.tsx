import { useEffect, useRef } from "react";
import type { AgentId, ReplayEvent, MessageData } from "../types";

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

// Map target agent ID to a short display label
function targetLabel(to: AgentId | null): string | null {
  if (!to) return null;
  const display = AGENT_DISPLAY[to];
  return display ? display.role : null;
}

interface LaneProps {
  agentId: AgentId;
  events: ReplayEvent[];
  latestEventActor: AgentId | null;
}

export default function Lane({ agentId, events, latestEventActor }: LaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const display = AGENT_DISPLAY[agentId];

  // Filter messages sent BY this agent
  const messages = events.filter(
    (e) => e.type === "message" && e.actor === agentId
  );

  const isActive = latestEventActor === agentId;

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

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

      {/* Scrollable message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((event) => {
          const data = event.data as MessageData;
          const isUrgent = data.urgent;
          const target = targetLabel(data.to);

          return (
            <div
              key={event.id}
              className={`p-2.5 rounded-lg border text-xs ${display.bgClass} ${
                isUrgent ? "border-urgent" : display.borderClass
              }`}
            >
              {target && (
                <div className={`text-[10px] ${display.textClass} opacity-70 mb-1`}>
                  {"-> "}{target}
                </div>
              )}
              <div className="text-gray-300 line-clamp-3 whitespace-pre-wrap">
                {data.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
