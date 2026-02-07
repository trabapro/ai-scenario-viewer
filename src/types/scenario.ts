export interface ItemUpdate {
  index: number;
  result: string;
}

export interface TodoUpdate {
  todoId: string;
  action: string;
  note?: string;
}

export interface ConversationMessage {
  role: "agent" | "user";
  content: string;
  timestamp: string;
  action?: string;
  topic?: string;
  itemUpdates?: ItemUpdate[];
  todoUpdates?: TodoUpdate[];
  selectedShiftId?: string;
}

export type ChangeStatus = "regressed" | "fixed" | "new" | "stable-pass" | "stable-fail" | "removed" | "unknown";

export interface WebSocketEvent {
  direction: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface SeedOperation {
  operation: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  timestamp: string;
}

export interface SeedReport {
  scenarioId: string;
  seededContext: Record<string, string>;
  operations: SeedOperation[];
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
  websocketEvents?: WebSocketEvent[];
  langfuseTraceIds?: string[];
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
  seedReports?: SeedReport[];
}

export type SortField = "name" | "duration" | "status" | "change";
export type SortDirection = "asc" | "desc";
export type FilterStatus = "all" | "passed" | "failed";
export type ChangeFilter = "all" | "regressed" | "fixed" | "new";
