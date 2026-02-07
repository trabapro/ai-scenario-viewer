import { useState, useCallback, useRef, type DragEvent, type MouseEvent } from "react";
import type { ScenarioResults } from "@/types/scenario";
import type { HistoryEntry } from "@/components/ScenarioDataProvider";
import { formatFullTimestamp } from "@/lib/utils";

interface FileDropZoneProps {
  onDataLoaded: (data: ScenarioResults, filename?: string) => void;
  onMarkdownLoaded: (markdown: string) => void;
  history: HistoryEntry[];
  onLoadFromHistory: (entry: HistoryEntry) => void;
  onRemoveHistoryEntry: (id: string) => void;
}

export function FileDropZone({
  onDataLoaded,
  onMarkdownLoaded,
  history,
  onLoadFromHistory,
  onRemoveHistoryEntry,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFiles, setLoadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const dragCounter = useRef(0);

  const loadSampleData = useCallback(
    async (e: MouseEvent) => {
      e.stopPropagation();
      setLoadingSample(true);
      try {
        const response = await fetch("/sample-data/latest.json");
        if (!response.ok) throw new Error("Failed to fetch sample data");
        const parsed = (await response.json()) as ScenarioResults;
        onDataLoaded(parsed, "latest.json (sample)");
        setError(null);
      } catch {
        setError("Failed to load sample data.");
      } finally {
        setLoadingSample(false);
      }
    },
    [onDataLoaded]
  );

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          if (file.name.endsWith(".json")) {
            const parsed = JSON.parse(content) as ScenarioResults;
            if (!parsed.results || !Array.isArray(parsed.results)) {
              setError("Invalid JSON format: missing 'results' array");
              return;
            }
            onDataLoaded(parsed, file.name);
            setLoadedFiles((prev) => [...prev, file.name]);
            setError(null);
          } else if (file.name.endsWith(".md")) {
            onMarkdownLoaded(content);
            setLoadedFiles((prev) => [...prev, file.name]);
            setError(null);
          } else {
            setError("Unsupported file type. Please use .json or .md files.");
          }
        } catch {
          setError("Failed to parse file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    },
    [onDataLoaded, onMarkdownLoaded]
  );

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(processFile);
    },
    [processFile]
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-8 w-8 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Scenario Viewer
          </h1>
          <p className="mt-2 text-muted-foreground">
            Drop your test results to get started
          </p>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
            isDragging
              ? "drop-zone-active border-primary bg-primary/5"
              : "border-card-border hover:border-primary/50 hover:bg-card"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.md"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                isDragging
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>

            <div>
              <p className="text-base font-medium">
                {isDragging ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>

            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                .json
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                .md
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-failure-border bg-failure-bg p-3 text-sm text-failure animate-fade-in">
            {error}
          </div>
        )}

        {loadedFiles.length > 0 && (
          <div className="mt-4 animate-fade-in">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Loaded files
            </p>
            <div className="flex flex-wrap gap-2">
              {loadedFiles.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md bg-success-bg border border-success-border px-2.5 py-1 text-xs font-medium text-success"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-card-border w-16" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-card-border w-16" />
          </div>
          <button
            onClick={loadSampleData}
            disabled={loadingSample}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {loadingSample ? (
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path d="M2 3.5A1.5 1.5 0 013.5 2h2.879a1.5 1.5 0 011.06.44l1.122 1.12A1.5 1.5 0 009.62 4H12.5A1.5 1.5 0 0114 5.5v1.401a2.986 2.986 0 00-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5z" />
                <path d="M2 9.5A1.5 1.5 0 013.5 8h9A1.5 1.5 0 0114 9.5v3a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-3z" />
              </svg>
            )}
            Load Sample Data
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Upload a <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">latest.json</code> result file
            or <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">ai-scenario-report.md</code> markdown report
          </p>
        </div>

        {/* Previously Loaded section */}
        {history.length > 0 && (
          <div className="mt-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-card-border" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Previously Loaded
              </span>
              <div className="h-px flex-1 bg-card-border" />
            </div>
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="group/entry flex items-center gap-3 rounded-xl border border-card-border bg-card p-3 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
                >
                  <button
                    onClick={() => onLoadFromHistory(entry)}
                    className="flex flex-1 items-center gap-3 text-left min-w-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v3.5c0 .414.336.75.75.75h2.5a.75.75 0 000-1.5h-1.75v-2.75z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {entry.filename || formatFullTimestamp(entry.timestamp)}
                        </p>
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            entry.passRate >= 100
                              ? "bg-success-bg border border-success-border text-success"
                              : entry.passRate >= 50
                                ? "bg-warning/10 border border-warning/20 text-warning"
                                : "bg-failure-bg border border-failure-border text-failure"
                          }`}
                        >
                          {entry.passRate}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {entry.scenarioCount} scenarios &middot; {formatFullTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistoryEntry(entry.id);
                    }}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-failure-bg hover:text-failure group-hover/entry:opacity-100"
                    title="Remove from history"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5A.75.75 0 019.95 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
