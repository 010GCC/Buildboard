import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Compass, Gauge, Layers, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MODULES, STAGES } from "@/data/modules";
import { useProgress } from "@/lib/progress";

export default function Dashboard() {
  const { percent, totalDone, total, byStage, byModule } = useProgress();

  return (
    <div className="space-y-10" data-testid="page-dashboard">
      {/* Hero */}
      <section className="relative">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          AI Build Operations Platform
        </div>
        <h1 className="mt-3 text-xl sm:text-[28px] leading-tight font-semibold tracking-tight" data-testid="text-hero-title">
          A vendor-neutral map of how AI-assisted teams ship software.
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground" data-testid="text-hero-description">
          Buildboard organizes seven core modules — Agent, Workspaces, Project Editor, Design Canvas,
          Projects, Storage, and Integrations — into a single planning surface with checklists, a
          readiness score, and an end-to-end pipeline view. No third-party SDKs. No lock-in.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium px-3.5 py-2 hover-elevate active-elevate-2"
            data-testid="button-browse-modules"
          >
            Browse modules <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/workflow"
            className="inline-flex items-center gap-1.5 rounded-md border border-border text-[13px] font-medium px-3.5 py-2 hover-elevate"
            data-testid="button-open-workflow"
          >
            Open workflow
          </Link>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="section-kpis">
        <KpiCard label="Readiness score" value={`${percent}%`} foot={`${totalDone}/${total} steps confirmed`} icon={<Gauge className="h-4 w-4" />} testid="kpi-readiness">
          <Progress value={percent} className="mt-3 h-1.5" data-testid="progress-readiness" />
        </KpiCard>
        <KpiCard label="Modules covered" value={`${MODULES.length}`} foot="Agent · Workspaces · Editor · Canvas · Projects · Storage · Integrations" icon={<Layers className="h-4 w-4" />} testid="kpi-modules" />
        <KpiCard label="Pipeline stages" value={`${STAGES.length}`} foot="Capture intent → Deploy handoff" icon={<Compass className="h-4 w-4" />} testid="kpi-stages" />
      </section>

      {/* Stage tracker */}
      <section data-testid="section-stages">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold tracking-tight">Implementation stages</h2>
          <span className="text-[11px] font-mono text-muted-foreground">live · derived from checklist</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map((s, i) => {
            const stat = byStage[s.id];
            const pct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
            return (
              <Card key={s.id} className="hover-elevate" data-testid={`card-stage-${s.id}`}>
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground" data-testid={`text-stage-pct-${s.id}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold tracking-tight">{s.title}</div>
                  <p className="mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-2">{s.description}</p>
                  <Progress value={pct} className="mt-3 h-1" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Module overview */}
      <section data-testid="section-modules-overview">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold tracking-tight">Modules at a glance</h2>
          <Link href="/modules" className="text-[12px] text-primary hover:underline" data-testid="link-all-modules">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODULES.map((m) => {
            const stat = byModule[m.id];
            const pct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
            return (
              <Link
                key={m.id}
                href={`/modules/${m.id}`}
                className="block rounded-lg border border-card-border bg-card p-4 hover-elevate"
                data-testid={`card-module-overview-${m.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold tracking-tight">{m.title}</h3>
                    <p className="mt-0.5 text-[12px] text-muted-foreground line-clamp-2">{m.tagline}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] tabular-nums" data-testid={`badge-progress-${m.id}`}>
                    {stat.done}/{stat.total}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={pct} className="h-1 flex-1" />
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-9 text-right">{pct}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Principles */}
      <section className="rounded-lg border border-card-border bg-card p-5" data-testid="section-principles">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Independence principles</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
          <Principle text="No third-party SDK is imported at runtime." />
          <Principle text="No vendor branding, copy, or color is reused." />
          <Principle text="Source documents are referenced, not embedded." />
          <Principle text="No accounts, auth, or browser storage required." />
        </ul>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  foot,
  icon,
  testid,
  children,
}: {
  label: string;
  value: string;
  foot: string;
  icon: React.ReactNode;
  testid: string;
  children?: React.ReactNode;
}) {
  return (
    <Card data-testid={testid}>
      <CardHeader className="p-4 pb-1">
        <CardTitle className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground tracking-wide uppercase">
          <span className="text-primary">{icon}</span> {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="text-[26px] font-semibold tracking-tight tabular-nums" data-testid={`${testid}-value`}>{value}</div>
        <p className="mt-0.5 text-[12px] text-muted-foreground line-clamp-2">{foot}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function Principle({ text }: { text: string }) {
  return (
    <li className="flex gap-2">
      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <span className="text-foreground/90">{text}</span>
    </li>
  );
}
