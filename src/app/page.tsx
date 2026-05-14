"use client";

import { useState } from "react";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { scenarios } from "@/lib/mockData";
import type { AnalysisResult } from "@/lib/types";

const SCENARIO_ICONS: Record<string, string> = {
  docker: "🐳",
  python: "🐍",
  permission: "🔒",
};

export default function Home() {
  const [logText, setLogText] = useState("");
  const [repoContext, setRepoContext] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadScenario(id: string) {
    const s = scenarios.find((s) => s.id === id);
    if (!s) return;
    setSelectedScenario(id);
    setLogText(s.log);
    setRepoContext(s.repo);
    setError(null);
  }

  async function handleAnalyze() {
    if (!logText.trim() && !repoContext.trim()) {
      setError("Paste a log or script first, or pick a sample scenario.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText, repoContext, scenarioName: selectedScenario }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setLogText("");
    setRepoContext("");
    setSelectedScenario(null);
    setError(null);
  }

  if (result) {
    return <AnalysisDashboard result={result} onReset={handleReset} />;
  }

  return (
    <div className="relative min-h-screen bg-grid">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-14 sm:pt-20">
        {/* Hero */}
        <div className="mb-12 text-center fade-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            AI-powered debugging copilot
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="gradient-text">FlowFix</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400">
            Paste a broken log and a script. Get a structured root-cause analysis
            and step-by-step fix runbook in seconds.
          </p>

          {/* How it works */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
            <span className="rounded bg-zinc-900 px-2 py-1 text-zinc-400">Paste log</span>
            <span>→</span>
            <span className="rounded bg-zinc-900 px-2 py-1 text-zinc-400">Add context</span>
            <span>→</span>
            <span className="rounded bg-zinc-900 px-2 py-1 text-zinc-400">Get runbook</span>
          </div>
        </div>

        {/* Sample Scenarios */}
        <div className="mb-6 fade-up fade-up-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Or try a sample scenario
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => loadScenario(s.id)}
                className={`group rounded-xl border p-3 text-left transition-all duration-200 ${
                  selectedScenario === s.id
                    ? "border-indigo-500 bg-indigo-500/15 glow-indigo"
                    : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-900"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-lg">{SCENARIO_ICONS[s.id]}</span>
                  <span className="text-xs font-semibold text-zinc-200">{s.label}</span>
                  {selectedScenario === s.id && (
                    <span className="ml-auto text-indigo-400">✓</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{s.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 fade-up fade-up-2">
          {/* Log Input */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-red-500/20 text-red-400 text-[10px]">!</span>
              Failed Log
            </label>
            <textarea
              value={logText}
              onChange={(e) => { setLogText(e.target.value); setSelectedScenario(null); }}
              rows={7}
              placeholder={"Paste your error log or stack trace here...\n\nExample:\n  Error: DATABASE_URL is not defined\n  Process exited with code 1"}
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-300 placeholder-zinc-700 outline-none transition focus:border-indigo-500/60 focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          {/* Repo Context Input */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 text-[10px]">{"<>"}</span>
              Repository / Script Context
            </label>
            <textarea
              value={repoContext}
              onChange={(e) => { setRepoContext(e.target.value); setSelectedScenario(null); }}
              rows={7}
              placeholder={"Paste a Dockerfile, run.sh, requirements.txt, package.json,\nGitHub Actions YAML, or any related script..."}
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-300 placeholder-zinc-700 outline-none transition focus:border-indigo-500/60 focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Analyzing with Llama 3.3...
                </>
              ) : (
                <>
                  Analyze Failure
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </>
              )}
            </span>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          No data stored · Analysis runs in-memory only
        </p>
      </div>
    </div>
  );
}
