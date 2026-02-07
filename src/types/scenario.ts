export interface ConversationMessage {
  role: "agent" | "user";
  content: string;
  timestamp: string;
}

export interface Criterion {
  id: string;
  passed: boolean;
  reason: string;
}

export interface ScenarioResult {
  scenarioId: string;
  passed: boolean;
  criteria: Criterion[];
  conversation: ConversationMessage[];
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface ResultsSummary {
  total: number;
  passed: number;
  failed: number;
  duration: number;
}

export interface ScenarioResults {
  results: ScenarioResult[];
  summary: ResultsSummary;
  timestamp: string;
}

export type SortField = "name" | "duration" | "status";
export type SortDirection = "asc" | "desc";
export type FilterStatus = "all" | "passed" | "failed";
