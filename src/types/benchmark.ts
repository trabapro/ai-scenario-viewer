import type { ScenarioResults } from "./scenario";

export interface ModelResult {
  modelName: string;
  displayName: string;
  data: ScenarioResults;
  color: string;
}

export interface DosTokenUsage {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  turns: number;
}

export interface ModelStats {
  modelName: string;
  displayName: string;
  color: string;
  scenariosPassed: number;
  scenariosTotal: number;
  scenarioPassRate: number;
  criteriaPassed: number;
  criteriaTotal: number;
  criteriaPassRate: number;
  duration: number;
  tokenUsage?: DosTokenUsage;
  estimatedCost?: number;
}

export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-5-nano": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "gemini-2.5-flash-baseline": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gemini-2.5-flash": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gemini-3-flash": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "gemini-3-pro": { inputPerMillion: 1.25, outputPerMillion: 5.0 },
  "deepseek-v3-2": { inputPerMillion: 0.5, outputPerMillion: 2.0 },
  "glm-4-7": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  "glm-5": { inputPerMillion: 0.6, outputPerMillion: 2.4 },
  "gpt-oss-120b": { inputPerMillion: 0.05, outputPerMillion: 0.3 },
  "claude-opus-4-6": { inputPerMillion: 15.0, outputPerMillion: 75.0 },
  "gpt-5-2": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  "codex-5-3": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
};

export const MODEL_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
  "#6366F1",
  "#84CC16",
  "#D946EF",
];

export function modelNameToDisplay(name: string): string {
  return name
    .split("-")
    .map((w) => {
      if (/^\d/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

export function computeModelStats(model: ModelResult): ModelStats {
  const { data, modelName, displayName, color } = model;
  const total = data.summary?.total ?? data.results.length;
  const passed =
    data.summary?.passed ?? data.results.filter((r) => r.passed).length;

  let criteriaTotal = 0;
  let criteriaPassed = 0;
  for (const r of data.results) {
    for (const c of r.criteria) {
      criteriaTotal++;
      if (c.passed) criteriaPassed++;
    }
  }

  const summaryAny = data.summary as unknown as Record<string, unknown>;
  const tokenUsage = summaryAny?.dosTokenUsage as DosTokenUsage | undefined;

  let estimatedCost: number | undefined;
  if (tokenUsage) {
    const pricing = MODEL_PRICING[modelName];
    if (pricing) {
      estimatedCost =
        (tokenUsage.totalPromptTokens / 1_000_000) * pricing.inputPerMillion +
        (tokenUsage.totalCompletionTokens / 1_000_000) *
          pricing.outputPerMillion;
    }
  }

  return {
    modelName,
    displayName,
    color,
    scenariosPassed: passed,
    scenariosTotal: total,
    scenarioPassRate:
      total > 0 ? Math.round((passed / total) * 1000) / 10 : 0,
    criteriaPassed,
    criteriaTotal,
    criteriaPassRate:
      criteriaTotal > 0
        ? Math.round((criteriaPassed / criteriaTotal) * 1000) / 10
        : 0,
    duration: data.summary?.duration ?? 0,
    tokenUsage,
    estimatedCost,
  };
}
