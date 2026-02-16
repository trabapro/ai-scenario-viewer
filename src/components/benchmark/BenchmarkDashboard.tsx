import { useMemo } from "react";
import type { ModelResult, ModelStats } from "@/types/benchmark";
import { computeModelStats } from "@/types/benchmark";
import { ModelRankingTable } from "./ModelRankingTable";
import { ScenarioHeatmap } from "./ScenarioHeatmap";
import { TokenCostChart } from "./TokenCostChart";
import { CriteriaFailureAnalysis } from "./CriteriaFailureAnalysis";

interface BenchmarkDashboardProps {
  models: ModelResult[];
  onReset: () => void;
}

export function BenchmarkDashboard({
  models,
  onReset,
}: BenchmarkDashboardProps) {
  const stats = useMemo(() => {
    return models
      .map(computeModelStats)
      .sort((a, b) => b.scenarioPassRate - a.scenarioPassRate);
  }, [models]);

  const totalScenarios = useMemo(() => {
    const ids = new Set<string>();
    for (const m of models) {
      for (const r of m.data.results) ids.add(r.scenarioId);
    }
    return ids.size;
  }, [models]);

  const totalCriteria = useMemo(() => {
    const ids = new Set<string>();
    for (const m of models) {
      for (const r of m.data.results) {
        for (const c of r.criteria) ids.add(c.id);
      }
    }
    return ids.size;
  }, [models]);

  const bestModel = stats[0];
  const worstModel = stats[stats.length - 1];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Model Benchmark
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {models.length} models · {totalScenarios} scenarios ·{" "}
            {totalCriteria} unique criteria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Upload new files
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-px border border-card-border sm:grid-cols-4 mb-6">
        <SummaryCard
          label="Best Model"
          value={bestModel?.displayName ?? "—"}
          subvalue={`${bestModel?.scenarioPassRate ?? 0}% scenarios`}
          color="var(--success)"
        />
        <SummaryCard
          label="Worst Model"
          value={worstModel?.displayName ?? "—"}
          subvalue={`${worstModel?.scenarioPassRate ?? 0}% scenarios`}
          color="var(--failure)"
        />
        <SummaryCard
          label="Pass Rate Range"
          value={`${worstModel?.scenarioPassRate ?? 0}% — ${bestModel?.scenarioPassRate ?? 0}%`}
          subvalue={`${((bestModel?.scenarioPassRate ?? 0) - (worstModel?.scenarioPassRate ?? 0)).toFixed(1)}pp spread`}
        />
        <SummaryCard
          label="Cost Range"
          value={costRange(stats)}
          subvalue={`${models.length} models compared`}
        />
      </div>

      {/* Model Ranking */}
      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Model Rankings
        </h3>
        <ModelRankingTable stats={stats} />
      </section>

      {/* Token & Cost */}
      <section className="mb-6">
        <TokenCostChart stats={stats} />
      </section>

      {/* Heatmap */}
      <section className="mb-6">
        <ScenarioHeatmap models={models} stats={stats} />
      </section>

      {/* Criteria Analysis */}
      <section className="mb-6">
        <CriteriaFailureAnalysis models={models} />
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subvalue,
  color,
}: {
  label: string;
  value: string;
  subvalue: string;
  color?: string;
}) {
  return (
    <div className="bg-card p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div
        className="text-sm font-medium truncate"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{subvalue}</div>
    </div>
  );
}

function costRange(stats: ModelStats[]): string {
  const costs = stats
    .map((s) => s.estimatedCost)
    .filter((c): c is number => c !== undefined);
  if (costs.length === 0) return "N/A";
  const min = Math.min(...costs);
  const max = Math.max(...costs);
  return `$${min.toFixed(2)} — $${max.toFixed(2)}`;
}
