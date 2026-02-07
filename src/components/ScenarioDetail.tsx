import { useNavigate } from "react-router-dom";
import type { ScenarioResult } from "@/types/scenario";
import { formatDuration, scenarioIdToTitle, getUserTurns } from "@/lib/utils";
import { ConversationView } from "./ConversationView";
import { CriteriaTable } from "./CriteriaTable";

interface ScenarioDetailProps {
  scenario: ScenarioResult;
}

export function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const navigate = useNavigate();
  const passedCriteria = scenario.criteria.filter((c) => c.passed).length;
  const totalCriteria = scenario.criteria.length;
  const turns = getUserTurns(scenario.conversation);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {scenarioIdToTitle(scenario.scenarioId)}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              {scenario.scenarioId}
            </p>
          </div>
          <span
            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
              scenario.passed ? "bg-success" : "bg-failure"
            }`}
            title={scenario.passed ? "Passed" : "Failed"}
          />
        </div>

        {/* Metadata - plain text */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>{formatDuration(scenario.duration)}</span>
          <span>{turns} {turns === 1 ? "turn" : "turns"}</span>
          <span>{scenario.conversation.length} messages</span>
          <span className={passedCriteria === totalCriteria ? "text-success" : "text-failure"}>
            {passedCriteria}/{totalCriteria} criteria
          </span>
        </div>
      </div>

      {/* Side-by-side: Conversation + Evaluation */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Conversation */}
        <div className="lg:flex-1 min-w-0 max-w-3xl">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Conversation
          </h3>
          <div className="border border-card-border bg-card">
            <ConversationView messages={scenario.conversation} />
          </div>
        </div>

        {/* Evaluation */}
        <div className="lg:flex-1 min-w-0">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Evaluation
            <span className="ml-2 normal-case tracking-normal font-normal">
              {passedCriteria}/{totalCriteria} passed
            </span>
          </h3>
          <div className="lg:sticky lg:top-20">
            <CriteriaTable criteria={scenario.criteria} />
          </div>
        </div>
      </div>

      {/* Metadata section if present */}
      {scenario.metadata && Object.keys(scenario.metadata).length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Metadata
          </h3>
          <div className="border border-card-border bg-card p-4">
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(scenario.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
