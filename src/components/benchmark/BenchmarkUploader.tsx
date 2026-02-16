import { useState, useCallback, useRef, type DragEvent } from "react";
import type { ScenarioResults } from "@/types/scenario";
import { modelNameToDisplay } from "@/types/benchmark";

interface UploadedFile {
  name: string;
  displayName: string;
  data: ScenarioResults;
  filename: string;
}

interface BenchmarkUploaderProps {
  onLoad: (files: { name: string; data: ScenarioResults }[]) => void;
}

function detectModelName(filename: string): string {
  const base = filename
    .replace(/\.json$/i, "")
    .replace(/^latest[_-]?/i, "")
    .replace(/[_-]?latest$/i, "");
  if (base.length > 0 && base !== filename.replace(/\.json$/i, "")) {
    return base.toLowerCase().replace(/[_ ]/g, "-");
  }
  return filename.replace(/\.json$/i, "").toLowerCase().replace(/[_ ]/g, "-");
}

export function BenchmarkUploader({ onLoad }: BenchmarkUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json")) {
      setError("Only .json files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsed = JSON.parse(content) as ScenarioResults;
        if (!parsed.results || !Array.isArray(parsed.results)) {
          setError(`${file.name}: Invalid format — missing 'results' array`);
          return;
        }
        const name = detectModelName(file.name);
        setFiles((prev) => {
          const filtered = prev.filter((f) => f.name !== name);
          return [
            ...filtered,
            {
              name,
              displayName: modelNameToDisplay(name),
              data: parsed,
              filename: file.name,
            },
          ];
        });
        setError(null);
      } catch {
        setError(`${file.name}: Failed to parse JSON`);
      }
    };
    reader.readAsText(file);
  }, []);

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
    if (dragCounter.current === 0) setIsDragging(false);
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
      Array.from(e.dataTransfer.files).forEach(processFile);
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Array.from(e.target.files || []).forEach(processFile);
    },
    [processFile],
  );

  const updateName = useCallback((oldName: string, newName: string) => {
    const cleaned = newName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-");
    setFiles((prev) =>
      prev.map((f) =>
        f.name === oldName
          ? {
              ...f,
              name: cleaned,
              displayName: modelNameToDisplay(cleaned),
            }
          : f,
      ),
    );
  }, []);

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const handleLoadDashboard = () => {
    if (files.length === 0) return;
    onLoad(files.map((f) => ({ name: f.name, data: f.data })));
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Model Benchmark
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Drop multiple model result files to compare
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
            accept=".json"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm">
              {isDragging
                ? "Drop files here"
                : "Drag & drop JSON files or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              One file per model — filename becomes model name
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-failure-border bg-failure-bg p-3 text-sm text-failure animate-fade-in">
            {error}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                {files.length} model{files.length !== 1 ? "s" : ""} loaded
              </p>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-muted-foreground hover:text-failure transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="border border-card-border divide-y divide-card-border">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 bg-card px-4 py-3"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={file.name}
                      onChange={(e) => updateName(file.name, e.target.value)}
                      className="w-full bg-transparent text-sm font-medium font-mono focus:outline-none focus:ring-1 focus:ring-ring px-1 -mx-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {file.filename} — {file.data.results.length} scenarios
                      {file.data.summary?.passed !== undefined && (
                        <span>
                          {" "}
                          — {file.data.summary.passed}/{file.data.summary.total}{" "}
                          passed
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-xs text-muted-foreground hover:text-failure transition-colors shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleLoadDashboard}
              className="mt-6 w-full bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-colors"
            >
              View Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
