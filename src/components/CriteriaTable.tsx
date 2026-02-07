import { useState } from "react";
import type { Criterion } from "@/types/scenario";
import { scenarioIdToTitle } from "@/lib/utils";

interface CriteriaTableProps {
  criteria: Criterion[];
}

const REASON_TRUNCATE_LENGTH = 120;

export function CriteriaTable({ criteria }: CriteriaTableProps) {
  const [expandedReasons, setExpandedReasons] = useState<Set<string>>(
    new Set()
  );

  const toggleReason = (id: string) => {
    setExpandedReasons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-card-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Criterion
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reason
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {criteria.map((criterion) => {
            const isLongReason =
              criterion.reason.length > REASON_TRUNCATE_LENGTH;
            const isExpanded = expandedReasons.has(criterion.id);
            const displayReason =
              isLongReason && !isExpanded
                ? criterion.reason.slice(0, REASON_TRUNCATE_LENGTH) + "..."
                : criterion.reason;

            return (
              <tr
                key={criterion.id}
                className={`transition-colors ${
                  criterion.passed
                    ? "hover:bg-success-bg/30"
                    : "bg-failure-bg/20 hover:bg-failure-bg/40"
                }`}
              >
                <td className="px-4 py-3 w-16">
                  {criterion.passed ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-failure/15 text-failure">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8 5.22 9.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">
                      {scenarioIdToTitle(criterion.id)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {criterion.id}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-md">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {displayReason}
                  </p>
                  {isLongReason && (
                    <button
                      onClick={() => toggleReason(criterion.id)}
                      className="mt-1 text-xs font-medium text-primary hover:text-primary-light transition-colors"
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
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
