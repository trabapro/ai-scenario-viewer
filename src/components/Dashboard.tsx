import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type {
  ScenarioResults,
  FilterStatus,
  SortField,
  SortDirection,
  ChangeStatus,
  ChangeFilter,
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

const CHANGE_SORT_ORDER: Record<ChangeStatus, number> = {
  regressed: 0,
  fixed: 1,
  new: 2,
  "stable-fail": 3,
  "stable-pass": 4,
  removed: 5,
  unknown: 6,
};

export function Dashboard({ data, onReset }: DashboardProps) {
  const { history, loadHistoryData } = useScenarioData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>("all");
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

  // Compute change status map by comparing against previous run in history
  const changeMap = useMemo(() => {
    const map = new Map<string, ChangeStatus>();

    // Find the previous run (second entry in history since first is current)
    if (history.length < 2) return map;

    const prevData = loadHistoryData(history[1].id);
    if (!prevData) return map;

    const prevMap = new Map<string, boolean>();
    for (const r of prevData.results) {
      prevMap.set(r.scenarioId, r.passed);
    }

    for (const r of data.results) {
      const prevPassed = prevMap.get(r.scenarioId);
      if (prevPassed === undefined) {
        map.set(r.scenarioId, "new");
      } else if (prevPassed && !r.passed) {
        map.set(r.scenarioId, "regressed");
      } else if (!prevPassed && r.passed) {
        map.set(r.scenarioId, "fixed");
      } else if (r.passed) {
        map.set(r.scenarioId, "stable-pass");
      } else {
        map.set(r.scenarioId, "stable-fail");
      }
    }

    return map;
  }, [data.results, history, loadHistoryData]);

  const hasChangeData = changeMap.size > 0;

  // Count change statuses for filter badges
  const changeCounts = useMemo(() => {
    const counts = { regressed: 0, fixed: 0, new: 0 };
    for (const status of changeMap.values()) {
      if (status === "regressed") counts.regressed++;
      else if (status === "fixed") counts.fixed++;
      else if (status === "new") counts.new++;
    }
    return counts;
  }, [changeMap]);

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

    if (changeFilter !== "all" && hasChangeData) {
      results = results.filter((r) => changeMap.get(r.scenarioId) === changeFilter);
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
        case "change": {
          const aStatus = changeMap.get(a.scenarioId) ?? "unknown";
          const bStatus = changeMap.get(b.scenarioId) ?? "unknown";
          comparison = CHANGE_SORT_ORDER[aStatus] - CHANGE_SORT_ORDER[bStatus];
          break;
        }
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return results;
  }, [data.results, searchQuery, filterStatus, changeFilter, sortField, sortDirection, changeMap, hasChangeData]);

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
          changeFilter={changeFilter}
          onChangeFilterChange={setChangeFilter}
          hasChangeData={hasChangeData}
          changeCounts={changeCounts}
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
            changeStatus={changeMap.get(scenario.scenarioId)}
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
