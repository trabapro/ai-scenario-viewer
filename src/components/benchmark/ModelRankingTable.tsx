import { useState, useMemo } from "react";
import type { ModelStats } from "@/types/benchmark";
import { formatDuration } from "@/lib/utils";

interface ModelRankingTableProps {
  stats: ModelStats[];
}

type SortKey =
  | "scenarioPassRate"
  | "criteriaPassRate"
  | "estimatedCost"
  | "duration"
  | "tokenUsage";

export function ModelRankingTable({ stats }: ModelRankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("scenarioPassRate");
  const [sortDesc, setSortDesc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortDesc(key === "duration" || key === "estimatedCost" ? false : true);
    }
  };

  const sorted = useMemo(() => {
    const copy = [...stats];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "scenarioPassRate":
          cmp = a.scenarioPassRate - b.scenarioPassRate;
          break;
        case "criteriaPassRate":
          cmp = a.criteriaPassRate - b.criteriaPassRate;
          break;
        case "estimatedCost":
          cmp = (a.estimatedCost ?? 999) - (b.estimatedCost ?? 999);
          break;
        case "duration":
          cmp = a.duration - b.duration;
          break;
        case "tokenUsage":
          cmp =
            (a.tokenUsage?.totalTokens ?? 0) -
            (b.tokenUsage?.totalTokens ?? 0);
          break;
      }
      return sortDesc ? -cmp : cmp;
    });
    return copy;
  }, [stats, sortKey, sortDesc]);

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDesc ? " \u2193" : " \u2191") : "";

  return (
    <div className="border border-card-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border bg-muted/50">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-10">
              #
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Model
            </th>
            <th
              onClick={() => handleSort("scenarioPassRate")}
              className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              Scenarios{arrow("scenarioPassRate")}
            </th>
            <th
              onClick={() => handleSort("criteriaPassRate")}
              className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              Criteria{arrow("criteriaPassRate")}
            </th>
            <th
              onClick={() => handleSort("tokenUsage")}
              className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              Tokens{arrow("tokenUsage")}
            </th>
            <th
              onClick={() => handleSort("estimatedCost")}
              className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              Est. Cost{arrow("estimatedCost")}
            </th>
            <th
              onClick={() => handleSort("duration")}
              className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              Duration{arrow("duration")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {sorted.map((model, i) => {
            const isBest = i === 0 && sortKey === "scenarioPassRate" && sortDesc;
            return (
              <tr
                key={model.modelName}
                className={`transition-colors hover:bg-muted/30 ${isBest ? "bg-success-bg/30" : ""}`}
              >
                <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                  {i + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: model.color }}
                    />
                    <span className="font-medium text-sm">
                      {model.displayName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono tabular-nums text-sm">
                    {model.scenariosPassed}/{model.scenariosTotal}
                  </span>
                  <span
                    className={`ml-1.5 text-xs font-mono tabular-nums ${
                      model.scenarioPassRate >= 80
                        ? "text-success"
                        : model.scenarioPassRate >= 60
                          ? "text-muted-foreground"
                          : "text-failure"
                    }`}
                  >
                    {model.scenarioPassRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono tabular-nums text-sm">
                    {model.criteriaPassed}/{model.criteriaTotal}
                  </span>
                  <span className="ml-1.5 text-xs font-mono tabular-nums text-muted-foreground">
                    {model.criteriaPassRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-xs text-muted-foreground">
                  {model.tokenUsage
                    ? model.tokenUsage.totalTokens.toLocaleString()
                    : "\u2014"}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                  {model.estimatedCost !== undefined ? (
                    <span
                      className={
                        model.estimatedCost > 5
                          ? "text-failure"
                          : model.estimatedCost > 1
                            ? "text-muted-foreground"
                            : "text-success"
                      }
                    >
                      ${model.estimatedCost.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">\u2014</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-xs text-muted-foreground">
                  {formatDuration(model.duration)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
