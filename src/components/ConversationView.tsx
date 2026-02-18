import type { ConversationMessage } from "@/types/scenario";
import { formatTimestamp } from "@/lib/utils";

interface ConversationViewProps {
  messages: ConversationMessage[];
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
