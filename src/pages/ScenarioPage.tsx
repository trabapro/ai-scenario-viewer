import { Link, useParams } from "react-router-dom";
import { useScenarioData } from "@/components/ScenarioDataProvider";
import { ScenarioDetail } from "@/components/ScenarioDetail";

export function ScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { data, hydrated } = useScenarioData();
  const decodedId = decodeURIComponent(scenarioId ?? "");

  // Wait for localStorage hydration before deciding if data exists
  if (!hydrated) {
    return null;
  }

  // No data loaded -- direct navigation without loading data first
  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-8 w-8 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m-1.5-3h6m-9-6.75H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">No Data Loaded</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to load a test results file before viewing scenario details.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M12 8a.75.75 0 01-.75.75H5.56l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 1.06L5.56 7.25h5.69A.75.75 0 0112 8z" clipRule="evenodd" />
            </svg>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Data loaded but scenario not found
  const scenario = data.results.find((r) => r.scenarioId === decodedId);

  if (!scenario) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-failure-bg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-8 w-8 text-failure"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Scenario Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not find a scenario with ID{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              {decodedId}
            </code>
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M12 8a.75.75 0 01-.75.75H5.56l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 1.06L5.56 7.25h5.69A.75.75 0 0112 8z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <ScenarioDetail scenario={scenario} />
    </div>
  );
}
