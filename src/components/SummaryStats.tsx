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
    <div className="animate-fade-in space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Scenarios"
          value={summary.total.toString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM1.99 4.75a1 1 0 011-1h.01a1 1 0 010 2h-.01a1 1 0 01-1-1zM2.99 9a1 1 0 100 2h.01a1 1 0 100-2h-.01zM1.99 15.25a1 1 0 011-1h.01a1 1 0 010 2h-.01a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Scenarios Passed"
          value={summary.passed.toString()}
          variant="success"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Scenarios Failed"
          value={summary.failed.toString()}
          variant={summary.failed > 0 ? "failure" : "default"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Eval Criteria"
          value={criteriaStats.total.toString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Duration"
          value={formatDuration(summary.duration)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Pass Rate Bars */}
      <div className="grid gap-3 sm:grid-cols-2">
        <PassRateBar
          label="Scenario Pass Rate"
          rate={scenarioPassRate}
          passed={summary.passed}
          failed={summary.failed}
        />
        <PassRateBar
          label="Criteria Pass Rate"
          rate={criteriaPassRate}
          passed={criteriaStats.passed}
          failed={criteriaStats.failed}
        />
      </div>
    </div>
  );
}

function PassRateBar({
  label,
  rate,
  passed,
  failed,
}: {
  label: string;
  rate: number;
  passed: number;
  failed: number;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold">{rate}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${rate}%`,
            backgroundColor: rate >= 80 ? "var(--success)" : rate >= 50 ? "var(--primary)" : "var(--failure)",
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{passed} passed</span>
        <span>{failed} failed</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
  icon,
}: {
  label: string;
  value: string;
  variant?: "default" | "success" | "failure";
  icon: React.ReactNode;
}) {
  const borderColor =
    variant === "success"
      ? "border-success-border"
      : variant === "failure"
      ? "border-failure-border"
      : "border-card-border";

  const bgColor =
    variant === "success"
      ? "bg-success-bg"
      : variant === "failure"
      ? "bg-failure-bg"
      : "bg-card";

  const valueColor =
    variant === "success"
      ? "text-success"
      : variant === "failure"
      ? "text-failure"
      : "text-foreground";

  const iconColor =
    variant === "success"
      ? "text-success"
      : variant === "failure"
      ? "text-failure"
      : "text-muted-foreground";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <div className={`mb-2 ${iconColor}`}>{icon}</div>
      <div className={`text-2xl font-bold tabular-nums ${valueColor}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs font-medium text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
