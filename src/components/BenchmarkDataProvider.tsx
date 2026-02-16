import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ScenarioResults } from "@/types/scenario";
import type { ModelResult } from "@/types/benchmark";
import { MODEL_COLORS, modelNameToDisplay } from "@/types/benchmark";

interface BenchmarkDataContextType {
  models: ModelResult[];
  addModel: (name: string, data: ScenarioResults) => void;
  removeModel: (name: string) => void;
  clearAll: () => void;
  setModels: (models: ModelResult[]) => void;
}

const BenchmarkDataContext = createContext<BenchmarkDataContextType>({
  models: [],
  addModel: () => {},
  removeModel: () => {},
  clearAll: () => {},
  setModels: () => {},
});

export function useBenchmarkData() {
  return useContext(BenchmarkDataContext);
}

export function BenchmarkDataProvider({ children }: { children: ReactNode }) {
  const [models, setModelsState] = useState<ModelResult[]>([]);

  const addModel = useCallback((name: string, data: ScenarioResults) => {
    setModelsState((prev) => {
      const existing = prev.filter((m) => m.modelName !== name);
      const colorIndex = existing.length % MODEL_COLORS.length;
      return [
        ...existing,
        {
          modelName: name,
          displayName: modelNameToDisplay(name),
          data,
          color: MODEL_COLORS[colorIndex],
        },
      ];
    });
  }, []);

  const removeModel = useCallback((name: string) => {
    setModelsState((prev) => {
      const filtered = prev.filter((m) => m.modelName !== name);
      return filtered.map((m, i) => ({
        ...m,
        color: MODEL_COLORS[i % MODEL_COLORS.length],
      }));
    });
  }, []);

  const clearAll = useCallback(() => {
    setModelsState([]);
  }, []);

  const setModels = useCallback((newModels: ModelResult[]) => {
    setModelsState(
      newModels.map((m, i) => ({
        ...m,
        color: MODEL_COLORS[i % MODEL_COLORS.length],
      })),
    );
  }, []);

  return (
    <BenchmarkDataContext.Provider
      value={{ models, addModel, removeModel, clearAll, setModels }}
    >
      {children}
    </BenchmarkDataContext.Provider>
  );
}
