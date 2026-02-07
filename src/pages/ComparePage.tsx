import { Link } from "react-router-dom";
import { useScenarioData } from "@/components/ScenarioDataProvider";
import { CompareView } from "@/components/CompareView";

export function ComparePage() {
  const { history, loadHistoryData, hydrated } = useScenarioData();

  if (!hydrated) {
    return null;
  }

  if (history.length < 2) {
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Not Enough Runs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You need at least 2 test runs in history to compare. Load more test
            result files to get started.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M12 8a.75.75 0 01-.75.75H5.56l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 1.06L5.56 7.25h5.69A.75.75 0 0112 8z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <CompareView history={history} loadHistoryData={loadHistoryData} />;
}
