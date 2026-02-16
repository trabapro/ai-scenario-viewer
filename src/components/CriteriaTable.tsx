import { useState } from "react";
import type { Criterion } from "@/types/scenario";
import { scenarioIdToTitle } from "@/lib/utils";

interface CriteriaTableProps {
  criteria: Criterion[];
}

export function CriteriaTable({ criteria }: CriteriaTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden border border-card-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border bg-muted/50">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-12">
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Criterion
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Reason
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {criteria.map((criterion) => {
            const hasJudges =
              criterion.modelEvaluations &&
              criterion.modelEvaluations.length > 0;
            const isExpanded = expandedId === criterion.id;

            return (
              <tr
                key={criterion.id}
                className={`transition-colors ${
                  criterion.passed
                    ? "bg-success-bg/40 hover:bg-success-bg/70"
                    : "bg-failure-bg/40 hover:bg-failure-bg/70"
                }`}
              >
                <td
                  className="py-3 pl-4 pr-2 w-12 align-top"
                  style={{
                    borderLeft: `3px solid var(--${criterion.passed ? "success" : "failure"})`,
                  }}
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      criterion.passed ? "bg-success" : "bg-failure"
                    }`}
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-sm">
                    {scenarioIdToTitle(criterion.id)}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {criterion.id}
                  </p>
                  {/* Judge vote summary chips */}
                  {hasJudges && (
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : criterion.id)
                      }
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="text-[9px]">
                        {isExpanded ? "\u25BE" : "\u25B8"}
                      </span>
                      <span className="font-mono">
                        {
                          criterion.modelEvaluations!.filter((e) => e.passed)
                            .length
                        }
                        /{criterion.modelEvaluations!.length} judges
                      </span>
                      <span className="flex gap-0.5 ml-0.5">
                        {criterion.modelEvaluations!.map((e) => (
                          <span
                            key={e.model}
                            className={`h-1.5 w-1.5 rounded-full ${
                              e.passed ? "bg-success" : "bg-failure"
                            }`}
                            title={`${e.model}: ${e.passed ? "Pass" : "Fail"}`}
                          />
                        ))}
                      </span>
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {criterion.reason}
                  </p>
                  {/* Expanded judge details */}
                  {hasJudges && isExpanded && (
                    <div className="mt-2 space-y-1.5 border-t border-card-border/50 pt-2">
                      {criterion.modelEvaluations!.map((e) => (
                        <div key={e.model} className="flex items-start gap-2">
                          <span
                            className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                              e.passed ? "bg-success" : "bg-failure"
                            }`}
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-mono font-medium">
                              {e.model}
                            </span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              {e.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
