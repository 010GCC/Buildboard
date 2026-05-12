import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MODULES, STAGES, STAGE_TO_MODULES } from "@/data/modules";
import { useProgress } from "@/lib/progress";

export default function Workflow() {
  const { done, toggle, byStage, percent, totalDone, total } = useProgress();

  return (
    <div className="space-y-8" data-testid="page-workflow">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Workflow pipeline</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground leading-relaxed">
          The full sequence from raw user intent to a deployed Project. Tick each implementation
          step as your team confirms it. Progress is held in React state only and resets on reload.
        </p>
        <div className="mt-4 flex items-center gap-3" data-testid="readiness-overall">
          <Progress value={percent} className="h-1.5 max-w-md flex-1" />
          <span
            className="text-[12px] font-mono tabular-nums text-muted-foreground"
            data-testid="text-readiness-score"
          >
            {totalDone}/{total} steps · {percent}%
          </span>
        </div>
      </header>

      {/* Horizontal pipeline map */}
      <div className="rounded-lg border border-card-border bg-card p-4 overflow-x-auto" data-testid="pipeline-map">
        <ol className="flex items-stretch gap-2 min-w-[760px]">
          {STAGES.map((s, i) => {
            const stat = byStage[s.id];
            const pct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
            return (
              <li key={s.id} className="flex-1 min-w-[120px]" data-testid={`pipeline-stage-${s.id}`}>
                <div className="rounded-md border border-border bg-background p-3 h-full">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1 text-[12.5px] font-semibold tracking-tight">{s.title}</div>
                  <Progress value={pct} className="mt-2 h-1" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Per-stage details */}
      <div className="space-y-5" data-testid="stage-sections">
        {STAGES.map((s, i) => {
          const moduleIds = STAGE_TO_MODULES[s.id];
          const stat = byStage[s.id];
          const pct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
          return (
            <section
              key={s.id}
              className="rounded-lg border border-card-border bg-card p-5"
              data-testid={`section-stage-${s.id}`}
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-[15px] font-semibold tracking-tight">{s.title}</h2>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                  {stat.done}/{stat.total} · {pct}%
                </span>
              </header>
              <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl leading-relaxed">
                {s.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5" data-testid={`modules-in-stage-${s.id}`}>
                {moduleIds.map((mid) => {
                  const m = MODULES.find((x) => x.id === mid)!;
                  return (
                    <Link
                      key={mid}
                      href={`/modules/${mid}`}
                      className="text-[11px] font-medium rounded-md border border-border bg-background px-2 py-0.5 hover-elevate"
                      data-testid={`chip-module-${mid}-in-${s.id}`}
                    >
                      {m.title}
                    </Link>
                  );
                })}
              </div>

              <ul className="mt-4 space-y-1.5" data-testid={`checklist-stage-${s.id}`}>
                {moduleIds.flatMap((mid) => {
                  const m = MODULES.find((x) => x.id === mid)!;
                  return m.checklist.map((c) => {
                    const checked = done.has(c.id);
                    return (
                      <li
                        key={`${s.id}-${c.id}`}
                        className="flex items-start gap-3 rounded-md border border-border bg-background px-3 py-2"
                        data-testid={`item-step-${s.id}-${c.id}`}
                      >
                        <Checkbox
                          id={`wf-${s.id}-${c.id}`}
                          checked={checked}
                          onCheckedChange={() => toggle(c.id)}
                          className="mt-0.5"
                          data-testid={`checkbox-step-${s.id}-${c.id}`}
                        />
                        <label htmlFor={`wf-${s.id}-${c.id}`} className="flex-1 cursor-pointer">
                          <span
                            className={[
                              "block text-[13px] leading-snug",
                              checked ? "line-through text-muted-foreground" : "text-foreground/90",
                            ].join(" ")}
                          >
                            {c.label}
                          </span>
                          <Badge variant="outline" className="mt-1 text-[10px] font-normal">
                            {m.title}
                          </Badge>
                        </label>
                      </li>
                    );
                  });
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
