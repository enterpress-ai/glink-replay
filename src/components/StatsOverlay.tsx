import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReplayStore } from "../engine/replay-store";
import type { AgentId } from "../types";

const AGENT_COLORS: Record<AgentId, { bar: string; text: string; label: string }> = {
  "Architect-CEO": { bar: "bg-ceo", text: "text-ceo", label: "CEO" },
  "Architect-CTO": { bar: "bg-cto", text: "text-cto", label: "CTO" },
  "Architect-COO": { bar: "bg-coo", text: "text-coo", label: "COO" },
};

const AGENTS: AgentId[] = ["Architect-CEO", "Architect-CTO", "Architect-COO"];

export default function StatsOverlay() {
  const [open, setOpen] = useState(false);
  const visibleEvents = useReplayStore((s) => s.visibleEvents);
  const allEvents = useReplayStore((s) => s.allEvents);

  const messageCount = visibleEvents.filter((e) => e.type === "message").length;
  const decisionCount = visibleEvents.filter((e) => e.type === "decision").length;
  const artifactCount = visibleEvents.filter((e) => e.type === "artifact").length;
  const handoffCount = visibleEvents.filter((e) => e.type === "handoff").length;

  // Per-agent counts (messages only)
  const perAgent: Record<AgentId, number> = {
    "Architect-CEO": 0,
    "Architect-CTO": 0,
    "Architect-COO": 0,
  };
  for (const e of visibleEvents) {
    if (e.type === "message" && e.actor in perAgent) {
      perAgent[e.actor as AgentId]++;
    }
  }
  const maxAgent = Math.max(...Object.values(perAgent), 1);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed top-3 right-3 z-50 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
      >
        Stats
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="stats-panel"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed top-12 right-3 z-50 bg-gray-900 border border-gray-700 rounded-xl p-4 w-64 shadow-2xl"
          >
            <div className="text-xs font-bold text-gray-300 mb-3">
              Event Stats
            </div>

            {/* Counters */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-gray-500">Messages</div>
                <div className="text-sm font-bold text-white">{messageCount}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-decision">Decisions</div>
                <div className="text-sm font-bold text-decision">{decisionCount}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-gray-500">Artifacts</div>
                <div className="text-sm font-bold text-white">{artifactCount}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="text-[10px] text-gray-500">Handoffs</div>
                <div className="text-sm font-bold text-white">{handoffCount}</div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 mb-4">
              <div className="text-[10px] text-gray-500">Progress</div>
              <div className="text-sm font-bold text-white">
                {visibleEvents.length}{" "}
                <span className="text-gray-500 font-normal">
                  / {allEvents.length}
                </span>
              </div>
            </div>

            {/* Per-agent bar chart */}
            <div className="text-[10px] text-gray-500 mb-2">
              Messages per Agent
            </div>
            <div className="space-y-2">
              {AGENTS.map((agentId) => {
                const count = perAgent[agentId];
                const pct = maxAgent > 0 ? (count / maxAgent) * 100 : 0;
                const colors = AGENT_COLORS[agentId];
                return (
                  <div key={agentId}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[10px] ${colors.text}`}>
                        {colors.label}
                      </span>
                      <span className="text-[10px] text-gray-500">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${colors.bar} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
