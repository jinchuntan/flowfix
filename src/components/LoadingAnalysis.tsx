"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Parsing log structure...",
  "Identifying error patterns...",
  "Cross-referencing repository context...",
  "Ranking root cause hypotheses...",
  "Generating fix runbook...",
  "Finalizing report...",
];

export default function LoadingAnalysis() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length - 1) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), 900);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Terminal window */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-3 flex-1 text-center text-xs text-zinc-600">
              flowfix — analyzing failure
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-6">
            <p className="mb-5 font-mono text-xs text-zinc-600">
              $ flowfix analyze --model llama-3.3-70b --deep
            </p>

            <div className="space-y-3">
              {STEPS.map((step, i) => {
                if (i > current) return null;
                const done = i < current;
                return (
                  <div key={i} className="flex items-center gap-3 fade-up">
                    <div className="w-4 shrink-0 text-center">
                      {done ? (
                        <span className="text-sm text-green-400">✓</span>
                      ) : (
                        <svg
                          className="inline h-3.5 w-3.5 animate-spin text-indigo-400"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`font-mono text-xs transition-colors ${
                        done ? "text-zinc-600" : "text-zinc-200"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
                style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-right font-mono text-xs text-zinc-700">
              {Math.round(((current + 1) / STEPS.length) * 100)}%
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-700">
          Llama 3.3 70B is reasoning through your failure...
        </p>
      </div>
    </div>
  );
}
