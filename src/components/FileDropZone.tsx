import { useState, useCallback, useRef, type DragEvent } from "react";
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
  const dragCounter = useRef(0);

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
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Scenario Viewer
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Drop a result file to begin
          </p>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative cursor-pointer border border-dashed p-10 text-center transition-all ${
            isDragging
              ? "drop-zone-active border-foreground bg-muted"
              : "border-card-border hover:border-muted-foreground"
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

          <div className="flex flex-col items-center gap-3">
            <p className="text-sm">
              {isDragging ? "Drop here" : "Drag & drop or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              .json or .md
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-failure-border bg-failure-bg p-3 text-sm text-failure animate-fade-in">
            {error}
          </div>
        )}

        {loadedFiles.length > 0 && (
          <div className="mt-4 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {loadedFiles.map((name, i) => (
                <span
                  key={i}
                  className="text-xs text-success"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center">
          <p className="text-center text-xs text-muted-foreground">
            Expects <code className="font-mono text-foreground">latest.json</code> or <code className="font-mono text-foreground">ai-scenario-report.md</code>
          </p>
        </div>

        {/* Previously Loaded section */}
        {history.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <p className="text-xs text-muted-foreground mb-3">
              Previous sessions
            </p>
            <div className="space-y-px border border-card-border divide-y divide-card-border">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="group/entry flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted"
                >
                  <button
                    onClick={() => onLoadFromHistory(entry)}
                    className="flex flex-1 items-center gap-3 text-left min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {entry.filename || formatFullTimestamp(entry.timestamp)}
                        </p>
                        <span
                          className={`shrink-0 text-xs font-mono tabular-nums ${
                            entry.passRate >= 100
                              ? "text-success"
                              : entry.passRate >= 50
                                ? "text-muted-foreground"
                                : "text-failure"
                          }`}
                        >
                          {entry.passRate}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {entry.scenarioCount} scenarios
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHistoryEntry(entry.id);
                    }}
                    className="shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-failure group-hover/entry:opacity-100"
                    title="Remove"
                  >
                    Remove
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
