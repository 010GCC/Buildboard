import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MODULES, STAGES, Stage } from "@/data/modules";
import { useProgress } from "@/lib/progress";

export default function Modules() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "all">("all");
  const { byModule } = useProgress();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MODULES.filter((m) => {
      if (stage !== "all" && !m.stages.includes(stage)) return false;
      if (!query) return true;
      const haystack = [
        m.title,
        m.tagline,
        m.definition,
        m.role,
        ...m.capabilities,
        ...m.risks,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [q, stage]);

  return (
    <div className="space-y-6" data-testid="page-modules">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Modules</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Seven concept modules that compose an AI-assisted build pipeline. Search to filter; click into any module for the full spec.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center" data-testid="filters">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search modules, capabilities, risks…"
            className="pl-8 pr-8 h-9"
            data-testid="input-search-modules"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5" data-testid="filter-stages">
          <FilterChip active={stage === "all"} onClick={() => setStage("all")} testid="filter-stage-all">
            All stages
          </FilterChip>
          {STAGES.map((s) => (
            <FilterChip
              key={s.id}
              active={stage === s.id}
              onClick={() => setStage(s.id)}
              testid={`filter-stage-${s.id}`}
            >
              {s.short}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="text-[12px] text-muted-foreground font-mono" data-testid="text-results-count">
        {filtered.length} of {MODULES.length} modules
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-lg border border-dashed border-border p-8 text-center"
          data-testid="empty-state"
        >
          <p className="text-[13px] text-muted-foreground">No modules match that filter.</p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setStage("all");
            }}
            className="mt-3 text-[12px] text-primary hover:underline"
            data-testid="button-reset-filters"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="list-modules">
          {filtered.map((m) => {
            const stat = byModule[m.id];
            return (
              <li key={m.id}>
                <Link
                  href={`/modules/${m.id}`}
                  className="block h-full rounded-lg border border-card-border bg-card p-4 hover-elevate"
                  data-testid={`card-module-${m.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-semibold tracking-tight" data-testid={`text-module-title-${m.id}`}>
                        {m.title}
                      </h2>
                      <p className="mt-1 text-[12.5px] text-muted-foreground leading-snug">{m.tagline}</p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] tabular-nums">
                      {stat.done}/{stat.total}
                    </Badge>
                  </div>
                  <p className="mt-3 text-[12.5px] text-foreground/85 line-clamp-3">{m.definition}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.stages.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] font-medium" data-testid={`badge-stage-${m.id}-${s}`}>
                        {STAGES.find((x) => x.id === s)?.short}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  testid,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={[
        "text-[12px] px-2.5 py-1 rounded-md border hover-elevate",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground/85 border-border",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
