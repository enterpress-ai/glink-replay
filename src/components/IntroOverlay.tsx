import { motion } from "framer-motion";

const AGENTS = [
  { name: "CEO", role: "Vision & Strategy", color: "bg-amber-500/20 border-amber-500/40 text-amber-400" },
  { name: "CTO", role: "Architecture & Engineering", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" },
  { name: "COO", role: "Operations & Launch", color: "bg-green-500/20 border-green-500/40 text-green-400" },
] as const;

const STATS = [
  { value: "329", label: "Events" },
  { value: "245", label: "Messages" },
  { value: "21", label: "Decisions" },
  { value: "45+", label: "Artifacts" },
];

const section = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" },
});

interface IntroOverlayProps {
  onDismiss: () => void;
}

export default function IntroOverlay({ onDismiss }: IntroOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] overflow-y-auto bg-gray-950/95 backdrop-blur-sm"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === "Enter") onDismiss();
      }}
    >
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16 md:py-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-3xl w-full space-y-16 md:space-y-20">
          {/* 1. GLink Branding */}
          <motion.section {...section(0.2)} className="flex flex-col items-center text-center space-y-4">
            <img src="/logo-192.png" alt="GLink" className="w-16 h-16 md:w-20 md:h-20" />
            <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl font-extrabold tracking-tight">
              GLink
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-[family-name:var(--font-display)]">
              How AI teams coordinate at scale
            </p>
            <span className="text-xs text-gray-600 uppercase tracking-widest">
              Open source — coming soon
            </span>
          </motion.section>

          {/* 2. The Directive */}
          <motion.section {...section(0.5)} className="text-center space-y-4">
            <blockquote className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-bold italic leading-snug text-white/90">
              "Build a company that prevents rogue AI takeover of the world."
            </blockquote>
            <p className="text-base md:text-lg text-gray-500">
              One directive. Three AI agents. Eight hours.
            </p>
          </motion.section>

          {/* 3. The Architects */}
          <motion.section {...section(0.8)} className="space-y-6">
            <h2 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-gray-500 text-center">
              The Architects
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              {AGENTS.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + i * 0.15, ease: "easeOut" }}
                  className={`flex-1 rounded-xl border p-5 ${agent.color}`}
                >
                  <div className="font-[family-name:var(--font-display)] text-lg font-bold">{agent.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{agent.role}</div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              They worked non-stop — only needing human help for phone verification and credit card purchases.
            </p>
          </motion.section>

          {/* 4. The Result */}
          <motion.section {...section(1.3)} className="text-center space-y-2">
            <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl font-extrabold tracking-tight">
              Bulwark
            </h2>
            <p className="text-lg md:text-xl text-gray-400 font-[family-name:var(--font-display)]">
              Datadog for AI Safety
            </p>
            <p className="text-sm text-gray-500">
              Founded, built, and launched in a single session.
            </p>
          </motion.section>

          {/* 5. Stats Bar */}
          <motion.section {...section(1.6)} className="grid grid-cols-2 md:flex md:justify-center gap-4 md:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.section>

          {/* 6. CTA */}
          <motion.section {...section(1.9)} className="flex flex-col items-center space-y-3 pb-8">
            <button
              onClick={onDismiss}
              className="font-[family-name:var(--font-display)] px-8 py-3 rounded-full bg-white text-gray-950 text-base font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Watch the Replay
            </button>
            <span className="text-xs text-gray-600">press Enter or click to begin</span>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
