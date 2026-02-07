import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { ScenarioResults } from "@/types/scenario";

const STORAGE_KEY_DATA = "ai-scenario-viewer-data";
const STORAGE_KEY_MARKDOWN = "ai-scenario-viewer-markdown";
const STORAGE_KEY_HISTORY = "ai-scenario-viewer-history";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  scenarioCount: number;
  passRate: number;
  filename: string | null;
  storageKey: string;
  loadedAt: string;
}

interface ScenarioDataContextType {
  data: ScenarioResults | null;
  setData: (data: ScenarioResults | null, filename?: string) => void;
  markdown: string | null;
  setMarkdown: (markdown: string | null) => void;
  reset: () => void;
  clearData: () => void;
  history: HistoryEntry[];
  loadFromHistory: (entry: HistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  loadHistoryData: (id: string) => ScenarioResults | null;
  hydrated: boolean;
}

const ScenarioDataContext = createContext<ScenarioDataContextType>({
  data: null,
  setData: () => {},
  markdown: null,
  setMarkdown: () => {},
  reset: () => {},
  clearData: () => {},
  history: [],
  loadFromHistory: () => {},
  removeHistoryEntry: () => {},
  loadHistoryData: () => null,
  hydrated: false,
});

export function useScenarioData() {
  return useContext(ScenarioDataContext);
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage may be full or unavailable
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage may be unavailable
  }
}

function getHistory(): HistoryEntry[] {
  const raw = safeGetItem(STORAGE_KEY_HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(entries));
}

function generateHistoryId(): string {
  return `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ScenarioDataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<ScenarioResults | null>(null);
  const [markdown, setMarkdownState] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate state from localStorage on mount
  useEffect(() => {
    const storedData = safeGetItem(STORAGE_KEY_DATA);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as ScenarioResults;
        setDataState(parsed);
      } catch {
        safeRemoveItem(STORAGE_KEY_DATA);
      }
    }

    const storedMarkdown = safeGetItem(STORAGE_KEY_MARKDOWN);
    if (storedMarkdown) {
      setMarkdownState(storedMarkdown);
    }

    setHistory(getHistory());
    setHydrated(true);
  }, []);

  const setData = useCallback(
    (newData: ScenarioResults | null, filename?: string) => {
      setDataState(newData);

      if (newData) {
        // Persist current data to localStorage
        try {
          safeSetItem(STORAGE_KEY_DATA, JSON.stringify(newData));
        } catch {
          // data too large for localStorage, skip
        }

        // Add to history
        const total = newData.summary?.total ?? newData.results.length;
        const passed = newData.summary?.passed ?? newData.results.filter((r) => r.passed).length;
        const passRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;

        const historyId = generateHistoryId();
        const storageKey = `ai-scenario-viewer-result-${historyId}`;

        const entry: HistoryEntry = {
          id: historyId,
          timestamp: newData.timestamp,
          scenarioCount: total,
          passRate,
          filename: filename ?? null,
          storageKey,
          loadedAt: new Date().toISOString(),
        };

        // Store the full data under its unique key
        try {
          safeSetItem(storageKey, JSON.stringify(newData));
        } catch {
          // data too large, skip history storage but still keep in-memory
        }

        const updatedHistory = [entry, ...getHistory().filter((h) => {
          // Deduplicate by timestamp + scenarioCount
          return !(h.timestamp === entry.timestamp && h.scenarioCount === entry.scenarioCount);
        })].slice(0, 10); // Keep last 10 entries

        saveHistory(updatedHistory);
        setHistory(updatedHistory);
      } else {
        safeRemoveItem(STORAGE_KEY_DATA);
      }
    },
    []
  );

  const setMarkdown = useCallback((newMarkdown: string | null) => {
    setMarkdownState(newMarkdown);
    if (newMarkdown) {
      safeSetItem(STORAGE_KEY_MARKDOWN, newMarkdown);
    } else {
      safeRemoveItem(STORAGE_KEY_MARKDOWN);
    }
  }, []);

  const reset = useCallback(() => {
    setDataState(null);
    setMarkdownState(null);
    safeRemoveItem(STORAGE_KEY_DATA);
    safeRemoveItem(STORAGE_KEY_MARKDOWN);
  }, []);

  const clearData = useCallback(() => {
    setDataState(null);
    setMarkdownState(null);
    safeRemoveItem(STORAGE_KEY_DATA);
    safeRemoveItem(STORAGE_KEY_MARKDOWN);

    // Also clear all history
    const currentHistory = getHistory();
    for (const entry of currentHistory) {
      safeRemoveItem(entry.storageKey);
    }
    safeRemoveItem(STORAGE_KEY_HISTORY);
    setHistory([]);
  }, []);

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    const raw = safeGetItem(entry.storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ScenarioResults;
      setDataState(parsed);
      safeSetItem(STORAGE_KEY_DATA, raw);
    } catch {
      // corrupted entry, ignore
    }
  }, []);

  const removeHistoryEntry = useCallback((id: string) => {
    const currentHistory = getHistory();
    const entry = currentHistory.find((h) => h.id === id);
    if (entry) {
      safeRemoveItem(entry.storageKey);
    }
    const updatedHistory = currentHistory.filter((h) => h.id !== id);
    saveHistory(updatedHistory);
    setHistory(updatedHistory);
  }, []);

  const loadHistoryData = useCallback(
    (id: string): ScenarioResults | null => {
      const currentHistory = getHistory();
      const entry = currentHistory.find((h) => h.id === id);
      if (!entry) return null;
      const raw = safeGetItem(entry.storageKey);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as ScenarioResults;
      } catch {
        return null;
      }
    },
    []
  );

  return (
    <ScenarioDataContext.Provider
      value={{
        data,
        setData,
        markdown,
        setMarkdown,
        reset,
        clearData,
        history,
        loadFromHistory,
        removeHistoryEntry,
        loadHistoryData,
        hydrated,
      }}
    >
      {children}
    </ScenarioDataContext.Provider>
  );
}
