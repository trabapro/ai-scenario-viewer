import { useBenchmarkData } from "@/components/BenchmarkDataProvider";
import { BenchmarkUploader } from "@/components/benchmark/BenchmarkUploader";
import { BenchmarkDashboard } from "@/components/benchmark/BenchmarkDashboard";
import type { ScenarioResults } from "@/types/scenario";
import { modelNameToDisplay, MODEL_COLORS } from "@/types/benchmark";

export function BenchmarkPage() {
  const { models, setModels, clearAll } = useBenchmarkData();

  const handleLoad = (
    files: { name: string; data: ScenarioResults }[],
  ) => {
    setModels(
      files.map((f, i) => ({
        modelName: f.name,
        displayName: modelNameToDisplay(f.name),
        data: f.data,
        color: MODEL_COLORS[i % MODEL_COLORS.length],
      })),
    );
  };

  if (models.length === 0) {
    return <BenchmarkUploader onLoad={handleLoad} />;
  }

  return <BenchmarkDashboard models={models} onReset={clearAll} />;
}
