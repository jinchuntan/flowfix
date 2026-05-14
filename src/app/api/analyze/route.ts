import { NextRequest, NextResponse } from "next/server";
import { mockData } from "@/lib/mockData";
import type { AnalysisResult } from "@/lib/types";

const SYSTEM_PROMPT = `You are a senior debugging engineer. Analyze the provided log output and repository context, then return a JSON object with this exact shape:

{
  "error_summary": "Short explanation of what failed",
  "workflow_summary": "What the repository/script appears to be trying to do",
  "root_cause_hypotheses": [
    {
      "rank": 1,
      "cause": "Likely cause",
      "confidence": "High",
      "evidence": "Specific evidence from log or script",
      "recommended_check": "What to inspect or run"
    }
  ],
  "fix_runbook": [
    {
      "step": 1,
      "title": "Step title",
      "action": "What the developer should do",
      "command": "Optional shell command"
    }
  ],
  "verification_steps": ["Command or check to confirm the fix"],
  "prevention_tips": ["How to avoid this issue in the future"],
  "markdown_report": "Full markdown troubleshooting report"
}

Be concise, specific, and evidence-driven. Return only valid JSON — no markdown fences, no extra text.`;

export async function POST(req: NextRequest) {
  const { logText, repoContext, scenarioName } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const mock = scenarioName && mockData[scenarioName]
      ? mockData[scenarioName]
      : mockData["docker"];
    return NextResponse.json(mock);
  }

  try {
    const userMessage = [
      logText ? `## Failed Log\n\`\`\`\n${logText}\n\`\`\`` : "",
      repoContext ? `## Repository / Script Context\n\`\`\`\n${repoContext}\n\`\`\`` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    const result: AnalysisResult = JSON.parse(
      data.choices[0].message.content
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    const fallback = scenarioName && mockData[scenarioName]
      ? mockData[scenarioName]
      : mockData["docker"];
    return NextResponse.json(fallback);
  }
}
