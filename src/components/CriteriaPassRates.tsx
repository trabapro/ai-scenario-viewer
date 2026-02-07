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
    <div className="mt-6 rounded-xl border border-card-border bg-card animate-fade-in">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold">
              Criteria Pass Rates
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              {perfectCriteria}/{totalCriteria} at 100%
            </span>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            collapsed ? "" : "rotate-180"
          }`}
        >
          <path
            fillRule="evenodd"
            d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {!collapsed && (
        <div className="border-t border-card-border">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-card-border">
            <div className="flex items-center gap-1 rounded-lg border border-card-border bg-background p-0.5">
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
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    sortBy === value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowOnlyFailing(!showOnlyFailing)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border ${
                showOnlyFailing
                  ? "border-failure-border bg-failure-bg text-failure"
                  : "border-card-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path
                  fillRule="evenodd"
                  d="M8 15A7 7 0 108 1a7 7 0 000 14zM6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8 5.22 9.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z"
                  clipRule="evenodd"
                />
              </svg>
              Failing only
            </button>
          </div>

          {/* Criteria list */}
          <div className="divide-y divide-card-border">
            {aggregated.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {showOnlyFailing
                  ? "All criteria are passing!"
                  : "No criteria found"}
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
      ? "text-yellow-500"
      : "text-failure";

  const barColor =
    criterion.rate >= 100
      ? "var(--success)"
      : criterion.rate >= 50
      ? "#eab308"
      : "var(--failure)";

  return (
    <div className="group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        {/* Status icon */}
        <div className="flex-shrink-0">
          {criterion.rate >= 100 ? (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path
                  fillRule="evenodd"
                  d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          ) : (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-failure/15 text-failure">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path
                  fillRule="evenodd"
                  d="M8 15A7 7 0 108 1a7 7 0 000 14zM6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8 5.22 9.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>

        {/* Name + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium truncate">
              {scenarioIdToTitle(criterion.id)}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {criterion.passed}/{criterion.total}
              </span>
              <span
                className={`text-xs font-semibold tabular-nums ${rateColor}`}
              >
                {Math.round(criterion.rate)}%
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${criterion.rate}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>

        {/* Expand chevron */}
        {criterion.failedScenarios.length > 0 && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Expanded: show failed scenarios */}
      {expanded && criterion.failedScenarios.length > 0 && (
        <div className="px-4 pb-3 pl-12">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Failed in:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {criterion.failedScenarios.map((scenarioId) => (
              <Link
                key={scenarioId}
                to={`/scenario/${encodeURIComponent(scenarioId)}`}
                className="inline-flex items-center gap-1 rounded-md bg-failure-bg px-2 py-1 text-xs font-medium text-failure hover:bg-failure/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 15A7 7 0 108 1a7 7 0 000 14zM6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8 5.22 9.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {scenarioIdToTitle(scenarioId)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
