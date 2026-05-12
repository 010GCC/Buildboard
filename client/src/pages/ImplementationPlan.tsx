import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Download, FileText, FolderOpen, Save, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MODULES, STAGES, STAGE_TO_MODULES } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedPlan } from "@shared/schema";

function buildPlanMarkdown(done: Set<string>, totalDone: number, total: number, percent: number) {
  const lines: string[] = [
    "# Buildboard Implementation Plan",
    "",
    `Readiness: ${totalDone}/${total} checklist items complete (${percent}%).`,
    "",
    "## Delivery sequence",
    "",
  ];

  for (const [index, stage] of STAGES.entries()) {
    const moduleIds = STAGE_TO_MODULES[stage.id];
    lines.push(`### ${index + 1}. ${stage.title}`);
    lines.push("");
    lines.push(stage.description);
    lines.push("");
    lines.push(`Modules: ${moduleIds.map((id) => MODULES.find((m) => m.id === id)?.title).filter(Boolean).join(", ")}`);
    lines.push("");
    for (const moduleId of moduleIds) {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) continue;
      lines.push(`#### ${mod.title}`);
      for (const item of mod.checklist) {
        lines.push(`- [${done.has(item.id) ? "x" : " "}] ${item.label}`);
      }
      lines.push("");
    }
  }

  lines.push("## Dependency summary");
  lines.push("");
  for (const mod of MODULES) {
    const upstream = mod.dependencies.length
      ? mod.dependencies.map((id) => MODULES.find((m) => m.id === id)?.title).filter(Boolean).join(", ")
      : "None";
    lines.push(`- ${mod.title}: depends on ${upstream}.`);
  }
  lines.push("");
  lines.push("## Independence guardrails");
  lines.push("");
  lines.push("- Keep the platform vendor-neutral.");
  lines.push("- Avoid runtime dependencies on third-party build environments.");
  lines.push("- Keep external services modeled through configuration boundaries.");
  lines.push("- Keep transient UI state in memory unless a backend persistence layer is deliberately added.");

  return lines.join("\n");
}

export default function ImplementationPlan() {
  const { done, setDoneItems, percent, totalDone, total, byStage } = useProgress();
  const [copied, setCopied] = useState(false);
  const [planName, setPlanName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const plan = useMemo(() => buildPlanMarkdown(done, totalDone, total, percent), [done, totalDone, total, percent]);
  const doneIds = useMemo(() => Array.from(done).sort(), [done]);

  const { data: savedPlans = [], isLoading: plansLoading } = useQuery<SavedPlan[]>({
    queryKey: ["/api/plans"],
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/plans", {
        name: planName.trim(),
        checklistJson: JSON.stringify(doneIds),
        markdown: plan,
      });
      return response.json() as Promise<SavedPlan>;
    },
    onSuccess: async (saved) => {
      setPlanName("");
      setStatusMessage(`Saved "${saved.name}".`);
      await queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
    },
    onError: (error: Error) => {
      setStatusMessage(error.message || "Could not save plan.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/plans/${id}`);
    },
    onSuccess: async () => {
      setStatusMessage("Saved plan deleted.");
      await queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
    },
    onError: (error: Error) => {
      setStatusMessage(error.message || "Could not delete plan.");
    },
  });

  function saveCurrentPlan() {
    if (!planName.trim()) {
      setStatusMessage("Add a plan name before saving.");
      return;
    }
    saveMutation.mutate();
  }

  function loadSavedPlan(saved: SavedPlan) {
    try {
      const ids = JSON.parse(saved.checklistJson);
      if (!Array.isArray(ids)) throw new Error("Saved checklist is malformed.");
      setDoneItems(ids.filter((id): id is string => typeof id === "string"));
      setStatusMessage(`Loaded "${saved.name}".`);
    } catch {
      setStatusMessage(`Could not load "${saved.name}".`);
    }
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(plan);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function downloadPlan() {
    const blob = new Blob([plan], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "buildboard-implementation-plan.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6" data-testid="page-plan">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Exportable implementation plan</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground leading-relaxed">
            Generate a Markdown plan from the live module checklist. Checked items in Workflow and
            Module Detail are reflected here before export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyPlan} data-testid="button-copy-plan" className="gap-2">
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Markdown"}
          </Button>
          <Button size="sm" onClick={downloadPlan} data-testid="button-download-plan" className="gap-2">
            <Download className="h-4 w-4" />
            Download .md
          </Button>
        </div>
      </header>

      {statusMessage ? (
        <div
          className="rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground"
          data-testid="status-plan-save"
        >
          {statusMessage}
        </div>
      ) : null}

      <section className="grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-5">
        <aside className="space-y-4">
          <div className="rounded-lg border border-card-border bg-card p-4" data-testid="card-save-plan">
            <div className="flex items-center gap-2 text-primary">
              <Save className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider font-medium">Named plan</span>
            </div>
            <label htmlFor="plan-name" className="mt-3 block text-[12px] font-medium text-foreground/90">
              Save current checklist as
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id="plan-name"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                placeholder="Pilot rollout"
                data-testid="input-plan-name"
                maxLength={80}
              />
              <Button
                type="button"
                onClick={saveCurrentPlan}
                disabled={saveMutation.isPending}
                data-testid="button-save-named-plan"
              >
                Save
              </Button>
            </div>
            <p className="mt-2 text-[11.5px] text-muted-foreground">
              Saved plans store the checklist snapshot and generated Markdown on the app backend.
            </p>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-4" data-testid="card-saved-plans">
            <div className="flex items-center gap-2 text-primary">
              <FolderOpen className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider font-medium">Saved plans</span>
            </div>
            <div className="mt-3 space-y-2" data-testid="list-saved-plans">
              {plansLoading ? (
                <p className="text-[12px] text-muted-foreground">Loading saved plans…</p>
              ) : savedPlans.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No named plans saved yet.</p>
              ) : (
                savedPlans.map((saved) => {
                  const completed = JSON.parse(saved.checklistJson || "[]").length;
                  return (
                    <div
                      key={saved.id}
                      className="rounded-md border border-border bg-background p-3"
                      data-testid={`card-saved-plan-${saved.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[13px] font-semibold tracking-tight" data-testid={`text-saved-plan-name-${saved.id}`}>
                            {saved.name}
                          </h3>
                          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                            {completed}/{total} items · {new Date(saved.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => loadSavedPlan(saved)}
                            data-testid={`button-load-plan-${saved.id}`}
                          >
                            Load
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(saved.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-plan-${saved.id}`}
                            aria-label={`Delete ${saved.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-4" data-testid="card-export-summary">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider font-medium">Export summary</span>
            </div>
            <div className="mt-3 text-[28px] font-semibold tracking-tight tabular-nums" data-testid="text-plan-readiness">
              {percent}%
            </div>
            <p className="text-[12px] text-muted-foreground">
              {totalDone}/{total} items included as complete.
            </p>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-4" data-testid="card-stage-readiness">
            <h2 className="text-[13px] font-semibold tracking-tight">Stage readiness</h2>
            <div className="mt-3 space-y-2">
              {STAGES.map((stage) => {
                const stat = byStage[stage.id];
                const stagePercent = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
                return (
                  <div key={stage.id} className="flex items-center justify-between gap-3" data-testid={`row-plan-stage-${stage.id}`}>
                    <span className="text-[12px] text-foreground/90">{stage.title}</span>
                    <Badge variant="outline" className="font-mono text-[10px] tabular-nums">
                      {stagePercent}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <article className="rounded-lg border border-card-border bg-card overflow-hidden" data-testid="panel-plan-preview">
          <header className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-3">
            <h2 className="text-[13px] font-semibold tracking-tight">Markdown preview</h2>
            <Badge variant="secondary" className="font-mono text-[10px]">
              buildboard-implementation-plan.md
            </Badge>
          </header>
          <pre
            className="max-h-[68vh] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[12px] leading-relaxed text-foreground/90"
            data-testid="text-plan-preview"
          >
            {plan}
          </pre>
        </article>
      </section>
    </div>
  );
}
