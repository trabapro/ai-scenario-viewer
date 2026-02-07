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
          <h2 className="text-xl font-semibold tracking-tight">No Data Loaded</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Load a test results file before viewing scenario details.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm underline underline-offset-4 decoration-card-border hover:decoration-foreground transition-colors"
          >
            &larr; Go to Dashboard
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
          <h2 className="text-xl font-semibold tracking-tight">Scenario Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not find a scenario with ID{" "}
            <code className="bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              {decodedId}
            </code>
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm underline underline-offset-4 decoration-card-border hover:decoration-foreground transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const seedReport = data.seedReports?.find((r) => r.scenarioId === decodedId);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
      <ScenarioDetail scenario={scenario} seedReport={seedReport} />
    </div>
  );
}
