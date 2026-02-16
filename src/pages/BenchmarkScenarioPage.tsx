import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useBenchmarkData } from "@/components/BenchmarkDataProvider";
import { CrossModelScenarioView } from "@/components/benchmark/CrossModelScenarioView";

export function BenchmarkScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { models } = useBenchmarkData();
  const decodedId = decodeURIComponent(scenarioId ?? "");

  // Build sorted list of all scenario IDs for prev/next navigation.
  // Sort by: number of models that fail (desc), then alphabetical.
  const allScenarioIds = useMemo(() => {
    if (models.length === 0) return [];

    const idSet = new Set<string>();
    for (const m of models) {
      for (const r of m.data.results) {
        idSet.add(r.scenarioId);
      }
    }

    const ids = Array.from(idSet);
    ids.sort((a, b) => {
      const aFails = models.filter((m) => {
        const r = m.data.results.find((r) => r.scenarioId === a);
        return r && !r.passed;
      }).length;
      const bFails = models.filter((m) => {
        const r = m.data.results.find((r) => r.scenarioId === b);
        return r && !r.passed;
      }).length;
      if (aFails !== bFails) return bFails - aFails; // More failures first
      return a.localeCompare(b);
    });

    return ids;
  }, [models]);

  if (models.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <h2 className="text-xl font-semibold tracking-tight">
            No Benchmark Data
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Load model result files before viewing benchmark comparisons.
          </p>
          <Link
            to="/benchmark"
            className="mt-6 inline-block text-sm underline underline-offset-4 decoration-card-border hover:decoration-foreground transition-colors"
          >
            &larr; Go to Benchmark
          </Link>
        </div>
      </div>
    );
  }

  const hasScenario = models.some((m) =>
    m.data.results.some((r) => r.scenarioId === decodedId),
  );

  if (!hasScenario) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <h2 className="text-xl font-semibold tracking-tight">
            Scenario Not Found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not find scenario{" "}
            <code className="bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              {decodedId}
            </code>{" "}
            in any model results.
          </p>
          <Link
            to="/benchmark"
            className="mt-6 inline-block text-sm underline underline-offset-4 decoration-card-border hover:decoration-foreground transition-colors"
          >
            &larr; Back to Benchmark
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
      <CrossModelScenarioView
        scenarioId={decodedId}
        models={models}
        allScenarioIds={allScenarioIds}
      />
    </div>
  );
}
