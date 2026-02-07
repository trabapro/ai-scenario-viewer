import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import type { HistoryEntry } from "@/components/ScenarioDataProvider";
import type { ScenarioResults } from "@/types/scenario";
import { formatFullTimestamp, formatDuration, getPassRate } from "@/lib/utils";

interface CompareViewProps {
  history: HistoryEntry[];
  loadHistoryData: (id: string) => ScenarioResults | null;
}

interface LoadedRun {
  entry: HistoryEntry;
  data: ScenarioResults;
}

type ChangeStatus = "regressed" | "fixed" | "stable-pass" | "stable-fail" | "new" | "removed";

export function CompareView({ history, loadHistoryData }: CompareViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(history.map((h) => h.id))
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(history.map((h) => h.id)));
  }, [history]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const loadedRuns: LoadedRun[] = useMemo(() => {
    const runs: LoadedRun[] = [];
    for (const entry of history) {
      if (!selectedIds.has(entry.id)) continue;
      const data = loadHistoryData(entry.id);
      if (data) {
        runs.push({ entry, data });
      }
    }
    runs.sort(
      (a, b) =>
        new Date(a.entry.timestamp).getTime() -
        new Date(b.entry.timestamp).getTime()
    );
    return runs;
  }, [history, selectedIds, loadHistoryData]);

  const runStats = useMemo(() => {
    return loadedRuns.map((run) => {
      const total = run.data.summary?.total ?? run.data.results.length;
      const passed =
        run.data.summary?.passed ??
        run.data.results.filter((r) => r.passed).length;
      const scenarioPassRate = getPassRate(passed, total);

      let criteriaTotal = 0;
      let criteriaPassed = 0;
      for (const r of run.data.results) {
        for (const c of r.criteria) {
          criteriaTotal++;
          if (c.passed) criteriaPassed++;
        }
      }
      const criteriaPassRate = getPassRate(criteriaPassed, criteriaTotal);
      const duration = run.data.summary?.duration ?? 0;

      return {
        ...run,
        scenarioPassRate,
        criteriaPassRate,
        criteriaTotal,
        criteriaPassed,
        duration,
        scenarioTotal: total,
        scenarioPassed: passed,
      };
    });
  }, [loadedRuns]);

  const hasEnoughRuns = loadedRuns.length >= 2;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back
          </Link>
          <h2 className="text-lg font-semibold tracking-tight">Compare Runs</h2>
        </div>
      </div>

      {/* Run Selector */}
      <RunSelector
        history={history}
        selectedIds={selectedIds}
        onToggle={toggleSelection}
        onSelectAll={selectAll}
        onSelectNone={selectNone}
      />

      {!hasEnoughRuns && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Select at least 2 runs to compare.
        </div>
      )}

      {hasEnoughRuns && (
        <>
          <SummaryDeltaCards runStats={runStats} />

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <TimeSeriesChart
              title="Scenario Pass Rate"
              suffix="%"
              data={runStats.map((r) => ({
                label: runLabel(r.entry),
                value: r.scenarioPassRate,
              }))}
              color="var(--foreground)"
              min={0}
              max={100}
            />
            <TimeSeriesChart
              title="Criteria Pass Rate"
              suffix="%"
              data={runStats.map((r) => ({
                label: runLabel(r.entry),
                value: r.criteriaPassRate,
              }))}
              color="var(--success)"
              min={0}
              max={100}
            />
            <TimeSeriesChart
              title="Total Duration"
              suffix=""
              data={runStats.map((r) => ({
                label: runLabel(r.entry),
                value: r.duration,
              }))}
              color="var(--muted-foreground)"
              formatValue={formatDuration}
            />
          </div>

          <ScenarioDiffTable runStats={runStats} />
          <CriteriaDiffTable runStats={runStats} />
        </>
      )}
    </div>
  );
}

function runLabel(entry: HistoryEntry): string {
  if (entry.filename) {
    return entry.filename.length > 20
      ? entry.filename.slice(0, 17) + "..."
      : entry.filename;
  }
  const d = new Date(entry.timestamp);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RunSelector({
  history,
  selectedIds,
  onToggle,
  onSelectAll,
  onSelectNone,
}: {
  history: HistoryEntry[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}) {
  return (
    <div className="border border-card-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Select Runs</span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-foreground underline underline-offset-2 decoration-card-border hover:decoration-foreground"
          >
            All
          </button>
          <button
            onClick={onSelectNone}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            None
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((entry) => {
          const selected = selectedIds.has(entry.id);
          return (
            <button
              key={entry.id}
              onClick={() => onToggle(entry.id)}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-medium transition-colors ${
                selected
                  ? "border-foreground bg-foreground/5 text-foreground"
                  : "border-card-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  selected ? "bg-foreground" : "bg-muted-foreground/30"
                }`}
              />
              <span className="truncate max-w-[160px]">
                {entry.filename || formatFullTimestamp(entry.timestamp)}
              </span>
              <span
                className={`shrink-0 font-mono tabular-nums ${
                  entry.passRate >= 100
                    ? "text-success"
                    : entry.passRate >= 50
                    ? "text-muted-foreground"
                    : "text-failure"
                }`}
              >
                {entry.passRate}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface RunStat {
  entry: HistoryEntry;
  data: ScenarioResults;
  scenarioPassRate: number;
  criteriaPassRate: number;
  criteriaTotal: number;
  criteriaPassed: number;
  duration: number;
  scenarioTotal: number;
  scenarioPassed: number;
}

function SummaryDeltaCards({ runStats }: { runStats: RunStat[] }) {
  if (runStats.length < 2) return null;

  const latest = runStats[runStats.length - 1];
  const previous = runStats[runStats.length - 2];

  const scenarioDelta = latest.scenarioPassRate - previous.scenarioPassRate;
  const criteriaDelta = latest.criteriaPassRate - previous.criteriaPassRate;
  const durationDelta = latest.duration - previous.duration;

  const latestScenarioIds = new Set(
    latest.data.results.map((r) => r.scenarioId)
  );
  const previousScenarioIds = new Set(
    previous.data.results.map((r) => r.scenarioId)
  );

  let addedCount = 0;
  let removedCount = 0;
  for (const id of latestScenarioIds) {
    if (!previousScenarioIds.has(id)) addedCount++;
  }
  for (const id of previousScenarioIds) {
    if (!latestScenarioIds.has(id)) removedCount++;
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-px border border-card-border sm:grid-cols-4">
      <DeltaCard
        label="Scenario Pass Rate"
        delta={scenarioDelta}
        suffix="%"
        positiveIsGood={true}
      />
      <DeltaCard
        label="Criteria Pass Rate"
        delta={criteriaDelta}
        suffix="%"
        positiveIsGood={true}
      />
      <DeltaCard
        label="Duration"
        delta={durationDelta}
        formatValue={(v) => {
          const abs = Math.abs(v);
          const formatted = formatDuration(abs);
          if (v < 0) return formatted + " faster";
          if (v > 0) return formatted + " slower";
          return "no change";
        }}
        positiveIsGood={false}
      />
      <div className="bg-card p-4">
        <div className="text-xs text-muted-foreground mb-1">
          Scenario Changes
        </div>
        <div className="flex items-baseline gap-3">
          {addedCount > 0 && (
            <span className="text-sm font-medium text-success">
              +{addedCount}
            </span>
          )}
          {removedCount > 0 && (
            <span className="text-sm font-medium text-failure">
              -{removedCount}
            </span>
          )}
          {addedCount === 0 && removedCount === 0 && (
            <span className="text-sm text-muted-foreground">
              None
            </span>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          vs previous
        </div>
      </div>
    </div>
  );
}

function DeltaCard({
  label,
  delta,
  suffix,
  positiveIsGood,
  formatValue,
}: {
  label: string;
  delta: number;
  suffix?: string;
  positiveIsGood: boolean;
  formatValue?: (value: number) => string;
}) {
  const isPositive = delta > 0;
  const isNeutral = Math.abs(delta) < 0.05;
  const isGood = isNeutral
    ? null
    : positiveIsGood
    ? isPositive
    : !isPositive;

  const displayValue = formatValue
    ? formatValue(delta)
    : `${isPositive ? "+" : ""}${Math.round(delta * 10) / 10}${suffix ?? ""}`;

  return (
    <div className="bg-card p-4">
      <div className="text-xs text-muted-foreground mb-1">
        {label}
      </div>
      <div
        className={`text-lg font-light tabular-nums ${
          isNeutral
            ? "text-muted-foreground"
            : isGood
            ? "text-success"
            : "text-failure"
        }`}
      >
        {displayValue}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">
        vs previous
      </div>
    </div>
  );
}

interface ChartDataPoint {
  label: string;
  value: number;
}

function TimeSeriesChart({
  title,
  data,
  color,
  suffix,
  min: propMin,
  max: propMax,
  formatValue,
}: {
  title: string;
  data: ChartDataPoint[];
  color: string;
  suffix?: string;
  min?: number;
  max?: number;
  formatValue?: (v: number) => string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 400;
  const height = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const dataMin = propMin ?? Math.min(...values);
  const dataMax = propMax ?? Math.max(...values);
  const range = dataMax - dataMin || 1;

  const xScale = (i: number): number => {
    if (data.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (i / (data.length - 1)) * chartWidth;
  };

  const yScale = (v: number): number => {
    return paddingTop + chartHeight - ((v - dataMin) / range) * chartHeight;
  };

  const points = data.map((d, i) => ({
    x: xScale(i),
    y: yScale(d.value),
  }));

  const linePath =
    points.length > 0
      ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${
          paddingTop + chartHeight
        } L ${points[0].x},${paddingTop + chartHeight} Z`
      : "";

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const val = dataMin + frac * range;
    return {
      y: yScale(val),
      label: formatValue ? formatValue(val) : `${Math.round(val * 10) / 10}${suffix ?? ""}`,
    };
  });

  const displayVal = (i: number): string => {
    const val = data[i].value;
    return formatValue ? formatValue(val) : `${Math.round(val * 10) / 10}${suffix ?? ""}`;
  };

  return (
    <div className="border border-card-border bg-card p-4">
      <div className="text-sm font-medium mb-3">{title}</div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={gl.y}
              x2={width - paddingRight}
              y2={gl.y}
              stroke="var(--card-border)"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 6}
              y={gl.y + 3}
              textAnchor="end"
              fill="var(--muted-foreground)"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              {gl.label}
            </text>
          </g>
        ))}

        {points.length > 1 && (
          <path d={areaPath} fill={color} opacity={0.05} />
        )}

        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {data.map((d, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - 6}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize="8"
            fontFamily="var(--font-mono)"
          >
            {d.label.length > 12 ? d.label.slice(0, 10) + ".." : d.label}
          </text>
        ))}

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={
                i === 0
                  ? paddingLeft
                  : (xScale(i - 1) + xScale(i)) / 2
              }
              y={paddingTop}
              width={
                data.length === 1
                  ? chartWidth
                  : i === 0 || i === data.length - 1
                  ? chartWidth / (data.length - 1) / 2 +
                    (i === 0 ? paddingLeft - paddingLeft : 0)
                  : (xScale(i + 1) - xScale(i - 1)) / 2
              }
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 4 : 2.5}
              fill={color}
              stroke="var(--card)"
              strokeWidth="1.5"
              style={{ transition: "r 0.15s ease" }}
            />
            {hoveredIndex === i && (
              <g>
                <rect
                  x={p.x - 36}
                  y={p.y - 28}
                  width={72}
                  height={20}
                  rx={2}
                  fill="var(--foreground)"
                  opacity={0.9}
                />
                <text
                  x={p.x}
                  y={p.y - 15}
                  textAnchor="middle"
                  fill="var(--background)"
                  fontSize="10"
                  fontWeight="500"
                  fontFamily="var(--font-mono)"
                >
                  {displayVal(i)}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function ScenarioDiffTable({ runStats }: { runStats: RunStat[] }) {
  const allScenarioIds = useMemo(() => {
    const idSet = new Set<string>();
    for (const run of runStats) {
      for (const r of run.data.results) {
        idSet.add(r.scenarioId);
      }
    }
    return Array.from(idSet).sort();
  }, [runStats]);

  const statusMap = useMemo(() => {
    const map = new Map<string, (boolean | undefined)[]>();
    for (const id of allScenarioIds) {
      const statuses = runStats.map((run) => {
        const result = run.data.results.find((r) => r.scenarioId === id);
        return result?.passed;
      });
      map.set(id, statuses);
    }
    return map;
  }, [allScenarioIds, runStats]);

  const changeStatuses = useMemo(() => {
    const map = new Map<string, ChangeStatus>();
    for (const id of allScenarioIds) {
      const statuses = statusMap.get(id)!;
      map.set(id, computeChangeStatus(statuses));
    }
    return map;
  }, [allScenarioIds, statusMap]);

  if (allScenarioIds.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Scenario Results by Run</h3>
      <div className="border border-card-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-card-border">
              <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[200px]">
                Scenario
              </th>
              {runStats.map((run, i) => (
                <th
                  key={i}
                  className="text-center p-3 font-medium text-muted-foreground min-w-[100px]"
                >
                  <div className="truncate max-w-[120px] mx-auto">
                    {runLabel(run.entry)}
                  </div>
                </th>
              ))}
              <th className="text-center p-3 font-medium text-muted-foreground min-w-[100px]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {allScenarioIds.map((id) => {
              const statuses = statusMap.get(id)!;
              const change = changeStatuses.get(id)!;
              return (
                <tr
                  key={id}
                  className="border-b border-card-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="p-3 font-mono truncate max-w-[200px] sticky left-0 bg-card z-10">
                    {id}
                  </td>
                  {statuses.map((passed, runIdx) => {
                    const prevPassed =
                      runIdx > 0 ? statuses[runIdx - 1] : undefined;
                    const isRegression =
                      prevPassed === true && passed === false;
                    const isFix = prevPassed === false && passed === true;
                    return (
                      <td
                        key={runIdx}
                        className={`text-center p-3 ${
                          isRegression
                            ? "bg-failure-bg"
                            : isFix
                            ? "bg-success-bg"
                            : ""
                        }`}
                      >
                        {passed === undefined ? (
                          <span className="text-muted-foreground">&mdash;</span>
                        ) : passed ? (
                          <span className="text-success font-mono">Pass</span>
                        ) : (
                          <span className="text-failure font-mono">Fail</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center p-3">
                    <ChangeStatusBadge status={change} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CriteriaDiffTable({ runStats }: { runStats: RunStat[] }) {
  const allCriterionIds = useMemo(() => {
    const idSet = new Set<string>();
    for (const run of runStats) {
      for (const r of run.data.results) {
        for (const c of r.criteria) {
          idSet.add(c.id);
        }
      }
    }
    return Array.from(idSet).sort();
  }, [runStats]);

  const criterionMap = useMemo(() => {
    const map = new Map<
      string,
      { passed: number; total: number }[]
    >();
    for (const criterionId of allCriterionIds) {
      const perRun = runStats.map((run) => {
        let passed = 0;
        let total = 0;
        for (const r of run.data.results) {
          for (const c of r.criteria) {
            if (c.id === criterionId) {
              total++;
              if (c.passed) passed++;
            }
          }
        }
        return { passed, total };
      });
      map.set(criterionId, perRun);
    }
    return map;
  }, [allCriterionIds, runStats]);

  if (allCriterionIds.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Criteria Results by Run</h3>
      <div className="border border-card-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-card-border">
              <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[200px]">
                Criterion
              </th>
              {runStats.map((run, i) => (
                <th
                  key={i}
                  className="text-center p-3 font-medium text-muted-foreground min-w-[100px]"
                >
                  <div className="truncate max-w-[120px] mx-auto">
                    {runLabel(run.entry)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allCriterionIds.map((criterionId) => {
              const perRun = criterionMap.get(criterionId)!;
              return (
                <tr
                  key={criterionId}
                  className="border-b border-card-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="p-3 font-mono truncate max-w-[200px] sticky left-0 bg-card z-10">
                    {criterionId}
                  </td>
                  {perRun.map((stats, runIdx) => {
                    const prevStats = runIdx > 0 ? perRun[runIdx - 1] : null;
                    const rate =
                      stats.total > 0
                        ? Math.round((stats.passed / stats.total) * 100)
                        : null;
                    const prevRate =
                      prevStats && prevStats.total > 0
                        ? Math.round(
                            (prevStats.passed / prevStats.total) * 100
                          )
                        : null;
                    const isRegression =
                      rate !== null &&
                      prevRate !== null &&
                      rate < prevRate;
                    const isImprovement =
                      rate !== null &&
                      prevRate !== null &&
                      rate > prevRate;

                    return (
                      <td
                        key={runIdx}
                        className={`text-center p-3 ${
                          isRegression
                            ? "bg-failure-bg"
                            : isImprovement
                            ? "bg-success-bg"
                            : ""
                        }`}
                      >
                        {stats.total === 0 ? (
                          <span className="text-muted-foreground">&mdash;</span>
                        ) : (
                          <span
                            className={`font-mono ${
                              stats.passed === stats.total
                                ? "text-success"
                                : stats.passed === 0
                                ? "text-failure"
                                : "text-foreground"
                            }`}
                          >
                            {stats.passed}/{stats.total}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function computeChangeStatus(
  statuses: (boolean | undefined)[]
): ChangeStatus {
  const definedStatuses = statuses.filter((s) => s !== undefined) as boolean[];

  if (definedStatuses.length === 0) return "new";

  const firstIdx = statuses.findIndex((s) => s !== undefined);
  const lastIdx = statuses.length - 1 - [...statuses].reverse().findIndex((s) => s !== undefined);

  const appearsEarly = statuses.slice(0, -1).some((s) => s !== undefined);
  const appearsLast = statuses[statuses.length - 1] !== undefined;

  if (!appearsEarly && appearsLast) return "new";
  if (appearsEarly && !appearsLast) return "removed";

  const first = statuses[firstIdx];
  const last = statuses[lastIdx];

  if (first === true && last === false) return "regressed";
  if (first === false && last === true) return "fixed";
  if (last === true) return "stable-pass";
  return "stable-fail";
}

function ChangeStatusBadge({ status }: { status: ChangeStatus }) {
  const styles: Record<ChangeStatus, string> = {
    regressed: "text-failure",
    fixed: "text-success",
    "stable-pass": "text-success/60",
    "stable-fail": "text-failure/60",
    new: "text-foreground",
    removed: "text-muted-foreground",
  };

  const labels: Record<ChangeStatus, string> = {
    regressed: "Regressed",
    fixed: "Fixed",
    "stable-pass": "Stable",
    "stable-fail": "Failing",
    new: "New",
    removed: "Removed",
  };

  return (
    <span className={`text-[11px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
