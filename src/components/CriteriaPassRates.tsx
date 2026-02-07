import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ScenarioResult } from "@/types/scenario";
import { scenarioIdToTitle } from "@/lib/utils";

interface CriteriaPassRatesProps {
  results: ScenarioResult[];
}

interface CriterionAggregate {
  id: string;
  passed: number;
  total: number;
  rate: number;
  scenarios: string[];
  failedScenarios: string[];
}

type SortBy = "name" | "rate" | "count";

export function CriteriaPassRates({ results }: CriteriaPassRatesProps) {
  const [sortBy, setSortBy] = useState<SortBy>("rate");
  const [showOnlyFailing, setShowOnlyFailing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const aggregated = useMemo(() => {
    const map = new Map<
      string,
      { passed: number; total: number; scenarios: string[]; failedScenarios: string[] }
    >();

    for (const result of results) {
      for (const criterion of result.criteria) {
        const existing = map.get(criterion.id) ?? {
          passed: 0,
          total: 0,
          scenarios: [],
          failedScenarios: [],
        };
        existing.total += 1;
        if (criterion.passed) {
          existing.passed += 1;
        } else {
          existing.failedScenarios.push(result.scenarioId);
        }
        existing.scenarios.push(result.scenarioId);
        map.set(criterion.id, existing);
      }
    }

    let items: CriterionAggregate[] = Array.from(map.entries()).map(
      ([id, data]) => ({
        id,
        passed: data.passed,
        total: data.total,
        rate: data.total > 0 ? (data.passed / data.total) * 100 : 0,
        scenarios: data.scenarios,
        failedScenarios: data.failedScenarios,
      })
    );

    if (showOnlyFailing) {
      items = items.filter((item) => item.rate < 100);
    }

    items.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.id.localeCompare(b.id);
        case "rate":
          return a.rate - b.rate;
        case "count":
          return b.total - a.total;
        default:
          return 0;
      }
    });

    return items;
  }, [results, sortBy, showOnlyFailing]);

  const totalCriteria = aggregated.length;
  const perfectCriteria = aggregated.filter((c) => c.rate === 100).length;

  return (
    <div className="mt-6 border border-card-border bg-card animate-fade-in">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">
            Criteria Pass Rates
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {perfectCriteria}/{totalCriteria} at 100%
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {collapsed ? "+" : "\u2212"}
        </span>
      </button>

      {!collapsed && (
        <div className="border-t border-card-border">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-card-border">
            <div className="flex border border-card-border bg-background">
              {(
                [
                  ["rate", "Pass Rate"],
                  ["name", "Name"],
                  ["count", "Count"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    sortBy === value
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowOnlyFailing(!showOnlyFailing)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors border ${
                showOnlyFailing
                  ? "border-failure/30 text-failure bg-failure-bg"
                  : "border-card-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Failing only
            </button>
          </div>

          {/* Criteria list */}
          <div className="divide-y divide-card-border">
            {aggregated.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {showOnlyFailing
                  ? "All criteria are passing."
                  : "No criteria found."}
              </div>
            )}
            {aggregated.map((criterion) => (
              <CriterionRow key={criterion.id} criterion={criterion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CriterionRow({ criterion }: { criterion: CriterionAggregate }) {
  const [expanded, setExpanded] = useState(false);

  const rateColor =
    criterion.rate >= 100
      ? "text-success"
      : criterion.rate >= 50
      ? "text-muted-foreground"
      : "text-failure";

  const barColor =
    criterion.rate >= 100
      ? "var(--success)"
      : criterion.rate >= 50
      ? "var(--muted-foreground)"
      : "var(--failure)";

  return (
    <div className="group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        {/* Status dot */}
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            criterion.rate >= 100 ? "bg-success" : "bg-failure"
          }`}
        />

        {/* Name + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium truncate">
              {scenarioIdToTitle(criterion.id)}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-xs text-muted-foreground tabular-nums font-mono">
                {criterion.passed}/{criterion.total}
              </span>
              <span
                className={`text-xs font-medium tabular-nums font-mono ${rateColor}`}
              >
                {Math.round(criterion.rate)}%
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden bg-muted">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${criterion.rate}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>

        {/* Expand indicator */}
        {criterion.failedScenarios.length > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            {expanded ? "\u2212" : "+"}
          </span>
        )}
      </button>

      {/* Expanded: show failed scenarios */}
      {expanded && criterion.failedScenarios.length > 0 && (
        <div className="px-4 pb-3 pl-8">
          <p className="text-xs text-muted-foreground mb-1.5">
            Failed in:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {criterion.failedScenarios.map((scenarioId) => (
              <Link
                key={scenarioId}
                to={`/scenario/${encodeURIComponent(scenarioId)}`}
                className="text-xs text-failure underline underline-offset-2 decoration-failure/30 hover:decoration-failure transition-colors"
              >
                {scenarioIdToTitle(scenarioId)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
