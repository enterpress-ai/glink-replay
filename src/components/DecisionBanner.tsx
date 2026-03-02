import { useState } from "react";
import { motion } from "framer-motion";
import type { ReplayEvent, DecisionData } from "../types";

interface DecisionBannerProps {
  event: ReplayEvent;
  onClick?: () => void;
}

export default function DecisionBanner({ event, onClick }: DecisionBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const data = event.data as DecisionData;

  const handleClick = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
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
        {onClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="text-gray-500 hover:text-gray-300 text-[10px] ml-1"
            title="View details"
          >
            ...
          </button>
        )}
      </div>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.15 }}
          className="mt-1 text-[10px] text-gray-500"
        >
          {new Date(event.timestamp).toLocaleTimeString()} &middot; {event.actor}
        </motion.div>
      )}
    </motion.div>
  );
}
