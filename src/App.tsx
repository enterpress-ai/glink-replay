import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useReplayStore } from "./engine/replay-store";
import { usePlaybackLoop } from "./hooks/usePlaybackLoop";
import Header from "./components/Header";
import Lanes from "./components/Lanes";
import Timeline from "./components/Timeline";
import StatsOverlay from "./components/StatsOverlay";
import EventModal from "./components/EventModal";
import IntroOverlay from "./components/IntroOverlay";

const SPEED_MAP: Record<string, number> = {
  "1": 1,
  "2": 5,
  "3": 10,
  "4": 50,
  "5": 100,
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  usePlaybackLoop();

  const handleDismiss = useCallback(() => {
    setShowIntro(false);
    useReplayStore.getState().play();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // During intro, only Enter dismisses
      if (showIntro) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleDismiss();
        }
        return;
      }

      const store = useReplayStore.getState();

      if (e.code === "Space") {
        e.preventDefault();
        store.togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        store.skipToNextDecision();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        store.skipToPrevDecision();
      } else if (e.key in SPEED_MAP) {
        e.preventDefault();
        store.setSpeed(SPEED_MAP[e.key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIntro, handleDismiss]);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <Header />
      <Lanes />
      {/* Spacer for fixed timeline */}
      <div className="h-20 shrink-0" />
      <Timeline />
      <StatsOverlay />
      <EventModal />
      <AnimatePresence>
        {showIntro && <IntroOverlay onDismiss={handleDismiss} />}
      </AnimatePresence>
    </div>
  );
}
