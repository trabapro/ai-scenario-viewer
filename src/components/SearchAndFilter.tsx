import type { FilterStatus, SortField, SortDirection, ChangeFilter } from "@/types/scenario";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  changeFilter: ChangeFilter;
  onChangeFilterChange: (filter: ChangeFilter) => void;
  hasChangeData: boolean;
  changeCounts: { regressed: number; fixed: number; new: number };
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  totalCount: number;
  filteredCount: number;
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  changeFilter,
  onChangeFilterChange,
  hasChangeData,
  changeCounts,
  sortField,
  sortDirection,
  onSortChange,
  totalCount,
  filteredCount,
}: SearchAndFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter scenarios..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-card-border bg-card py-2 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex border border-card-border bg-card">
          {(["all", "passed", "failed"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === status
                  ? status === "passed"
                    ? "bg-success/10 text-success"
                    : status === "failed"
                    ? "bg-failure/10 text-failure"
                    : "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all" ? "All" : status === "passed" ? "Passed" : "Failed"}
            </button>
          ))}
        </div>
      </div>

      {/* Change filter row — only shown when previous run data exists */}
      {hasChangeData && (
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "regressed", "fixed", "new"] as ChangeFilter[]).map((filter) => {
            const active = changeFilter === filter;
            const count = filter === "all" ? null : changeCounts[filter];
            const colorClass =
              filter === "regressed"
                ? active
                  ? "bg-failure/10 text-failure border-failure/20"
                  : "text-muted-foreground hover:text-failure border-card-border"
                : filter === "fixed"
                ? active
                  ? "bg-success/10 text-success border-success/20"
                  : "text-muted-foreground hover:text-success border-card-border"
                : filter === "new"
                ? active
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "text-muted-foreground hover:text-blue-400 border-card-border"
                : active
                ? "bg-muted text-foreground border-card-border"
                : "text-muted-foreground hover:text-foreground border-card-border";

            return (
              <button
                key={filter}
                onClick={() => onChangeFilterChange(filter)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border transition-colors ${colorClass}`}
              >
                {filter === "all" ? "All changes" : filter === "regressed" ? "Regressed" : filter === "fixed" ? "Fixed" : "New"}
                {count !== null && count > 0 && (
                  <span className="font-mono tabular-nums opacity-70">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground tabular-nums">
          {filteredCount} of {totalCount}
        </p>

        {/* Sort controls */}
        <div className="flex items-center gap-1">
          {(["name", "duration", "status", ...(hasChangeData ? ["change" as SortField] : [])] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => onSortChange(field)}
              className={`px-2 py-1 text-xs transition-colors ${
                sortField === field
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {field === "name" ? "Name" : field === "duration" ? "Duration" : field === "status" ? "Status" : "Change"}
              {sortField === field && (
                <span className="ml-0.5">{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
