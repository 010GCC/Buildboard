import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Boxes,
  Workflow,
  NotebookText,
  Network,
  FileQuestion,
  FileDown,
  Search,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { STAGES } from "@/data/modules";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { href: "/modules", label: "Modules", icon: Boxes, testid: "nav-modules" },
  { href: "/workflow", label: "Workflow", icon: Workflow, testid: "nav-workflow" },
  { href: "/dependencies", label: "Dependencies", icon: Network, testid: "nav-dependencies" },
  { href: "/prompt-backend", label: "Prompt backend", icon: FileQuestion, testid: "nav-prompt-backend" },
  { href: "/plan", label: "Export plan", icon: FileDown, testid: "nav-plan" },
  { href: "/notes", label: "Notes", icon: NotebookText, testid: "nav-notes" },
] as const;

function isActive(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/" || currentPath === "";
  return currentPath === href || currentPath.startsWith(href + "/");
}

function WorkflowMap() {
  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3" data-testid="map-workflow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Pipeline</span>
        <span className="text-[10px] font-mono text-muted-foreground">{STAGES.length} stages</span>
      </div>
      <ol className="space-y-1.5">
        {STAGES.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 text-[12px]">
            <span className="font-mono text-[10px] text-muted-foreground w-4">{String(i + 1).padStart(2, "0")}</span>
            <span className="h-1 w-1 rounded-full bg-primary/70" />
            <span className="text-foreground/90">{s.title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/85 backdrop-blur">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover-elevate"
              data-testid="button-toggle-sidebar"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link href="/" className="flex items-center gap-2 hover:opacity-90" data-testid="link-home">
              <Logo size={26} withWordmark />
            </Link>
            <span className="hidden md:inline-flex text-[11px] font-mono text-muted-foreground border border-border rounded-full px-2 py-0.5 ml-2">
              independent build-ops surface
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              data-testid="button-toggle-theme"
              aria-label="Toggle theme"
              className="gap-2"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline text-[12px]">{theme === "dark" ? "Light" : "Dark"}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={[
            "fixed lg:sticky top-14 left-0 z-20 h-[calc(100vh-3.5rem)] w-64 shrink-0",
            "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
            "transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
          data-testid="sidebar"
        >
          <div className="h-full flex flex-col p-3 gap-3 overflow-y-auto">
            <nav className="flex flex-col gap-0.5" data-testid="sidebar-nav">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(location, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    data-testid={item.testid}
                    className={[
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] hover-elevate",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/85",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-1">
              <WorkflowMap />
            </div>

            <div className="mt-auto pt-2 border-t border-sidebar-border">
              <p className="text-[11px] text-muted-foreground leading-snug">
                Independent platform. No third-party SDKs, no vendor lock-in.
              </p>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileOpen && (
          <div
            className="fixed inset-0 top-14 z-10 bg-background/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-10" data-testid="main-content">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export { Search };
