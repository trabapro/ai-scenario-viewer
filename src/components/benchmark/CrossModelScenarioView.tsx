import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ModelResult } from "@/types/benchmark";
import type { ScenarioResult } from "@/types/scenario";
import { scenarioIdToTitle, formatDuration, getUserTurns } from "@/lib/utils";
import { ConversationView } from "@/components/ConversationView";

interface CrossModelScenarioViewProps {
  scenarioId: string;
  models: ModelResult[];
  allScenarioIds?: string[];
}

export function CrossModelScenarioView({
  scenarioId,
  models,
  allScenarioIds,
}: CrossModelScenarioViewProps) {
  const navigate = useNavigate();
  const [enabledModels, setEnabledModels] = useState<Set<string>>(
    () => new Set(models.map((m) => m.modelName)),
  );
  const [showCriteria, setShowCriteria] = useState(true);

  // Reset enabled models when models list changes
  useEffect(() => {
    setEnabledModels(new Set(models.map((m) => m.modelName)));
  }, [models]);

  const modelResults = useMemo(() => {
    const results: {
      model: ModelResult;
      result: ScenarioResult | undefined;
    }[] = [];
    for (const model of models) {
      const result = model.data.results.find(
        (r) => r.scenarioId === scenarioId,
      );
      results.push({ model, result });
    }
    results.sort((a, b) => {
      if (a.result?.passed && !b.result?.passed) return -1;
      if (!a.result?.passed && b.result?.passed) return 1;
      return 0;
    });
    return results;
  }, [models, scenarioId]);

  const passCount = modelResults.filter((mr) => mr.result?.passed).length;
  const totalCount = modelResults.filter((mr) => mr.result).length;

  // Prev / Next navigation
  const currentIndex = allScenarioIds?.indexOf(scenarioId) ?? -1;
  const hasPrev = allScenarioIds !== undefined && currentIndex > 0;
  const hasNext =
    allScenarioIds !== undefined &&
    currentIndex >= 0 &&
    currentIndex < allScenarioIds.length - 1;

  function goToScenario(id: string) {
    navigate(`/benchmark/scenario/${encodeURIComponent(id)}`);
  }

  function toggleModel(modelName: string) {
    setEnabledModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelName)) {
        if (next.size > 1) next.delete(modelName);
      } else {
        next.add(modelName);
      }
      return next;
    });
  }

  function enableAll() {
    setEnabledModels(new Set(models.map((m) => m.modelName)));
  }

  function enablePassingOnly() {
    const passing = modelResults
      .filter((mr) => mr.result?.passed)
      .map((mr) => mr.model.modelName);
    setEnabledModels(
      new Set(
        passing.length > 0
          ? passing
          : [models[0]?.modelName].filter(Boolean),
      ),
    );
  }

  function enableFailingOnly() {
    const failing = modelResults
      .filter((mr) => mr.result && !mr.result.passed)
      .map((mr) => mr.model.modelName);
    setEnabledModels(
      new Set(
        failing.length > 0
          ? failing
          : [models[0]?.modelName].filter(Boolean),
      ),
    );
  }

  function enableMinimum() {
    setEnabledModels(
      new Set([models[0]?.modelName].filter(Boolean)),
    );
  }

  const visibleResults = modelResults.filter((mr) =>
    enabledModels.has(mr.model.modelName),
  );

  const allCriteriaIds = useMemo(() => {
    const idSet = new Set<string>();
    for (const { result } of modelResults) {
      if (result) {
        for (const c of result.criteria) {
          idSet.add(c.id);
        }
      }
    }
    return Array.from(idSet);
  }, [modelResults]);

  // Keyboard navigation (left/right arrows)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft" && hasPrev && allScenarioIds) {
        e.preventDefault();
        goToScenario(allScenarioIds[currentIndex - 1]);
      }
      if (e.key === "ArrowRight" && hasNext && allScenarioIds) {
        e.preventDefault();
        goToScenario(allScenarioIds[currentIndex + 1]);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="animate-fade-in">
      {/* Header with navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/benchmark")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Benchmark
          </button>

          {allScenarioIds && allScenarioIds.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                {currentIndex + 1} / {allScenarioIds.length}
              </span>
              <button
                disabled={!hasPrev}
                onClick={() =>
                  hasPrev && goToScenario(allScenarioIds[currentIndex - 1])
                }
                className="px-2.5 py-1 text-xs border border-card-border hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                &larr; Prev
              </button>
              <button
                disabled={!hasNext}
                onClick={() =>
                  hasNext && goToScenario(allScenarioIds[currentIndex + 1])
                }
                className="px-2.5 py-1 text-xs border border-card-border hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold tracking-tight">
          {scenarioIdToTitle(scenarioId)}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          {scenarioId}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span
            className={
              passCount === totalCount
                ? "text-success"
                : passCount === 0
                  ? "text-failure"
                  : "text-foreground"
            }
          >
            {passCount}/{totalCount} models pass
          </span>
          <span>{allCriteriaIds.length} criteria</span>
          {allScenarioIds && (
            <span className="text-[10px]">(Arrow keys to navigate)</span>
          )}
        </div>
      </div>

      {/* Model toggle bar */}
      <div className="mb-4 border border-card-border bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Models ({enabledModels.size}/{models.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={enableAll}
              className="px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground border border-card-border hover:bg-muted/50 transition-colors"
            >
              All
            </button>
            <button
              onClick={enablePassingOnly}
              className="px-2 py-0.5 text-[10px] text-success hover:bg-success-bg/30 border border-card-border transition-colors"
            >
              Passing
            </button>
            <button
              onClick={enableFailingOnly}
              className="px-2 py-0.5 text-[10px] text-failure hover:bg-failure-bg/30 border border-card-border transition-colors"
            >
              Failing
            </button>
            <button
              onClick={enableMinimum}
              className="px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground border border-card-border hover:bg-muted/50 transition-colors"
            >
              Min
            </button>
            <span className="mx-2 h-4 w-px bg-card-border" />
            <button
              onClick={() => setShowCriteria(!showCriteria)}
              className={`px-2 py-0.5 text-[10px] border border-card-border transition-colors ${
                showCriteria
                  ? "text-foreground bg-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Criteria
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {modelResults.map(({ model, result }) => {
            const enabled = enabledModels.has(model.modelName);
            return (
              <button
                key={model.modelName}
                onClick={() => toggleModel(model.modelName)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border transition-all ${
                  enabled
                    ? "border-foreground/30 bg-foreground/5 text-foreground"
                    : "border-card-border text-muted-foreground/50 opacity-60"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: model.color,
                    opacity: enabled ? 1 : 0.3,
                  }}
                />
                <span className="truncate max-w-[120px]">
                  {model.displayName}
                </span>
                {result && (
                  <span
                    className={`text-[10px] font-mono ${
                      result.passed ? "text-success" : "text-failure"
                    }`}
                  >
                    {result.passed ? "P" : "F"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Split-screen conversation panels */}
      <div
        className="flex gap-3 overflow-x-auto pb-4 snap-x"
        style={{ scrollBehavior: "smooth" }}
      >
        {visibleResults.map(({ model, result }) => (
          <div
            key={model.modelName}
            className="shrink-0 snap-start border border-card-border bg-card flex flex-col"
            style={{
              width:
                visibleResults.length === 1
                  ? "100%"
                  : visibleResults.length === 2
                    ? "calc(50% - 6px)"
                    : "min(480px, 85vw)",
            }}
          >
            {/* Panel header */}
            <div
              className="px-4 py-2.5 border-b flex items-center justify-between shrink-0"
              style={{ borderColor: model.color + "40" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: model.color }}
                />
                <span className="text-sm font-medium truncate">
                  {model.displayName}
                </span>
                {result && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                      result.passed
                        ? "text-success border-success/30 bg-success-bg/30"
                        : "text-failure border-failure/30 bg-failure-bg/30"
                    }`}
                  >
                    {result.passed ? "PASS" : "FAIL"}
                  </span>
                )}
              </div>
              {result && (
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground shrink-0">
                  <span>{formatDuration(result.duration)}</span>
                  <span>{getUserTurns(result.conversation)}t</span>
                  <span>
                    {result.criteria.filter((c) => c.passed).length}/
                    {result.criteria.length}
                  </span>
                </div>
              )}
            </div>

            {result ? (
              <div className="flex-1 overflow-y-auto">
                {/* Inline criteria */}
                {showCriteria && (
                  <div className="border-b border-card-border">
                    <div className="divide-y divide-card-border">
                      {result.criteria.map((c) => (
                        <div
                          key={c.id}
                          className={`px-3 py-1.5 ${
                            c.passed ? "bg-success-bg/20" : "bg-failure-bg/30"
                          }`}
                          style={{
                            borderLeft: `3px solid var(--${c.passed ? "success" : "failure"})`,
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                c.passed ? "bg-success" : "bg-failure"
                              }`}
                            />
                            <span className="text-[11px] font-medium truncate">
                              {scenarioIdToTitle(c.id)}
                            </span>
                          </div>
                          {!c.passed && c.reason && (
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 ml-3">
                              {c.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation */}
                <ConversationView messages={result.conversation} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
                No result for this scenario
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Collapsible criteria comparison matrix */}
      <CriteriaMatrix
        modelResults={modelResults}
        allCriteriaIds={allCriteriaIds}
      />
    </div>
  );
}

function CriteriaMatrix({
  modelResults,
  allCriteriaIds,
}: {
  modelResults: {
    model: ModelResult;
    result: ScenarioResult | undefined;
  }[];
  allCriteriaIds: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-[10px]">{expanded ? "\u25BE" : "\u25B8"}</span>
        Criteria Comparison Matrix
        <span className="normal-case tracking-normal font-normal">
          {allCriteriaIds.length} criteria &times;{" "}
          {modelResults.filter((mr) => mr.result).length} models
        </span>
      </button>

      {expanded && (
        <div className="border border-card-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left p-3 font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[180px]">
                  Criterion
                </th>
                {modelResults.map(({ model, result }) => (
                  <th
                    key={model.modelName}
                    className="text-center p-3 font-medium text-muted-foreground min-w-[80px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="truncate max-w-[80px] text-[10px]">
                        {model.displayName}
                      </span>
                      {result && (
                        <span
                          className={`text-[9px] font-mono ${
                            result.passed ? "text-success" : "text-failure"
                          }`}
                        >
                          {result.passed ? "PASS" : "FAIL"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allCriteriaIds.map((criterionId) => (
                <tr
                  key={criterionId}
                  className="border-b border-card-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="p-3 font-mono truncate max-w-[180px] sticky left-0 bg-card z-10">
                    {criterionId}
                  </td>
                  {modelResults.map(({ model, result }) => {
                    const criterion = result?.criteria.find(
                      (c) => c.id === criterionId,
                    );
                    return (
                      <td
                        key={model.modelName}
                        className={`text-center p-3 ${
                          criterion?.passed === false
                            ? "bg-failure-bg/50"
                            : criterion?.passed === true
                              ? "bg-success-bg/30"
                              : ""
                        }`}
                      >
                        {criterion === undefined ? (
                          <span className="text-muted-foreground">
                            &mdash;
                          </span>
                        ) : criterion.passed ? (
                          <span className="text-success font-mono">Pass</span>
                        ) : (
                          <span className="text-failure font-mono">Fail</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
