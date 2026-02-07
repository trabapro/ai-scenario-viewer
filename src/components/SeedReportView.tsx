import { useState } from "react";
import type { SeedReport } from "@/types/scenario";
import { formatTimestamp } from "@/lib/utils";

interface SeedReportViewProps {
  report: SeedReport;
}

export function SeedReportView({ report }: SeedReportViewProps) {
  const [open, setOpen] = useState(false);

  const contextEntries = Object.entries(report.seededContext);
  if (contextEntries.length === 0 && report.operations.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-[10px]">{open ? "▾" : "▸"}</span>
        Seed Report
        <span className="normal-case tracking-normal font-normal">
          {report.operations.length} operations
        </span>
      </button>

      {open && (
        <div className="space-y-4">
          {/* Seeded Context */}
          {contextEntries.length > 0 && (
            <div className="border border-card-border bg-card p-4">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Seeded Context
              </h4>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs font-mono">
                {contextEntries.map(([key, value]) => (
                  <div key={key} className="contents">
                    <span className="text-muted-foreground/60">{key}</span>
                    <span className="text-muted-foreground truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operations Timeline */}
          {report.operations.length > 0 && (
            <div className="border border-card-border bg-card p-4">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Operations
              </h4>
              <div className="space-y-2">
                {report.operations.map((op, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-xs font-mono"
                  >
                    <span className="text-muted-foreground/60 tabular-nums shrink-0">
                      {formatTimestamp(op.timestamp)}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {op.operation}
                    </span>
                    <span className="text-muted-foreground/50 truncate">
                      {summarizeInput(op.input)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function summarizeInput(input: Record<string, unknown>): string {
  const entries = Object.entries(input);
  if (entries.length === 0) return "";
  return entries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ");
}
