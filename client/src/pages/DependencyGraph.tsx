import { useMemo, useState } from "react";
import { ArrowRight, GitBranch, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MODULES, STAGES } from "@/data/modules";

type Position = { x: number; y: number };

const POSITIONS: Record<string, Position> = {
  workspaces: { x: 12, y: 20 },
  agent: { x: 38, y: 16 },
  editor: { x: 62, y: 22 },
  canvas: { x: 84, y: 34 },
  projects: { x: 42, y: 66 },
  storage: { x: 68, y: 74 },
  integrations: { x: 88, y: 70 },
};

function GraphLine({
  from,
  to,
  active,
}: {
  from: Position;
  to: Position;
  active: boolean;
}) {
  return (
    <g data-testid={`edge-${from.x}-${from.y}-${to.x}-${to.y}`}>
      <line
        x1={`${from.x}%`}
        y1={`${from.y}%`}
        x2={`${to.x}%`}
        y2={`${to.y}%`}
        className={active ? "stroke-primary" : "stroke-border"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
      <circle
        cx={`${to.x}%`}
        cy={`${to.y}%`}
        r={active ? 4 : 3}
        className={active ? "fill-primary" : "fill-muted-foreground/40"}
      />
    </g>
  );
}

export default function DependencyGraph() {
  const [selectedId, setSelectedId] = useState("agent");
  const selected = MODULES.find((m) => m.id === selectedId) ?? MODULES[0];

  const dependents = useMemo(
    () => MODULES.filter((m) => m.dependencies.includes(selected.id)),
    [selected.id],
  );

  const edges = useMemo(
    () =>
      MODULES.flatMap((m) =>
        m.dependencies.map((dependencyId) => ({
          from: dependencyId,
          to: m.id,
          active: dependencyId === selected.id || m.id === selected.id,
        })),
      ),
    [selected.id],
  );

  const connectedIds = new Set([
    selected.id,
    ...selected.dependencies,
    ...dependents.map((m) => m.id),
  ]);

  return (
    <div className="space-y-6" data-testid="page-dependencies">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Dependency graph</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground leading-relaxed">
          Explore how each module depends on the others. Click a node to highlight its upstream
          requirements, downstream dependents, and stage coverage.
        </p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr,320px] gap-5">
        <div
          className="rounded-lg border border-card-border bg-card overflow-x-auto overflow-y-hidden"
          data-testid="graph-canvas"
        >
          <div className="relative min-h-[520px] min-w-[720px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:24px_24px] opacity-50" />
            <svg className="absolute inset-0 h-full w-full" aria-hidden>
              {edges.map((edge) => (
                <GraphLine
                  key={`${edge.from}-${edge.to}`}
                  from={POSITIONS[edge.from]}
                  to={POSITIONS[edge.to]}
                  active={edge.active}
                />
              ))}
            </svg>

            {MODULES.map((m) => {
              const p = POSITIONS[m.id];
              const selectedNode = m.id === selected.id;
              const connected = connectedIds.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={[
                    "absolute w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-3 text-left shadow-sm transition-all",
                    selectedNode
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.03]"
                      : connected
                        ? "border-primary/50 bg-background"
                        : "border-border bg-background/85 opacity-65 hover:opacity-100",
                  ].join(" ")}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  data-testid={`button-node-${m.id}`}
                  aria-pressed={selectedNode}
                >
                  <span className="block text-[13px] font-semibold tracking-tight">{m.title}</span>
                  <span className={selectedNode ? "mt-1 block text-[11px] text-primary-foreground/80" : "mt-1 block text-[11px] text-muted-foreground"}>
                    {m.dependencies.length} upstream · {MODULES.filter((x) => x.dependencies.includes(m.id)).length} downstream
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-card-border bg-card p-5 space-y-5" data-testid="panel-graph-detail">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <GitBranch className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider font-medium">Selected module</span>
            </div>
            <h2 className="mt-2 text-[18px] font-semibold tracking-tight" data-testid="text-selected-module">
              {selected.title}
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
              {selected.tagline}
            </p>
          </div>

          <div>
            <h3 className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">Upstream dependencies</h3>
            <div className="mt-2 space-y-2" data-testid="list-upstream-dependencies">
              {selected.dependencies.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">No upstream module dependencies.</p>
              ) : (
                selected.dependencies.map((id) => {
                  const m = MODULES.find((x) => x.id === id)!;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left hover-elevate"
                      data-testid={`button-upstream-${id}`}
                    >
                      <span className="text-[13px]">{m.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">Downstream dependents</h3>
            <div className="mt-2 space-y-2" data-testid="list-downstream-dependents">
              {dependents.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">No downstream modules depend on this yet.</p>
              ) : (
                dependents.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left hover-elevate"
                    data-testid={`button-downstream-${m.id}`}
                  >
                    <span className="text-[13px]">{m.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground font-medium">
              <Layers3 className="h-3.5 w-3.5" />
              Stage coverage
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5" data-testid="list-selected-stages">
              {selected.stages.map((stageId) => (
                <Badge key={stageId} variant="outline" className="text-[10px]">
                  {STAGES.find((s) => s.id === stageId)?.short}
                </Badge>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
