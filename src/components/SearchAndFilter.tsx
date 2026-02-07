import type { FilterStatus, SortField, SortDirection } from "@/types/scenario";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-card py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm2.78-4.22a.75.75 0 01-1.06 0L8 9.06l-1.72 1.72a.75.75 0 11-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 011.06-1.06L8 6.94l1.72-1.72a.75.75 0 111.06 1.06L9.06 8l1.72 1.72a.75.75 0 010 1.06z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex rounded-lg border border-card-border bg-card p-0.5">
          {(["all", "passed", "failed"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                filterStatus === status
                  ? status === "passed"
                    ? "bg-success-bg text-success border border-success-border"
                    : status === "failed"
                    ? "bg-failure-bg text-failure border border-failure-border"
                    : "bg-muted text-foreground border border-transparent"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {status === "all" ? "All" : status === "passed" ? "Passed" : "Failed"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {filteredCount} of {totalCount} scenarios
        </p>

        {/* Sort controls */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Sort by:</span>
          {(["name", "duration", "status"] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => onSortChange(field)}
              className={`flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                sortField === field
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {field === "name" ? "Name" : field === "duration" ? "Duration" : "Status"}
              {sortField === field && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className={`h-3 w-3 transition-transform ${
                    sortDirection === "desc" ? "rotate-180" : ""
                  }`}
                >
                  <path fillRule="evenodd" d="M11.78 9.78a.75.75 0 01-1.06 0L8 7.06 5.28 9.78a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
