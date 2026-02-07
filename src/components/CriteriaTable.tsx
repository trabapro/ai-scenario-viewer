import type { Criterion } from "@/types/scenario";
import { scenarioIdToTitle } from "@/lib/utils";

interface CriteriaTableProps {
  criteria: Criterion[];
}

export function CriteriaTable({ criteria }: CriteriaTableProps) {
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
          {criteria.map((criterion) => (
            <tr
              key={criterion.id}
              className={`transition-colors ${
                criterion.passed
                  ? "bg-success-bg/40 hover:bg-success-bg/70"
                  : "bg-failure-bg/40 hover:bg-failure-bg/70"
              }`}
            >
              <td
                className="py-3 pl-4 pr-2 w-12"
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
              <td className="px-4 py-3">
                <p className="font-medium text-sm">
                  {scenarioIdToTitle(criterion.id)}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {criterion.id}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {criterion.reason}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
