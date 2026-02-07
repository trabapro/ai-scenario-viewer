import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type {
  ScenarioResults,
  FilterStatus,
  SortField,
  SortDirection,
} from "@/types/scenario";
import { formatFullTimestamp } from "@/lib/utils";
import { useScenarioData } from "./ScenarioDataProvider";
import { SummaryStats } from "./SummaryStats";
import { SearchAndFilter } from "./SearchAndFilter";
import { ScenarioCard } from "./ScenarioCard";

interface DashboardProps {
  data: ScenarioResults;
  onReset: () => void;
}

export function Dashboard({ data, onReset }: DashboardProps) {
  const { history } = useScenarioData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let results = [...data.results];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter((r) =>
        r.scenarioId.toLowerCase().includes(query)
      );
    }

    if (filterStatus === "passed") {
      results = results.filter((r) => r.passed);
    } else if (filterStatus === "failed") {
      results = results.filter((r) => !r.passed);
    }

    results.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.scenarioId.localeCompare(b.scenarioId);
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "status":
          comparison = Number(b.passed) - Number(a.passed);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return results;
  }, [data.results, searchQuery, filterStatus, sortField, sortDirection]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 animate-fade-in">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {formatFullTimestamp(data.timestamp)}
        </p>
        <div className="flex items-center gap-3">
          {history.length >= 2 && (
            <Link
              to="/compare"
              className="text-xs font-medium text-foreground underline underline-offset-4 decoration-card-border hover:decoration-foreground transition-colors"
            >
              Compare runs
            </Link>
          )}
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            New file
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <SummaryStats summary={data.summary} results={data.results} />

      {/* Search and Filter */}
      <div className="mt-6">
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          totalCount={data.results.length}
          filteredCount={filteredAndSorted.length}
        />
      </div>

      {/* Scenario Grid */}
      <div className="mt-4 grid gap-px sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border border-card-border stagger-children">
        {filteredAndSorted.map((scenario) => (
          <ScenarioCard
            key={scenario.scenarioId}
            scenario={scenario}
          />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <p className="text-sm text-muted-foreground">No scenarios match your filter.</p>
        </div>
      )}
    </div>
  );
}
