import { useState } from "react";
import type { WebSocketEvent } from "@/types/scenario";
import { formatTimestamp } from "@/lib/utils";

interface WebSocketEventsViewProps {
  events: WebSocketEvent[];
}

export function WebSocketEventsView({ events }: WebSocketEventsViewProps) {
  const [open, setOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  if (events.length === 0) return null;

  const toggleRow = (i: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-[10px]">{open ? "\u25BE" : "\u25B8"}</span>
        WebSocket Events
        <span className="normal-case tracking-normal font-normal">
          {events.length} events
        </span>
      </button>

      {open && (
        <div className="border border-card-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-card-border text-left text-muted-foreground/60">
                <th className="px-3 py-2 font-medium">Direction</th>
                <th className="px-3 py-2 font-medium">Timestamp</th>
                <th className="px-3 py-2 font-medium">Type / Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, i) => (
                <>
                  <tr
                    key={i}
                    onClick={() => toggleRow(i)}
                    className="border-b border-card-border last:border-0 hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-3 py-2 font-mono">
                      <span
                        className={
                          event.direction === "inbound"
                            ? "text-success"
                            : "text-blue-400"
                        }
                      >
                        {event.direction === "inbound" ? "\u2193 in" : "\u2191 out"}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground/60 tabular-nums">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {payloadSummary(event.payload)}
                      <span className="ml-2 text-muted-foreground/30">
                        {expandedRows.has(i) ? "\u25BE" : "\u25B8"}
                      </span>
                    </td>
                  </tr>
                  {expandedRows.has(i) && (
                    <tr key={`${i}-detail`} className="border-b border-card-border last:border-0">
                      <td colSpan={3} className="px-3 py-2 bg-muted/20">
                        <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function payloadSummary(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  if (payload.type) parts.push(String(payload.type));
  if (payload.action && payload.action !== "NONE") parts.push(String(payload.action));
  if (payload.topic && payload.topic !== "NONE") parts.push(String(payload.topic));
  if (parts.length > 0) return parts.join(" \u00B7 ");
  return Object.keys(payload).slice(0, 3).join(", ");
}
