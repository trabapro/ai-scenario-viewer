import { useState } from "react";
import type { ConversationMessage, ToolCall } from "@/types/scenario";
import { formatTimestamp } from "@/lib/utils";

interface ConversationViewProps {
  messages: ConversationMessage[];
}

const TOOL_COLORS: Record<string, string> = {
  search_help_center: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  take_shift_action: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  send_message: "bg-green-500/15 text-green-400 border-green-500/20",
  update_todos: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  create_todos: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  update_checklist_items: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

const DEFAULT_TOOL_COLOR = "bg-gray-500/15 text-gray-400 border-gray-500/20";

function getToolColor(name: string): string {
  return TOOL_COLORS[name] ?? DEFAULT_TOOL_COLOR;
}

function ToolCallCard({ call }: { call: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const colorClasses = getToolColor(call.name);

  return (
    <div className={`border rounded px-2.5 py-1.5 text-[11px] font-mono ${colorClasses}`}>
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[10px] opacity-60">{expanded ? "\u25BC" : "\u25B6"}</span>
        <span className="font-semibold">{call.name}</span>
        <span className="opacity-60">{call.durationMs}ms</span>
        {call.isTerminal && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 opacity-70">terminal</span>
        )}
      </div>
      {expanded && (
        <div className="mt-1.5 space-y-1 text-[10px] opacity-80">
          <div>
            <span className="opacity-60">args: </span>
            <pre className="inline whitespace-pre-wrap break-all">
              {JSON.stringify(call.args, null, 2).slice(0, 500)}
            </pre>
          </div>
          {call.response !== undefined && (
            <div>
              <span className="opacity-60">response: </span>
              <pre className="inline whitespace-pre-wrap break-all">
                {JSON.stringify(call.response, null, 2).slice(0, 500)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToolCallsSection({ toolCalls }: { toolCalls: ToolCall[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[10px] font-mono text-muted-foreground/60 hover:text-muted-foreground/80 transition-colors cursor-pointer"
      >
        {expanded ? "\u25BC" : "\u25B6"} {toolCalls.length} tool call{toolCalls.length !== 1 ? "s" : ""}
        <span className="ml-1.5 opacity-60">
          ({toolCalls.reduce((sum, c) => sum + c.durationMs, 0)}ms total)
        </span>
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          {toolCalls.map((call, i) => (
            <ToolCallCard key={i} call={call} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ConversationView({ messages }: ConversationViewProps) {
  return (
    <div className="space-y-4 p-4 sm:p-5">
      {messages.map((message, index) => {
        const isAgent = message.role === "agent";
        return (
          <div
            key={index}
            className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
          >
            <div className={`max-w-[80%] sm:max-w-[72%]`}>
              <div
                className={`flex items-baseline gap-2 mb-1 flex-wrap ${
                  isAgent ? "justify-start" : "justify-end"
                }`}
              >
                <span
                  className={`text-[11px] font-medium uppercase tracking-wider ${
                    isAgent ? "text-agent" : "text-user"
                  }`}
                >
                  {isAgent ? "Agent" : "User"}
                </span>
                {message.modelMode && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    message.modelMode === "tool_calling"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-cyan-500/10 text-cyan-400"
                  }`}>
                    {message.modelMode === "tool_calling" ? "tools" : "json"}
                  </span>
                )}
                {message.action && message.action !== "NONE" && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {message.action}
                  </span>
                )}
                {message.selectedShiftId && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                    shift:{message.selectedShiftId.slice(0, 8)}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/60 font-mono tabular-nums">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>

              {message.topic && message.topic !== "NONE" && (
                <div className={`mb-1 ${isAgent ? "text-left" : "text-right"}`}>
                  <span className="text-[10px] font-mono text-muted-foreground/50">
                    {message.topic}
                  </span>
                </div>
              )}

              <div
                className={`px-3.5 py-2.5 text-sm leading-relaxed border ${
                  isAgent
                    ? "bg-agent-bg border-agent-border"
                    : "bg-user-bg border-user-border"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>

              {/* Tool Calls */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <ToolCallsSection toolCalls={message.toolCalls} />
              )}

              {/* Todo Updates */}
              {message.todoUpdates && message.todoUpdates.length > 0 && (
                <div className={`mt-1.5 space-y-1 ${isAgent ? "text-left" : "text-right"}`}>
                  {message.todoUpdates.map((todo, i) => (
                    <div key={i} className="text-[10px] font-mono text-muted-foreground/60">
                      <span className="text-purple-400/80">{todo.action}</span>
                      {todo.note && (
                        <span className="ml-1.5 text-muted-foreground/40 truncate inline-block max-w-[250px] align-bottom">
                          {todo.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Item Updates */}
              {message.itemUpdates && message.itemUpdates.length > 0 && (
                <div className={`mt-1.5 ${isAgent ? "text-left" : "text-right"}`}>
                  <div className="inline-flex gap-1.5">
                    {message.itemUpdates.map((item, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          item.result === "YES"
                            ? "bg-success/10 text-success"
                            : "bg-failure/10 text-failure"
                        }`}
                      >
                        item[{item.index}]: {item.result}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
