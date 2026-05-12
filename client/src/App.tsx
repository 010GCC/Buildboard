import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { ProgressProvider } from "@/lib/progress";
import { AppShell } from "@/components/AppShell";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Modules from "@/pages/Modules";
import ModuleDetail from "@/pages/ModuleDetail";
import Workflow from "@/pages/Workflow";
import Notes from "@/pages/Notes";
import DependencyGraph from "@/pages/DependencyGraph";
import ImplementationPlan from "@/pages/ImplementationPlan";
import PromptBackend from "@/pages/PromptBackend";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/modules" component={Modules} />
      <Route path="/modules/:id" component={ModuleDetail} />
      <Route path="/workflow" component={Workflow} />
      <Route path="/dependencies" component={DependencyGraph} />
      <Route path="/prompt-backend" component={PromptBackend} />
      <Route path="/plan" component={ImplementationPlan} />
      <Route path="/notes" component={Notes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ProgressProvider>
          <TooltipProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppShell>
                <AppRouter />
              </AppShell>
            </Router>
          </TooltipProvider>
        </ProgressProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
