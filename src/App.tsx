import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScenarioDataProvider } from "@/components/ScenarioDataProvider";
import { BenchmarkDataProvider } from "@/components/BenchmarkDataProvider";
import { AppHeader } from "@/components/AppHeader";
import { HomePage } from "@/pages/HomePage";
import { ScenarioPage } from "@/pages/ScenarioPage";
import { ComparePage } from "@/pages/ComparePage";
import { BenchmarkPage } from "@/pages/BenchmarkPage";
import { BenchmarkScenarioPage } from "@/pages/BenchmarkScenarioPage";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ScenarioDataProvider>
          <BenchmarkDataProvider>
            <div className="min-h-screen bg-background">
              <AppHeader />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/scenario/:scenarioId" element={<ScenarioPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/benchmark" element={<BenchmarkPage />} />
                <Route path="/benchmark/scenario/:scenarioId" element={<BenchmarkScenarioPage />} />
              </Routes>
            </div>
          </BenchmarkDataProvider>
        </ScenarioDataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
