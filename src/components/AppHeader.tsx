import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="text-sm font-semibold tracking-tight">Scenario Viewer</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
