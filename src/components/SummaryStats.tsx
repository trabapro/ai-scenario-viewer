import { useMemo } from "react";
import type { ResultsSummary, ScenarioResult } from "@/types/scenario";
import { formatDuration, getPassRate } from "@/lib/utils";

interface SummaryStatsProps {
  summary: ResultsSummary;
  results: ScenarioResult[];
}

export function SummaryStats({ summary, results }: SummaryStatsProps) {
  const scenarioPassRate = getPassRate(summary.passed, summary.total);

  const criteriaStats = useMemo(() => {
    let total = 0;
    let passed = 0;
    for (const result of results) {
      for (const c of result.criteria) {
        total++;
        if (c.passed) passed++;
      }
    }
    return { total, passed, failed: total - passed };
  }, [results]);

  const criteriaPassRate = getPassRate(criteriaStats.passed, criteriaStats.total);

  return (
    <div className="animate-fade-in">
      {/* Hero pass rate */}
      <div className="flex items-baseline gap-6 mb-6">
        <div>
          <span className="text-4xl font-light tabular-nums tracking-tight">
            {scenarioPassRate}%
          </span>
          <span className="ml-2 text-sm text-muted-foreground">pass rate</span>
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">
          {summary.passed}/{summary.total} scenarios
        </div>
      </div>

      {/* Inline stats */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm border-t border-card-border pt-4">
        <Stat label="Criteria" value={`${criteriaStats.passed}/${criteriaStats.total}`} subvalue={`${criteriaPassRate}%`} />
        <Stat label="Failed" value={summary.failed.toString()} variant={summary.failed > 0 ? "failure" : "default"} />
        <Stat label="Duration" value={formatDuration(summary.duration)} />
      </div>

      {/* Pass rate bars */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PassRateBar
          label="Scenarios"
          rate={scenarioPassRate}
          passed={summary.passed}
          total={summary.total}
        />
        <PassRateBar
          label="Criteria"
          rate={criteriaPassRate}
          passed={criteriaStats.passed}
          total={criteriaStats.total}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  subvalue,
  variant = "default",
}: {
  label: string;
  value: string;
  subvalue?: string;
  variant?: "default" | "failure";
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums font-medium ${variant === "failure" ? "text-failure" : ""}`}>
        {value}
      </span>
      {subvalue && (
        <span className="text-muted-foreground text-xs">({subvalue})</span>
      )}
    </div>
  );
}

function PassRateBar({
  label,
  rate,
  passed,
  total,
}: {
  label: string;
  rate: number;
  passed: number;
  total: number;
}) {
  return (
    <div className="border border-card-border p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-mono tabular-nums">{passed}/{total}</span>
      </div>
      <div className="h-2 w-full overflow-hidden bg-muted">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${rate}%`,
            backgroundColor: rate >= 80 ? "var(--success)" : rate >= 50 ? "var(--muted-foreground)" : "var(--failure)",
          }}
        />
      </div>
    </div>
  );
}
