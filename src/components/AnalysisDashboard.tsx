"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";

const CONFIDENCE_STYLES: Record<string, string> = {
  High:   "border-red-500/40 bg-red-500/10 text-red-400",
  Medium: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  Low:    "border-zinc-600/40 bg-zinc-700/20 text-zinc-400",
};

const CONFIDENCE_BAR: Record<string, string> = {
  High:   "bg-red-500 w-full",
  Medium: "bg-yellow-500 w-2/3",
  Low:    "bg-zinc-500 w-1/3",
};

function Section({ title, icon, children, delay = "" }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  delay?: string;
}) {
  return (
    <div className={`fade-up ${delay}`}>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        <span>{icon}</span>{title}
      </h2>
      {children}
    </div>
  );
}

export default function AnalysisDashboard({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(result.markdown_report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([result.markdown_report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DEBUG_RUNBOOK.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen bg-grid">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-300"
            >
              ← New Analysis
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-zinc-500">Analysis complete</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-700"
            >
              {copied ? "✓ Copied" : "Copy MD"}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              ↓ Download .md
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-20 pt-8">
        {/* Error Banner */}
        <div className="fade-up glow-red rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-400">
            <span>⚠</span> Error Summary
          </p>
          <p className="text-sm leading-relaxed text-zinc-200">{result.error_summary}</p>
        </div>

        {/* Workflow */}
        <Section title="Workflow Understanding" icon="🔍" delay="fade-up-1">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-sm leading-relaxed text-zinc-300">{result.workflow_summary}</p>
          </div>
        </Section>

        {/* Root Cause Hypotheses */}
        <Section title="Root Cause Hypotheses" icon="🎯" delay="fade-up-2">
          <div className="space-y-3">
            {result.root_cause_hypotheses.map((h) => (
              <div
                key={h.rank}
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 transition hover:border-zinc-700"
              >
                <div className="mb-3 flex flex-wrap items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {h.rank}
                  </span>
                  <span className="flex-1 text-sm font-medium text-zinc-100">{h.cause}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CONFIDENCE_STYLES[h.confidence] ?? CONFIDENCE_STYLES.Low}`}>
                    {h.confidence}
                  </span>
                </div>
                {/* Confidence bar */}
                <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full transition-all ${CONFIDENCE_BAR[h.confidence] ?? CONFIDENCE_BAR.Low}`} />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-zinc-500">
                    <span className="font-medium text-zinc-400">Evidence: </span>{h.evidence}
                  </p>
                  <p className="text-zinc-500">
                    <span className="font-medium text-zinc-400">Check: </span>{h.recommended_check}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Fix Runbook */}
        <Section title="Fix Runbook" icon="🛠️" delay="fade-up-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
            <div className="space-y-5">
              {result.fix_runbook.map((s, idx) => (
                <div key={s.step} className="flex gap-4">
                  {/* Step connector */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-500/50 bg-indigo-500/10 text-xs font-bold text-indigo-400">
                      {s.step}
                    </div>
                    {idx < result.fix_runbook.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-zinc-800" />
                    )}
                  </div>
                  <div className="flex-1 pb-5">
                    <p className="mb-1 text-sm font-semibold text-zinc-200">{s.title}</p>
                    <p className="mb-2 text-xs text-zinc-500">{s.action}</p>
                    {s.command && (
                      <div className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                          <span className="text-[10px] text-zinc-600">bash</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(s.command!)}
                            className="text-[10px] text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:text-zinc-400"
                          >
                            copy
                          </button>
                        </div>
                        <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-green-400">
                          {s.command}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Verification & Prevention */}
        <div className="grid gap-4 sm:grid-cols-2 fade-up fade-up-4">
          {/* Verification */}
          <Section title="Verification Steps" icon="✅">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
              <ul className="space-y-2">
                {result.verification_steps.map((v, i) => (
                  <li key={i} className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1">
                      <span className="text-[10px] text-zinc-600">run</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(v)}
                        className="text-[10px] text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:text-zinc-400"
                      >
                        copy
                      </button>
                    </div>
                    <pre className="overflow-x-auto px-3 py-2 text-xs text-green-400">{v}</pre>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* Prevention */}
          <Section title="Prevention Tips" icon="🛡️">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
              <ul className="space-y-3">
                {result.prevention_tips.map((t, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-zinc-400">
                    <span className="mt-0.5 shrink-0 text-indigo-400">→</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>

        {/* Download CTA */}
        <div className="fade-up fade-up-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 text-center">
          <p className="mb-3 text-sm font-medium text-zinc-300">
            Save this runbook for your team
          </p>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <button
              onClick={handleDownload}
              className="w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto"
            >
              ↓ Download DEBUG_RUNBOOK.md
            </button>
            <button
              onClick={handleCopy}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-700 sm:w-auto"
            >
              {copied ? "✓ Copied to clipboard" : "Copy Markdown"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
