import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { ModelResult } from "@/types/benchmark";
import { scenarioIdToTitle } from "@/lib/utils";

interface CriteriaFailureAnalysisProps {
  models: ModelResult[];
}

interface CriterionAgg {
  id: string;
  perModel: Map<
    string,
    { passed: number; total: number; failedScenarios: string[] }
  >;
  overallPassed: number;
  overallTotal: number;
  overallRate: number;
}

type SortBy = "rate" | "name" | "variance";

export function CriteriaFailureAnalysis({
  models,
}: CriteriaFailureAnalysisProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("rate");
  const [showOnlyFailing, setShowOnlyFailing] = useState(true);
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(
    null,
  );

  const aggregated = useMemo(() => {
    const map = new Map<
      string,
      Map<
        string,
        { passed: number; total: number; failedScenarios: string[] }
      >
    >();

    for (const model of models) {
      for (const result of model.data.results) {
        for (const criterion of result.criteria) {
          if (!map.has(criterion.id)) {
            map.set(criterion.id, new Map());
          }
          const perModel = map.get(criterion.id)!;
          if (!perModel.has(model.modelName)) {
            perModel.set(model.modelName, {
              passed: 0,
              total: 0,
              failedScenarios: [],
            });
          }
          const entry = perModel.get(model.modelName)!;
          entry.total++;
          if (criterion.passed) {
            entry.passed++;
          } else {
            entry.failedScenarios.push(result.scenarioId);
          }
        }
      }
    }

    const items: CriterionAgg[] = [];
    for (const [id, perModel] of map) {
      let overallPassed = 0;
      let overallTotal = 0;
      for (const entry of perModel.values()) {
        overallPassed += entry.passed;
        overallTotal += entry.total;
      }
      items.push({
        id,
        perModel,
        overallPassed,
        overallTotal,
        overallRate:
          overallTotal > 0 ? (overallPassed / overallTotal) * 100 : 100,
      });
    }

    let filtered = items;
    if (showOnlyFailing) {
      filtered = filtered.filter((item) => item.overallRate < 100);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rate":
          return a.overallRate - b.overallRate;
        case "name":
          return a.id.localeCompare(b.id);
        case "variance": {
          const aRates = Array.from(a.perModel.values()).map((e) =>
            e.total > 0 ? e.passed / e.total : 1,
          );
          const bRates = Array.from(b.perModel.values()).map((e) =>
            e.total > 0 ? e.passed / e.total : 1,
          );
          return variance(bRates) - variance(aRates);
        }
      }
      return 0;
    });

    return filtered;
  }, [models, sortBy, showOnlyFailing]);

  const perfectCount = useMemo(() => {
    const allIds = new Set<string>();
    for (const model of models) {
      for (const r of model.data.results) {
        for (const c of r.criteria) {
          allIds.add(c.id);
        }
      }
    }
    return (
      allIds.size -
      aggregated.filter((a) => a.overallRate < 100).length -
      (showOnlyFailing ? 0 : 0)
    );
  }, [models, aggregated, showOnlyFailing]);

  return (
    <div className="border border-card-border bg-card">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">
            Criteria Failure Analysis
          </span>
          <span className="text-xs text-muted-foreground">
            {aggregated.length} criteria shown
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {collapsed ? "+" : "\u2212"}
        </span>
      </button>

      {!collapsed && (
        <div className="border-t border-card-border">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-card-border">
            <div className="flex border border-card-border bg-background">
              {(
                [
                  ["rate", "Pass Rate"],
                  ["name", "Name"],
                  ["variance", "Variance"],
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

          <div className="divide-y divide-card-border">
            {aggregated.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                All criteria are passing across all models.
              </div>
            )}
            {aggregated.map((criterion) => (
              <div key={criterion.id}>
                <button
                  onClick={() =>
                    setExpandedCriterion(
                      expandedCriterion === criterion.id
                        ? null
                        : criterion.id,
                    )
                  }
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      criterion.overallRate >= 100 ? "bg-success" : "bg-failure"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {scenarioIdToTitle(criterion.id)}
                      </span>
                      <span
                        className={`text-xs font-mono tabular-nums ml-2 ${
                          criterion.overallRate >= 100
                            ? "text-success"
                            : criterion.overallRate >= 50
                              ? "text-muted-foreground"
                              : "text-failure"
                        }`}
                      >
                        {Math.round(criterion.overallRate)}%
                      </span>
                    </div>
                    {/* Model mini-bars */}
                    <div className="flex gap-0.5">
                      {models.map((model) => {
                        const entry = criterion.perModel.get(model.modelName);
                        const rate =
                          entry && entry.total > 0
                            ? entry.passed / entry.total
                            : 1;
                        return (
                          <div
                            key={model.modelName}
                            className="h-1.5 flex-1"
                            style={{
                              backgroundColor:
                                rate >= 1
                                  ? "var(--success)"
                                  : rate > 0
                                    ? "var(--muted-foreground)"
                                    : "var(--failure)",
                              opacity: rate >= 1 ? 0.4 : 0.7,
                            }}
                            title={`${model.displayName}: ${entry ? entry.passed : 0}/${entry ? entry.total : 0}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {expandedCriterion === criterion.id ? "\u2212" : "+"}
                  </span>
                </button>

                {expandedCriterion === criterion.id && (
                  <div className="px-4 pb-3 pl-8 space-y-2">
                    {models.map((model) => {
                      const entry = criterion.perModel.get(model.modelName);
                      if (!entry || entry.failedScenarios.length === 0)
                        return null;
                      return (
                        <div key={model.modelName}>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: model.color }}
                            />
                            <span className="text-xs font-medium">
                              {model.displayName}
                            </span>
                            <span className="text-[10px] text-failure font-mono">
                              {entry.failedScenarios.length} failure
                              {entry.failedScenarios.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 ml-4">
                            {entry.failedScenarios.map((sid) => (
                              <Link
                                key={sid}
                                to={`/benchmark/scenario/${encodeURIComponent(sid)}`}
                                className="text-[10px] text-failure underline underline-offset-2 decoration-failure/30 hover:decoration-failure font-mono"
                              >
                                {sid}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return (
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  );
}
