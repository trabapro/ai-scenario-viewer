import { useState } from "react";
import type { ModelStats } from "@/types/benchmark";

interface TokenCostChartProps {
  stats: ModelStats[];
}

type ViewMode = "cost" | "tokens";

export function TokenCostChart({ stats }: TokenCostChartProps) {
  const [mode, setMode] = useState<ViewMode>("cost");

  const hasTokenData = stats.some((s) => s.tokenUsage);
  if (!hasTokenData) return null;

  const sortedStats =
    mode === "cost"
      ? [...stats]
          .filter((s) => s.estimatedCost !== undefined)
          .sort((a, b) => (a.estimatedCost ?? 0) - (b.estimatedCost ?? 0))
      : [...stats]
          .filter((s) => s.tokenUsage)
          .sort(
            (a, b) =>
              (a.tokenUsage?.totalTokens ?? 0) -
              (b.tokenUsage?.totalTokens ?? 0),
          );

  const maxValue =
    mode === "cost"
      ? Math.max(...sortedStats.map((s) => s.estimatedCost ?? 0), 0.01)
      : Math.max(
          ...sortedStats.map((s) => s.tokenUsage?.totalTokens ?? 0),
          1,
        );

  return (
    <div className="border border-card-border bg-card">
      <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {mode === "cost" ? "Estimated Cost" : "Token Usage"}
        </h3>
        <div className="flex border border-card-border bg-background">
          {(
            [
              ["cost", "Cost"],
              ["tokens", "Tokens"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                mode === value
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {sortedStats.map((model) => {
          const value =
            mode === "cost"
              ? model.estimatedCost ?? 0
              : model.tokenUsage?.totalTokens ?? 0;
          const width = (value / maxValue) * 100;
          const label =
            mode === "cost"
              ? `$${value.toFixed(2)}`
              : value.toLocaleString();

          return (
            <div key={model.modelName} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-xs text-muted-foreground truncate text-right">
                {model.displayName}
              </div>
              <div className="flex-1 h-5 bg-muted/50 relative overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out flex items-center"
                  style={{
                    width: `${Math.max(width, 1)}%`,
                    backgroundColor: model.color,
                    opacity: 0.7,
                  }}
                />
              </div>
              <div className="w-20 shrink-0 text-xs font-mono tabular-nums text-muted-foreground text-right">
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {mode === "cost" && (
        <div className="px-4 pb-3 text-[10px] text-muted-foreground">
          Based on published per-token pricing. Actual costs may vary.
        </div>
      )}
    </div>
  );
}
