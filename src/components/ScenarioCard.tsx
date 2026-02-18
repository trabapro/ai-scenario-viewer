import { Link } from "react-router-dom";
import type { ScenarioResult, ChangeStatus } from "@/types/scenario";
import { formatDuration, scenarioIdToTitle, getUserTurns } from "@/lib/utils";

interface ScenarioCardProps {
  scenario: ScenarioResult;
  changeStatus?: ChangeStatus;
}

const changeBadge: Record<string, { label: string; className: string }> = {
  regressed: {
    label: "Regressed",
    className: "bg-failure/10 text-failure",
  },
  fixed: {
    label: "Fixed",
    className: "bg-success/10 text-success",
  },
  new: {
    label: "New",
    className: "bg-blue-500/10 text-blue-400",
  },
};

function getModelMode(scenario: ScenarioResult): string | undefined {
  const agentMessage = scenario.conversation.find(
    (m) => m.role === "agent" && m.modelMode,
  );
  return agentMessage?.modelMode;
}

export function ScenarioCard({ scenario, changeStatus }: ScenarioCardProps) {
  const passedCriteria = scenario.criteria.filter((c) => c.passed).length;
  const totalCriteria = scenario.criteria.length;
  const turns = getUserTurns(scenario.conversation);
  const badge = changeStatus ? changeBadge[changeStatus] : undefined;
  const modelMode = getModelMode(scenario);

  return (
    <Link
      to={`/scenario/${encodeURIComponent(scenario.scenarioId)}`}
      className="group block w-full text-left border border-card-border bg-card p-4 transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm leading-tight truncate">
              {scenarioIdToTitle(scenario.scenarioId)}
            </h3>
            {badge && (
              <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
        </div>
        <span
          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
            scenario.passed ? "bg-success" : "bg-failure"
          }`}
          title={scenario.passed ? "Passed" : "Failed"}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
        {formatDuration(scenario.duration)}
        <span className="mx-1.5 text-card-border">/</span>
        {turns} {turns === 1 ? "turn" : "turns"}
        <span className="mx-1.5 text-card-border">/</span>
        <span className={passedCriteria === totalCriteria ? "text-success" : "text-failure"}>
          {passedCriteria}/{totalCriteria}
        </span>
        {modelMode && (
          <>
            <span className="mx-1.5 text-card-border">/</span>
            <span className={`font-mono ${
              modelMode === "tool_calling"
                ? "text-amber-400"
                : "text-cyan-400"
            }`}>
              {modelMode === "tool_calling" ? "tools" : "json"}
            </span>
          </>
        )}
      </p>

      {/* Criteria mini-bar */}
      <div className="mt-3 flex gap-px">
        {scenario.criteria.map((criterion) => (
          <div
            key={criterion.id}
            className={`h-1.5 flex-1 ${
              criterion.passed ? "bg-success/70" : "bg-failure/70"
            }`}
            title={criterion.id}
          />
        ))}
      </div>
    </Link>
  );
}
