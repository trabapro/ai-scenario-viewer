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
                className={`flex items-baseline gap-2 mb-1 ${
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
                <span className="text-[10px] text-muted-foreground/60 font-mono tabular-nums">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>

              <div
                className={`px-3.5 py-2.5 text-sm leading-relaxed border ${
                  isAgent
                    ? "bg-agent-bg border-agent-border"
                    : "bg-user-bg border-user-border"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
