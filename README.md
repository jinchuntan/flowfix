# FlowFix — AI Runbook Copilot

FlowFix turns broken logs and scripts into structured, step-by-step debug runbooks using AI.

## What it does

Paste a failed log and a related script (Dockerfile, run.sh, requirements.txt, etc.). FlowFix analyzes both and returns:

- **Error summary** — what went wrong in plain English
- **Workflow understanding** — what the repo/script was trying to do
- **Ranked root-cause hypotheses** — with confidence and evidence
- **Fix runbook** — step-by-step with shell commands
- **Verification steps** — confirm the fix worked
- **Prevention tips** — avoid the issue next time
- **Downloadable DEBUG_RUNBOOK.md** — shareable and reusable

## Why it's useful

Developers lose hours not writing code, but understanding _why_ a build or deploy broke. FlowFix reduces that friction by structuring the debugging process automatically.

## Run locally

```bash
git clone <repo>
cd flowfix
npm install
cp .env.example .env   # optional: add GROQ_API_KEY for live AI
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Get a free Groq API key at [console.groq.com](https://console.groq.com). Without a key, FlowFix uses realistic mock responses for three built-in scenarios (Docker, Python, Shell permission). With a key it calls `llama-3.3-70b-versatile` via Groq.

## How AI is used

The `/api/analyze` route sends the log and script context to Groq's API (open source Llama 3.3 70B) with a system prompt instructing it to act as a senior debugging engineer and return structured JSON. If no API key is present, the app falls back to pre-built mock responses so the demo always works.

## Future improvements

- Support file uploads (drag-and-drop)
- GitHub Actions log parsing
- History / saved runbooks
- Team sharing via short links
- Support for Claude, Gemini, and other providers
