export interface RootCauseHypothesis {
  rank: number;
  cause: string;
  confidence: "High" | "Medium" | "Low";
  evidence: string;
  recommended_check: string;
}

export interface FixStep {
  step: number;
  title: string;
  action: string;
  command?: string;
}

export interface AnalysisResult {
  error_summary: string;
  workflow_summary: string;
  root_cause_hypotheses: RootCauseHypothesis[];
  fix_runbook: FixStep[];
  verification_steps: string[];
  prevention_tips: string[];
  markdown_report: string;
}
