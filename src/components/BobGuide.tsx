"use client";

import { useState, useEffect } from "react";

type Stage = "home" | "loading" | "result";

const TIPS: Record<Stage, string[]> = {
  home: [
    "Hi! I'm Bob 👋 Paste a broken log to get started, or try a sample scenario below!",
    "You can drag-and-drop log files directly onto the input areas.",
    "Add your Dockerfile or script too — more context means a sharper diagnosis.",
  ],
  loading: [
    "Hang tight! I'm reasoning through your failure with Llama 3.3 70B...",
    "Cross-referencing your script against known error patterns...",
    "Almost there — ranking root causes by evidence strength...",
  ],
  result: [
    "Done! Root causes are ranked by confidence — start from #1.",
    "Download the DEBUG_RUNBOOK.md to share the fix plan with your team.",
    "Run the verification commands to confirm your fix actually worked!",
  ],
};

const STEPS = [
  {
    title: "Hey, I'm Bob! 👋",
    body: "I'm your AI debugging copilot. FlowFix turns messy logs and broken scripts into structured, step-by-step debug runbooks. Let me show you how!",
  },
  {
    title: "Paste your error log",
    body: "Drop your stack trace or build log in the top box. You can paste text directly or drag-and-drop a .log file onto it.",
  },
  {
    title: "Add your script or config",
    body: "Add the related Dockerfile, run.sh, requirements.txt, or any config file. More context = more accurate root-cause analysis.",
  },
  {
    title: "Get your runbook",
    body: "Hit 'Analyze Failure'. I'll rank the root causes, generate a step-by-step fix plan, and give you verification commands — all downloadable as markdown.",
  },
];

function BobSVG({ size = 52 }: { size?: number }) {
  const s = size / 60;
  return (
    <svg
      width={size}
      height={Math.round(size * 1.25)}
      viewBox="0 0 60 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Antenna */}
      <line x1="30" y1="7" x2="30" y2="1" stroke="#4589ff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="1" r="3.5" fill="#4589ff" />

      {/* Head */}
      <rect x="10" y="7" width="40" height="33" rx="10" fill="#0043CE" />

      {/* Eye whites */}
      <g className="bob-eye">
        <ellipse cx="22" cy="21" rx="6" ry="6" fill="white" />
        <ellipse cx="38" cy="21" rx="6" ry="6" fill="white" />
      </g>
      {/* Pupils */}
      <circle cx="23.5" cy="22" r="3" fill="#001d6c" />
      <circle cx="39.5" cy="22" r="3" fill="#001d6c" />
      {/* Eye shine */}
      <circle cx="25" cy="20.5" r="1.2" fill="white" />
      <circle cx="41" cy="20.5" r="1.2" fill="white" />

      {/* Smile */}
      <path d="M 20 30 Q 30 37 40 30" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* Neck */}
      <rect x="22" y="38" width="16" height="6" rx="3" fill="#0f62fe" />

      {/* Body */}
      <rect x="11" y="42" width="38" height="27" rx="8" fill="#0043CE" />

      {/* Body panel */}
      <rect x="18" y="50" width="24" height="4" rx="2" fill="#4589ff" opacity="0.7" />
      <rect x="18" y="58" width="15" height="4" rx="2" fill="#4589ff" opacity="0.45" />

      {/* Legs */}
      <rect x="14" y="67" width="12" height="8" rx="4" fill="#001d6c" />
      <rect x="34" y="67" width="12" height="8" rx="4" fill="#001d6c" />
    </svg>
  );
}

export default function BobGuide({ stage }: { stage: Stage }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const seen = typeof window !== "undefined" && localStorage.getItem("flowfix_onboarded");
    if (!seen) setTimeout(() => setShowOnboarding(true), 700);
  }, []);

  useEffect(() => {
    setTipIdx(0);
    setShowBubble(true);
  }, [stage]);

  useEffect(() => {
    const tips = TIPS[stage];
    const t = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 5000);
    return () => clearInterval(t);
  }, [stage]);

  function finishOnboarding() {
    localStorage.setItem("flowfix_onboarded", "1");
    setShowOnboarding(false);
  }

  return (
    <>
      {/* Onboarding modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-4 flex justify-center">
              <BobSVG size={72} />
            </div>
            <h3 className="mb-2 text-center text-lg font-bold text-white">
              {STEPS[step].title}
            </h3>
            <p className="mb-6 text-center text-sm leading-relaxed text-zinc-400">
              {STEPS[step].body}
            </p>

            {/* Dot indicators */}
            <div className="mb-5 flex justify-center gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-blue-500" : "w-1.5 bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={finishOnboarding}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800"
              >
                Skip
              </button>
              <button
                onClick={() =>
                  step < STEPS.length - 1 ? setStep((s) => s + 1) : finishOnboarding()
                }
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                {step < STEPS.length - 1 ? "Next →" : "Let's go! 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bob */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        {/* Speech bubble */}
        {showBubble && (
          <div className="fade-up relative max-w-[210px] rounded-2xl border border-blue-500/25 bg-zinc-950/95 px-3.5 py-3 shadow-xl shadow-black/40 backdrop-blur-md">
            <button
              onClick={() => setShowBubble(false)}
              className="absolute right-2.5 top-2 text-[10px] text-zinc-600 transition hover:text-zinc-400"
            >
              ✕
            </button>
            <p className="pr-4 text-xs leading-relaxed text-zinc-300">
              {TIPS[stage][tipIdx]}
            </p>
            {/* Bubble tail */}
            <div className="absolute -bottom-[7px] right-7 h-3.5 w-3.5 rotate-45 border-b border-r border-blue-500/25 bg-zinc-950" />
          </div>
        )}

        {/* Bob avatar button */}
        <button
          onClick={() => setShowBubble((v) => !v)}
          className="bob-float flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-blue-500/50 bg-zinc-950 shadow-lg shadow-blue-600/20 transition hover:border-blue-400 hover:shadow-blue-400/30"
          title="Bob — your AI debugging copilot"
        >
          <BobSVG size={42} />
        </button>
      </div>
    </>
  );
}
