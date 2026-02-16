import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  const location = useLocation();
  const isBenchmark = location.pathname.startsWith("/benchmark");

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="text-sm font-semibold tracking-tight">Scenario Viewer</span>
          </Link>
          <nav className="flex items-center gap-1 text-xs">
            <Link
              to="/"
              className={`px-2 py-1 transition-colors ${
                !isBenchmark
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single Run
            </Link>
            <Link
              to="/benchmark"
              className={`px-2 py-1 transition-colors ${
                isBenchmark
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Benchmark
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
