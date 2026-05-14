"use client";

import { useState, useRef, useCallback } from "react";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import BobGuide from "@/components/BobGuide";
import FoveaLogo from "@/components/FoveaLogo";
import { scenarios } from "@/lib/mockData";
import type { AnalysisResult } from "@/lib/types";

const SCENARIO_ICONS: Record<string, string> = {
  docker: "🐳",
  python: "🐍",
  permission: "🔒",
};

const STATS = [
  { value: "2–5 hrs", label: "Saved per incident" },
  { value: "< 30s", label: "To root cause" },
  { value: "Any format", label: "Log or script" },
  { value: "Open source", label: "Llama 3.3 70B" },
];

function DropZone({
  value,
  onChange,
  placeholder,
  label,
  icon,
  accept,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  icon: React.ReactNode;
  accept: string;
}) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsText(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-zinc-500">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-normal normal-case tracking-normal text-zinc-400 transition hover:bg-zinc-700"
        >
          Upload file
        </button>
      </label>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = "";
        }}
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative rounded-xl border transition-all duration-200 ${
          dragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-zinc-800 bg-zinc-900/80"
        }`}
      >
        {dragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl">
            <p className="text-sm font-medium text-indigo-400">Drop file here</p>
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={7}
          placeholder={placeholder}
          className={`w-full resize-y rounded-xl bg-transparent px-4 py-3 font-mono text-xs leading-relaxed text-zinc-300 placeholder-zinc-700 outline-none transition ${
            dragging ? "opacity-20" : ""
          }`}
        />
      </div>
    </div>
  );
}

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

  if (loading) return (
    <>
      <LoadingAnalysis />
      <BobGuide stage="loading" />
    </>
  );
  if (result) return (
    <>
      <AnalysisDashboard result={result} onReset={handleReset} />
      <BobGuide stage="result" />
    </>
  );

  return (
    <>
    <div className="relative min-h-screen bg-grid">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative border-b border-zinc-800/60 px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-sm font-bold tracking-tight text-white">FlowFix</span>
          <div className="flex items-center gap-2 text-zinc-600">
            <span className="text-xs">by</span>
            <FoveaLogo size={26} />
            <span className="text-xs font-medium text-zinc-500">Fovea</span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-10 sm:pt-14">
        {/* Hero */}
        <div className="mb-10 text-center fade-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            AI-powered debugging copilot · Llama 3.3 70B
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="gradient-text">FlowFix</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400">
            Stop losing hours to broken logs. Paste a failed log and a script —
            get a structured root-cause analysis and step-by-step fix runbook in seconds.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 fade-up fade-up-1">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-center"
            >
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sample Scenarios */}
        <div className="mb-6 fade-up fade-up-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Quick start — try a sample scenario
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
                  <span className="text-base">{SCENARIO_ICONS[s.id]}</span>
                  <span className="text-xs font-semibold text-zinc-200">{s.label}</span>
                  {selectedScenario === s.id && (
                    <span className="ml-auto text-xs text-indigo-400">✓</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{s.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3 fade-up fade-up-2">
          <div className="flex-1 border-t border-zinc-800" />
          <span className="text-xs text-zinc-700">or paste your own</span>
          <div className="flex-1 border-t border-zinc-800" />
        </div>

        {/* Input Fields */}
        <div className="space-y-4 fade-up fade-up-3">
          <DropZone
            value={logText}
            onChange={(v) => { setLogText(v); setSelectedScenario(null); }}
            label="Failed Log"
            placeholder={"Paste your error log or stack trace here...\n\nTip: you can also drag-and-drop a .log file directly onto this area."}
            accept=".log,.txt,.out,.err,text/*"
            icon={
              <span className="flex h-4 w-4 items-center justify-center rounded bg-red-500/20 text-[10px] text-red-400">
                !
              </span>
            }
          />

          <DropZone
            value={repoContext}
            onChange={(v) => { setRepoContext(v); setSelectedScenario(null); }}
            label="Repository / Script Context"
            placeholder={"Paste a Dockerfile, run.sh, requirements.txt, package.json,\nGitHub Actions YAML, or any related script...\n\nTip: drag-and-drop any text file here."}
            accept=".sh,.yml,.yaml,.json,.txt,.toml,.cfg,.ini,.py,.ts,.js,text/*"
            icon={
              <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-500/20 text-[10px] text-indigo-400">
                {"<>"}
              </span>
            }
          />

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.99]"
          >
            <span className="flex items-center justify-center gap-2">
              Analyze Failure
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </button>
        </div>

        {/* How it works */}
        <div className="mt-14 fade-up fade-up-4">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-zinc-700">
            How it works
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "1", title: "Paste your failure", body: "Drop in a log file and the related script, config, or Dockerfile." },
              { n: "2", title: "AI analyzes it", body: "Llama 3.3 70B acts as a senior debugging engineer — not just summarizing, but reasoning." },
              { n: "3", title: "Get your runbook", body: "Ranked root causes, a step-by-step fix plan, and a downloadable markdown report." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {s.n}
                </div>
                <p className="mb-1 text-sm font-semibold text-zinc-200">{s.title}</p>
                <p className="text-xs leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-700">
          No data stored · Runs in-memory only · Open source model
        </p>

        {/* Hackathon badge */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-xs text-blue-400/70">
            <span className="text-sm">🏆</span>
            Built for the <span className="font-semibold text-blue-400">IBM Bob Hackathon</span> · $10,000 prize pool
          </div>
        </div>
      </div>
    </div>

    <BobGuide stage="home" />
    </>
  );
}
