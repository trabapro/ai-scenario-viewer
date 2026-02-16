import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { ModelResult } from "@/types/benchmark";
import type { ModelStats } from "@/types/benchmark";
import { scenarioIdToTitle } from "@/lib/utils";

interface ScenarioHeatmapProps {
  models: ModelResult[];
  stats: ModelStats[];
}

type HeatmapFilter = "all" | "mixed" | "all-fail";

export function ScenarioHeatmap({ models, stats }: ScenarioHeatmapProps) {
  const [filter, setFilter] = useState<HeatmapFilter>("all");
  const [search, setSearch] = useState("");
  const [hoveredCell, setHoveredCell] = useState<{
    scenario: string;
    model: string;
  } | null>(null);

  const sortedModels = useMemo(() => {
    return [...stats].sort(
      (a, b) => b.scenarioPassRate - a.scenarioPassRate,
    );
  }, [stats]);

  const modelOrder = useMemo(
    () => sortedModels.map((s) => s.modelName),
    [sortedModels],
  );

  const { allScenarioIds, scenarioPassCounts, grid } = useMemo(() => {
    const idSet = new Set<string>();
    for (const model of models) {
      for (const r of model.data.results) {
        idSet.add(r.scenarioId);
      }
    }
    const ids = Array.from(idSet);

    const passCountMap = new Map<string, number>();
    const failCountMap = new Map<string, number>();
    const gridMap = new Map<string, Map<string, boolean | undefined>>();

    for (const sid of ids) {
      const row = new Map<string, boolean | undefined>();
      let passCount = 0;
      let failCount = 0;
      for (const model of models) {
        const result = model.data.results.find((r) => r.scenarioId === sid);
        row.set(model.modelName, result?.passed);
        if (result?.passed === true) passCount++;
        if (result?.passed === false) failCount++;
      }
      gridMap.set(sid, row);
      passCountMap.set(sid, passCount);
      failCountMap.set(sid, failCount);
    }

    ids.sort((a, b) => {
      const aPass = passCountMap.get(a) ?? 0;
      const bPass = passCountMap.get(b) ?? 0;
      if (aPass !== bPass) return aPass - bPass;
      return a.localeCompare(b);
    });

    return {
      allScenarioIds: ids,
      scenarioPassCounts: passCountMap,
      grid: gridMap,
    };
  }, [models]);

  const filteredScenarios = useMemo(() => {
    let ids = allScenarioIds;

    if (search) {
      const q = search.toLowerCase();
      ids = ids.filter((id) => id.toLowerCase().includes(q));
    }

    if (filter === "mixed") {
      ids = ids.filter((id) => {
        const passCount = scenarioPassCounts.get(id) ?? 0;
        return passCount > 0 && passCount < models.length;
      });
    } else if (filter === "all-fail") {
      ids = ids.filter((id) => {
        const passCount = scenarioPassCounts.get(id) ?? 0;
        return passCount === 0;
      });
    }

    return ids;
  }, [allScenarioIds, filter, search, scenarioPassCounts, models.length]);

  const mixedCount = allScenarioIds.filter((id) => {
    const pc = scenarioPassCounts.get(id) ?? 0;
    return pc > 0 && pc < models.length;
  }).length;

  const allFailCount = allScenarioIds.filter(
    (id) => (scenarioPassCounts.get(id) ?? 0) === 0,
  ).length;

  return (
    <div className="border border-card-border bg-card">
      <div className="px-4 py-3 border-b border-card-border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-medium">Scenario Heatmap</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search scenarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-card-border bg-background py-1 px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-48"
            />
            <div className="flex border border-card-border bg-background">
              {(
                [
                  ["all", `All (${allScenarioIds.length})`],
                  ["mixed", `Mixed (${mixedCount})`],
                  ["all-fail", `All Fail (${allFailCount})`],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    filter === value
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Column headers */}
          <div className="flex border-b border-card-border sticky top-0 bg-card z-10">
            <div className="w-56 shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Scenario
            </div>
            {modelOrder.map((modelName) => {
              const stat = sortedModels.find((s) => s.modelName === modelName);
              return (
                <div
                  key={modelName}
                  className="w-8 shrink-0 flex items-end justify-center pb-2"
                  title={stat?.displayName}
                >
                  <div
                    className="text-[9px] font-mono text-muted-foreground whitespace-nowrap origin-bottom-left"
                    style={{
                      transform: "rotate(-55deg) translateX(-4px)",
                      maxWidth: "70px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {stat?.displayName ?? modelName}
                  </div>
                </div>
              );
            })}
            <div className="w-14 shrink-0 px-2 py-2 text-[10px] font-mono text-muted-foreground text-right">
              Pass
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-card-border/50">
            {filteredScenarios.map((scenarioId) => {
              const row = grid.get(scenarioId);
              const passCount = scenarioPassCounts.get(scenarioId) ?? 0;
              return (
                <div key={scenarioId} className="flex hover:bg-muted/20">
                  <Link
                    to={`/benchmark/scenario/${encodeURIComponent(scenarioId)}`}
                    className="w-56 shrink-0 px-3 py-1.5 text-xs font-mono truncate hover:text-foreground text-muted-foreground transition-colors"
                    title={scenarioIdToTitle(scenarioId)}
                  >
                    {scenarioId}
                  </Link>
                  {modelOrder.map((modelName) => {
                    const passed = row?.get(modelName);
                    const isHovered =
                      hoveredCell?.scenario === scenarioId &&
                      hoveredCell?.model === modelName;
                    return (
                      <Link
                        key={modelName}
                        to={`/benchmark/scenario/${encodeURIComponent(scenarioId)}`}
                        className="w-8 shrink-0 flex items-center justify-center relative"
                        onMouseEnter={() =>
                          setHoveredCell({
                            scenario: scenarioId,
                            model: modelName,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div
                          className={`h-5 w-6 transition-all ${
                            passed === true
                              ? "bg-success/40"
                              : passed === false
                                ? "bg-failure/40"
                                : "bg-muted/50"
                          } ${isHovered ? "ring-1 ring-foreground/50 scale-110" : ""}`}
                        />
                        {isHovered && (
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 whitespace-nowrap z-20 pointer-events-none">
                            {modelNameToDisplayInline(modelName)}:{" "}
                            {passed === true
                              ? "Pass"
                              : passed === false
                                ? "Fail"
                                : "N/A"}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                  <div className="w-14 shrink-0 px-2 py-1.5 text-[10px] font-mono tabular-nums text-right">
                    <span
                      className={
                        passCount === models.length
                          ? "text-success"
                          : passCount === 0
                            ? "text-failure"
                            : "text-muted-foreground"
                      }
                    >
                      {passCount}/{models.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredScenarios.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No scenarios match your filter.
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-card-border flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-4 bg-success/40" /> Pass
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-4 bg-failure/40" /> Fail
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-4 bg-muted/50" /> N/A
        </div>
        <span className="ml-auto">
          Click any scenario to compare conversations
        </span>
      </div>
    </div>
  );
}

function modelNameToDisplayInline(name: string): string {
  return name
    .split("-")
    .map((w) => (/^\d/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}
