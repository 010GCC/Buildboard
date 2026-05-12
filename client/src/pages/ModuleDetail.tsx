import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowUpRight, AlertTriangle, GitBranch, Sparkles, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { MODULES, STAGES } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import NotFound from "./not-found";

export default function ModuleDetail() {
  const [, params] = useRoute<{ id: string }>("/modules/:id");
  const id = params?.id;
  const module = MODULES.find((m) => m.id === id);
  const { done, toggle, byModule } = useProgress();
  if (!module) return <NotFound />;

  const stat = byModule[module.id];
  const pct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);

  return (
    <div className="space-y-8" data-testid={`page-module-${module.id}`}>
      <Link
        href="/modules"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
        data-testid="link-back-modules"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All modules
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {module.stages.map((s) => (
            <Badge key={s} variant="outline" className="text-[10px]" data-testid={`badge-stage-${s}`}>
              {STAGES.find((x) => x.id === s)?.short}
            </Badge>
          ))}
        </div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-title">
          {module.title}
        </h1>
        <p className="text-[14px] text-muted-foreground max-w-2xl leading-relaxed" data-testid="text-tagline">
          {module.tagline}
        </p>
        <div className="flex items-center gap-3 pt-1">
          <Progress value={pct} className="h-1.5 max-w-xs flex-1" data-testid="progress-module" />
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground" data-testid="text-progress">
            {stat.done}/{stat.total} · {pct}%
          </span>
        </div>
      </header>

      <Section title="Definition" icon={<Sparkles className="h-4 w-4" />}>
        <p className="text-[14px] leading-relaxed text-foreground/90" data-testid="text-definition">
          {module.definition}
        </p>
      </Section>

      <Section title="Role in the workflow" icon={<GitBranch className="h-4 w-4" />}>
        <p className="text-[14px] leading-relaxed text-foreground/90" data-testid="text-role">
          {module.role}
        </p>
        {module.dependencies.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Depends on</span>
            {module.dependencies.map((dep) => {
              const target = MODULES.find((m) => m.id === dep);
              if (!target) return null;
              return (
                <Link
                  key={dep}
                  href={`/modules/${dep}`}
                  className="text-[12px] rounded-md border border-border px-2 py-0.5 hover-elevate"
                  data-testid={`link-dependency-${dep}`}
                >
                  {target.title}
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Capabilities" icon={<Sparkles className="h-4 w-4" />}>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13.5px]">
          {module.capabilities.map((c, i) => (
            <li key={i} className="flex gap-2" data-testid={`text-capability-${i}`}>
              <span className="text-primary mt-1 text-[10px]">●</span>
              <span className="text-foreground/90 leading-snug">{c}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Implementation checklist" icon={<ListChecks className="h-4 w-4" />}>
        <ul className="space-y-2" data-testid="list-checklist">
          {module.checklist.map((c) => {
            const checked = done.has(c.id);
            return (
              <li
                key={c.id}
                className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2 hover-elevate"
                data-testid={`item-checklist-${c.id}`}
              >
                <Checkbox
                  id={`cb-${c.id}`}
                  checked={checked}
                  onCheckedChange={() => toggle(c.id)}
                  className="mt-0.5"
                  data-testid={`checkbox-step-${c.id}`}
                />
                <label
                  htmlFor={`cb-${c.id}`}
                  className={[
                    "text-[13.5px] leading-snug cursor-pointer",
                    checked ? "line-through text-muted-foreground" : "text-foreground/90",
                  ].join(" ")}
                >
                  {c.label}
                </label>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Risks & non-goals" icon={<AlertTriangle className="h-4 w-4 text-destructive" />}>
        <ul className="space-y-1.5 text-[13.5px]">
          {module.risks.map((r, i) => (
            <li key={i} className="flex gap-2" data-testid={`text-risk-${i}`}>
              <span className="text-destructive mt-1 text-[10px]">▲</span>
              <span className="text-foreground/85 leading-snug">{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Source reference">
        <a
          href={module.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline break-all"
          data-testid="link-source"
        >
          {module.sourceUrl} <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </a>
        <p className="mt-2 text-[12px] text-muted-foreground max-w-2xl leading-relaxed">
          Linked for transparency only. Buildboard does not import, embed, or wrap any third-party SDK.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3" data-testid={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight uppercase text-muted-foreground">
        {icon}
        <span className="tracking-wider">{title}</span>
      </h2>
      <div>{children}</div>
    </section>
  );
}
