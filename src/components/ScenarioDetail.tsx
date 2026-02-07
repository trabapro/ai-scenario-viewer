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
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M12 8a.75.75 0 01-.75.75H5.56l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 1.06L5.56 7.25h5.69A.75.75 0 0112 8z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {scenarioIdToTitle(scenario.scenarioId)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              {scenario.scenarioId}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium shrink-0 ${
              scenario.passed
                ? "bg-success-bg border border-success-border text-success"
                : "bg-failure-bg border border-failure-border text-failure"
            }`}
          >
            {scenario.passed ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8 5.22 9.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z" clipRule="evenodd" />
              </svg>
            )}
            {scenario.passed ? "Passed" : "Failed"}
          </span>
        </div>

        {/* Metadata pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          <MetadataPill
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v3.5c0 .414.336.75.75.75h2.5a.75.75 0 000-1.5h-1.75v-2.75z" clipRule="evenodd" />
              </svg>
            }
            label="Duration"
            value={formatDuration(scenario.duration)}
          />
          <MetadataPill
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M1 8.74c0 .983.713 1.825 1.69 1.943.764.092 1.534.164 2.31.216v2.351a.75.75 0 001.28.53l2.51-2.51c.182-.181.427-.29.684-.308A40.94 40.94 0 0012 10.97c.977-.118 1.69-.96 1.69-1.942V4.231c0-.983-.713-1.825-1.69-1.943A40.626 40.626 0 008 2a40.626 40.626 0 00-4 .288C2.713 2.406 2 3.248 2 4.23v4.51H1z" />
              </svg>
            }
            label="Turns"
            value={turns.toString()}
          />
          <MetadataPill
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
              </svg>
            }
            label="Criteria"
            value={`${passedCriteria}/${totalCriteria}`}
          />
          <MetadataPill
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v.701a2.5 2.5 0 01-.49 1.49l-3.26 4.34a1 1 0 00-.2.6v2.619a1 1 0 01-.553.894l-2 1A1 1 0 016 14.25V10.64a1 1 0 00-.2-.6L2.49 5.69A2.5 2.5 0 012 4.2V3.5z" />
              </svg>
            }
            label="Messages"
            value={scenario.conversation.length.toString()}
          />
        </div>
      </div>

      {/* Conversation */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-muted-foreground">
            <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 015 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914z" />
            <path d="M14 6c.762 0 1.52.02 2.271.062C17.226 6.175 18 7.049 18 8.068v2.652c0 1.02-.774 1.893-1.73 2.006-.324.038-.65.071-.98.1v2.424a.75.75 0 01-1.28.53l-2.227-2.226A42.18 42.18 0 0110 13.5c-.762 0-1.52-.02-2.271-.062C6.775 13.325 6 12.45 6 11.432V8.068c0-1.02.774-1.893 1.73-2.006A41.141 41.141 0 0114 6z" />
          </svg>
          Conversation
        </h3>
        <div className="rounded-xl border border-card-border bg-card p-4 sm:p-6">
          <ConversationView messages={scenario.conversation} />
        </div>
      </div>

      {/* Criteria */}
      <div>
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-muted-foreground">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Evaluation Criteria
          <span className="text-sm font-normal text-muted-foreground">
            ({passedCriteria}/{totalCriteria} passed)
          </span>
        </h3>
        <CriteriaTable criteria={scenario.criteria} />
      </div>

      {/* Metadata section if present */}
      {scenario.metadata && Object.keys(scenario.metadata).length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-muted-foreground">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            Metadata
          </h3>
          <div className="rounded-xl border border-card-border bg-card p-4">
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(scenario.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function MetadataPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
