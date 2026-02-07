import type { ConversationMessage } from "@/types/scenario";
import { formatTimestamp } from "@/lib/utils";

interface ConversationViewProps {
  messages: ConversationMessage[];
}

export function ConversationView({ messages }: ConversationViewProps) {
  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "agent" ? "justify-start" : "justify-end"
          } animate-fade-in`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div
            className={`max-w-[85%] sm:max-w-[75%] ${
              message.role === "agent" ? "order-1" : "order-1"
            }`}
          >
            {/* Role label */}
            <div
              className={`mb-1 flex items-center gap-1.5 ${
                message.role === "agent" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  message.role === "agent"
                    ? "bg-primary/20 text-primary"
                    : "bg-success/20 text-success"
                }`}
              >
                {message.role === "agent" ? "A" : "U"}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {message.role === "agent" ? "Agent" : "User"}
              </span>
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                message.role === "agent"
                  ? "bg-agent-bubble border-agent-bubble-border rounded-tl-md"
                  : "bg-user-bubble border-user-bubble-border rounded-tr-md"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>

            {/* Timestamp */}
            <div
              className={`mt-1 flex ${
                message.role === "agent" ? "justify-start" : "justify-end"
              }`}
            >
              <span className="text-[10px] text-muted-foreground font-mono">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
