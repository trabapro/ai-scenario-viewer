import { useScenarioData } from "@/components/ScenarioDataProvider";
import { FileDropZone } from "@/components/FileDropZone";
import { Dashboard } from "@/components/Dashboard";

export function HomePage() {
  const {
    data,
    setData,
    setMarkdown,
    reset,
    history,
    loadFromHistory,
    removeHistoryEntry,
    hydrated,
  } = useScenarioData();

  // Avoid flash of FileDropZone before hydration completes
  if (!hydrated) {
    return null;
  }

  return data ? (
    <Dashboard data={data} onReset={reset} />
  ) : (
    <FileDropZone
      onDataLoaded={setData}
      onMarkdownLoaded={setMarkdown}
      history={history}
      onLoadFromHistory={loadFromHistory}
      onRemoveHistoryEntry={removeHistoryEntry}
    />
  );
}
