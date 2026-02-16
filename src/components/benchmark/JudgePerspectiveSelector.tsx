interface JudgePerspectiveSelectorProps {
  judgeModels: string[];
  selected: string | null;
  onChange: (judge: string | null) => void;
}

export function JudgePerspectiveSelector({
  judgeModels,
  selected,
  onChange,
}: JudgePerspectiveSelectorProps) {
  if (judgeModels.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Judge
      </span>
      <div className="flex border border-card-border bg-background">
        <button
          onClick={() => onChange(null)}
          className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
            selected === null
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Majority
        </button>
        {judgeModels.map((judge) => (
          <button
            key={judge}
            onClick={() => onChange(selected === judge ? null : judge)}
            className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
              selected === judge
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {judge}
          </button>
        ))}
      </div>
      {selected && (
        <span className="text-[10px] text-muted-foreground">
          Showing results as if <span className="font-mono">{selected}</span>{" "}
          were the sole evaluator
        </span>
      )}
    </div>
  );
}
