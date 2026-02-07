import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScenarioDataProvider } from "@/components/ScenarioDataProvider";
import { AppHeader } from "@/components/AppHeader";
import { HomePage } from "@/pages/HomePage";
import { ScenarioPage } from "@/pages/ScenarioPage";
import { ComparePage } from "@/pages/ComparePage";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ScenarioDataProvider>
          <div className="min-h-screen bg-background">
            <AppHeader />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/scenario/:scenarioId" element={<ScenarioPage />} />
              <Route path="/compare" element={<ComparePage />} />
            </Routes>
          </div>
        </ScenarioDataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
