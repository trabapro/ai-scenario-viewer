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

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter((r) =>
        r.scenarioId.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus === "passed") {
      results = results.filter((r) => r.passed);
    } else if (filterStatus === "failed") {
      results = results.filter((r) => !r.passed);
    }

    // Sort
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
      {/* Timestamp */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Test run: {formatFullTimestamp(data.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {history.length >= 2 && (
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M1 8.5a.5.5 0 01.5-.5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5z" />
                <path d="M8 3a.5.5 0 01.5.5v9a.5.5 0 01-1 0v-9A.5.5 0 018 3z" />
                <path fillRule="evenodd" d="M13.5 2h-11a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5zm-11-1A1.5 1.5 0 001 2.5v11A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0013.5 1h-11z" clipRule="evenodd" />
              </svg>
              Compare Runs
            </Link>
          )}
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M8 1a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 018 1zM4.11 3.05a.75.75 0 010 1.06 5.5 5.5 0 107.78 0 .75.75 0 011.06-1.06 7 7 0 11-9.9 0 .75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
            Load New File
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
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {filteredAndSorted.map((scenario) => (
          <ScenarioCard
            key={scenario.scenarioId}
            scenario={scenario}
          />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium">No scenarios found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
