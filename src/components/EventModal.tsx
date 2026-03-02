import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModalStore } from "../engine/modal-store";
import type {
  MessageData,
  DecisionData,
  ArtifactData,
  HandoffData,
  CommentData,
  PresenceData,
} from "../types";

function renderEventContent(type: string, data: unknown): React.ReactNode {
  switch (type) {
    case "message": {
      const d = data as MessageData;
      return (
        <>
          {d.to && (
            <div className="text-xs text-gray-400 mb-2">
              To: <span className="text-gray-200">{d.to}</span>
              {d.urgent && (
                <span className="ml-2 text-urgent font-bold">URGENT</span>
              )}
            </div>
          )}
          <div className="text-sm text-gray-200 whitespace-pre-wrap">
            {d.body}
          </div>
        </>
      );
    }
    case "decision": {
      const d = data as DecisionData;
      return (
        <>
          <div className="text-decision font-bold text-sm mb-2">{d.title}</div>
          <div className="text-xs text-gray-500 font-mono">Hash: {d.hash}</div>
        </>
      );
    }
    case "artifact": {
      const d = data as ArtifactData;
      const ghUrl = `https://github.com/bulwark-live/glink-channel/blob/${d.hash}/workspace/active/${d.filename}`;
      return (
        <>
          <a
            href={ghUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 hover:underline mb-1 block"
          >
            {d.filename}
          </a>
          <div className="text-xs text-gray-500 font-mono">
            Hash: <a href={ghUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">{d.hash}</a>
          </div>
        </>
      );
    }
    case "handoff": {
      const d = data as HandoffData;
      return (
        <>
          <div className="text-sm text-gray-200 whitespace-pre-wrap mb-3">
            {d.summary}
          </div>
          {d.inProgress.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-400 font-bold mb-1">
                In Progress:
              </div>
              <ul className="text-xs text-gray-300 list-disc list-inside">
                {d.inProgress.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {d.nextSteps.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 font-bold mb-1">
                Next Steps:
              </div>
              <ul className="text-xs text-gray-300 list-disc list-inside">
                {d.nextSteps.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      );
    }
    case "comment": {
      const d = data as CommentData;
      return (
        <>
          <div className="text-xs text-gray-400 mb-2">
            On: <span className="text-gray-300">{d.artifact}</span>
          </div>
          <div className="text-sm text-gray-200 whitespace-pre-wrap">
            {d.body}
          </div>
        </>
      );
    }
    case "presence": {
      const d = data as PresenceData;
      return (
        <div className="text-sm text-gray-300">
          Status:{" "}
          <span
            className={
              d.status === "online" ? "text-green-400" : "text-gray-500"
            }
          >
            {d.status}
          </span>
        </div>
      );
    }
    default:
      return (
        <div className="text-sm text-gray-400 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </div>
      );
  }
}

const TYPE_LABELS: Record<string, string> = {
  message: "Message",
  decision: "Decision",
  artifact: "Artifact",
  handoff: "Handoff",
  comment: "Comment",
  presence: "Presence",
};

export default function EventModal() {
  const event = useModalStore((s) => s.event);
  const close = useModalStore((s) => s.close);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={close}
        >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-5 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    event.type === "decision"
                      ? "bg-decision/20 text-decision"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {TYPE_LABELS[event.type] || event.type}
                </span>
                <span className="text-xs text-gray-400">{event.actor}</span>
              </div>
              <button
                onClick={close}
                className="text-gray-500 hover:text-gray-300 text-lg leading-none"
                title="Close"
              >
                &#10005;
              </button>
            </div>

            {/* Timestamp */}
            <div className="text-[10px] text-gray-500 mb-3">
              {new Date(event.timestamp).toLocaleString()}
            </div>

            {/* Content */}
            {renderEventContent(event.type, event.data)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
