import { Link } from "react-router-dom";
import type { ScenarioResult } from "@/types/scenario";
import { formatDuration, scenarioIdToTitle, getUserTurns } from "@/lib/utils";

interface ScenarioCardProps {
  scenario: ScenarioResult;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const passedCriteria = scenario.criteria.filter((c) => c.passed).length;
  const totalCriteria = scenario.criteria.length;
  const turns = getUserTurns(scenario.conversation);

  return (
    <Link
      to={`/scenario/${encodeURIComponent(scenario.scenarioId)}`}
      className="group block w-full text-left rounded-xl border border-card-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
            {scenarioIdToTitle(scenario.scenarioId)}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground font-mono truncate">
            {scenario.scenarioId}
          </p>
        </div>
        <StatusBadge passed={scenario.passed} />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v3.5c0 .414.336.75.75.75h2.5a.75.75 0 000-1.5h-1.75v-2.75z" clipRule="evenodd" />
          </svg>
          <span>{formatDuration(scenario.duration)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M1 8.74c0 .983.713 1.825 1.69 1.943.764.092 1.534.164 2.31.216v2.351a.75.75 0 001.28.53l2.51-2.51c.182-.181.427-.29.684-.308A40.94 40.94 0 0012 10.97c.977-.118 1.69-.96 1.69-1.942V4.231c0-.983-.713-1.825-1.69-1.943A40.626 40.626 0 008 2a40.626 40.626 0 00-4 .288C2.713 2.406 2 3.248 2 4.23v4.51H1z" />
          </svg>
          <span>{turns} {turns === 1 ? "turn" : "turns"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
          </svg>
          <span className={passedCriteria === totalCriteria ? "text-success" : "text-failure"}>
            {passedCriteria}/{totalCriteria} criteria
          </span>
        </div>
      </div>

      {/* Criteria mini-indicators */}
      <div className="mt-3 flex gap-1">
        {scenario.criteria.map((criterion) => (
          <div
            key={criterion.id}
            className={`h-1.5 flex-1 rounded-full ${
              criterion.passed ? "bg-success/60" : "bg-failure/60"
            }`}
            title={criterion.id}
          />
        ))}
      </div>
    </Link>
  );
}

function StatusBadge({ passed }: { passed: boolean }) {
  if (passed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-bg border border-success-border px-2 py-0.5 text-xs font-medium text-success shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
        </svg>
        Passed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-failure-bg border border-failure-border px-2 py-0.5 text-xs font-medium text-failure shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8 5.22 9.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z" clipRule="evenodd" />
      </svg>
      Failed
    </span>
  );
}
