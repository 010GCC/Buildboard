import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, Download, FileText, Loader2, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STAGES } from "@/data/modules";
import { MODEL_OPTIONS, SCOPE_QUESTIONS } from "@/data/scopeTemplates";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProjectSpec } from "@shared/schema";

type Answers = Record<string, string>;

function answeredCountForStage(stageId: string, answers: Answers) {
  const questions = SCOPE_QUESTIONS.filter((q) => q.stage === stageId);
  return questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
}

function buildProjectMarkdown(projectName: string, selectedModel: string, answers: Answers) {
  const name = projectName.trim() || "Untitled project";
  const answered = SCOPE_QUESTIONS.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
  const lines: string[] = [
    `# ${name}`,
    "",
    "## Project prompt backend",
    "",
    `- **Target planning model:** ${selectedModel}`,
    `- **Template version:** Buildboard stage-scope v1`,
    `- **Answered scope questions:** ${answered}/${SCOPE_QUESTIONS.length}`,
    "- **Purpose:** Capture implementation-stage QA into a structured project markdown file that can be used to generate a finished plan with the selected LLM.",
    "",
    "## Stage QA",
    "",
  ];

  for (const stage of STAGES) {
    const questions = SCOPE_QUESTIONS.filter((q) => q.stage === stage.id);
    lines.push(`### ${stage.title}`);
    lines.push("");
    lines.push(stage.description);
    lines.push("");
    for (const question of questions) {
      const answer = (answers[question.id] ?? "").trim();
      lines.push(`#### ${question.prompt}`);
      lines.push("");
      lines.push(answer || "_Unanswered._");
      lines.push("");
    }
  }

  lines.push("## Required finished-plan outputs");
  lines.push("");
  lines.push("- Executive summary with scope and non-goals.");
  lines.push("- Assumptions, open questions, and risk register.");
  lines.push("- User journeys, product requirements, and acceptance criteria.");
  lines.push("- Architecture, data model, integrations, and operational requirements.");
  lines.push("- Phased implementation roadmap with milestones and review gates.");
  lines.push("- QA strategy, launch checklist, and post-launch maintenance plan.");
  lines.push("");
  lines.push("## Guardrails");
  lines.push("");
  lines.push("- Keep the output vendor-neutral unless a vendor is explicitly named in the answers.");
  lines.push("- Do not invent credentials, private data, legal claims, or production access.");
  lines.push("- Convert unanswered sections into explicit follow-up questions or assumptions.");
  lines.push("- Preserve user-provided terminology and constraints.");

  return lines.join("\n");
}

function buildPromptPackage(projectName: string, selectedModel: string, projectMarkdown: string) {
  return [
    `You are ${selectedModel}, acting as a senior product architect, technical program manager, and implementation planner.`,
    "",
    "Use the project markdown below as the source of truth. Your job is to create a finished implementation plan that is actionable for product, design, engineering, QA, and launch stakeholders.",
    "",
    "Instructions:",
    "1. Preserve the user's scope, non-goals, terminology, and constraints.",
    "2. Turn unanswered questions into a clearly labeled Open Questions section instead of inventing answers.",
    "3. Produce a finished plan with these sections: Executive Summary, Goals and Non-goals, Personas and Use Cases, Functional Requirements, UX and Content Requirements, Architecture, Data Model, Integrations, QA Plan, Milestones, Risks, Launch Handoff, and Maintenance.",
    "4. Include acceptance criteria and review gates for each implementation stage.",
    "5. Keep the plan vendor-neutral and avoid lock-in unless the project markdown explicitly requires a provider.",
    "6. End with a concise list of next decisions the human owner must make.",
    "",
    "Project markdown:",
    "",
    "```md",
    projectMarkdown,
    "```",
  ].join("\n");
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function PromptBackend() {
  const [projectName, setProjectName] = useState("New AI build project");
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_OPTIONS[0]);
  const [selectedStage, setSelectedStage] = useState(STAGES[0].id);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState<"project" | "prompt" | "plan" | "">("");
  const [generatedPlan, setGeneratedPlan] = useState<string>("");
  const [generatedPlanModel, setGeneratedPlanModel] = useState<string>("");

  const projectMarkdown = useMemo(
    () => buildProjectMarkdown(projectName, selectedModel, answers),
    [projectName, selectedModel, answers],
  );
  const promptPackage = useMemo(
    () => buildPromptPackage(projectName, selectedModel, projectMarkdown),
    [projectName, selectedModel, projectMarkdown],
  );
  const totalAnswered = useMemo(
    () => SCOPE_QUESTIONS.filter((q) => (answers[q.id] ?? "").trim().length > 0).length,
    [answers],
  );

  const { data: savedSpecs = [], isLoading: specsLoading } = useQuery<ProjectSpec[]>({
    queryKey: ["/api/project-specs"],
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/project-specs", {
        name: projectName.trim(),
        selectedModel,
        answersJson: JSON.stringify(answers),
        projectMarkdown,
        promptPackage,
      });
      return response.json() as Promise<ProjectSpec>;
    },
    onSuccess: async (spec) => {
      setStatus(`Saved project prompt package "${spec.name}".`);
      await queryClient.invalidateQueries({ queryKey: ["/api/project-specs"] });
    },
    onError: (error: Error) => setStatus(error.message || "Could not save project prompt package."),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-plan", {
        promptPackage,
        projectName: projectName.trim() || undefined,
        model: selectedModel,
      });
      return response.json() as Promise<{ plan: string; model: string }>;
    },
    onSuccess: (result) => {
      setGeneratedPlan(result.plan);
      setGeneratedPlanModel(result.model);
      setStatus(`Generated finished plan with ${result.model}.`);
    },
    onError: (error: Error) => {
      setGeneratedPlan("");
      setGeneratedPlanModel("");
      setStatus(error.message || "Could not generate finished plan.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/project-specs/${id}`);
    },
    onSuccess: async () => {
      setStatus("Deleted project prompt package.");
      await queryClient.invalidateQueries({ queryKey: ["/api/project-specs"] });
    },
    onError: (error: Error) => setStatus(error.message || "Could not delete project prompt package."),
  });

  const stageQuestions = SCOPE_QUESTIONS.filter((q) => q.stage === selectedStage);

  async function copyText(kind: "project" | "prompt" | "plan", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setStatus("Copy was blocked by the browser. Use download instead.");
    }
  }

  function loadSpec(spec: ProjectSpec) {
    try {
      const parsed = JSON.parse(spec.answersJson);
      setProjectName(spec.name);
      setSelectedModel(spec.selectedModel);
      setAnswers(parsed && typeof parsed === "object" ? parsed : {});
      setStatus(`Loaded "${spec.name}".`);
    } catch {
      setStatus(`Could not load "${spec.name}".`);
    }
  }

  return (
    <div className="space-y-6" data-testid="page-prompt-backend">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Template-driven prompt backend</h1>
          <p className="mt-1 max-w-3xl text-[13px] text-muted-foreground leading-relaxed">
            Answer extensive stage questions, generate a structured <span className="font-mono">project.md</span>,
            and produce an LLM-ready prompt package for the model of your choice.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyText("project", projectMarkdown)}
            data-testid="button-copy-project-md"
            className="gap-2"
          >
            {copied === "project" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy project.md
          </Button>
          <Button
            size="sm"
            onClick={() => copyText("prompt", promptPackage)}
            data-testid="button-copy-llm-prompt"
            className="gap-2"
          >
            {copied === "prompt" ? <CheckCircle2 className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
            Copy LLM prompt
          </Button>
        </div>
      </header>

      {status ? (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground" data-testid="status-prompt-backend">
          {status}
        </div>
      ) : null}

      <section className="grid grid-cols-1 xl:grid-cols-[300px,1fr,360px] gap-5">
        <aside className="space-y-4">
          <div className="rounded-lg border border-card-border bg-card p-4" data-testid="card-project-setup">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-wider font-medium">Project file</span>
            </div>
            <label className="mt-3 block text-[12px] font-medium" htmlFor="prompt-project-name">
              Project name
            </label>
            <Input
              id="prompt-project-name"
              className="mt-1.5"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              data-testid="input-prompt-project-name"
              maxLength={100}
            />
            <label className="mt-3 block text-[12px] font-medium" htmlFor="prompt-model-choice">
              LLM of choice
            </label>
            <select
              id="prompt-model-choice"
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring"
              data-testid="select-llm-model"
            >
              {MODEL_OPTIONS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <div className="mt-4 rounded-md border border-border bg-background p-3">
              <div className="text-[24px] font-semibold tabular-nums" data-testid="text-scope-answered">
                {totalAnswered}/{SCOPE_QUESTIONS.length}
              </div>
              <p className="text-[12px] text-muted-foreground">scope questions answered</p>
            </div>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-3" data-testid="card-stage-question-nav">
            <h2 className="px-1 text-[12px] uppercase tracking-wider text-muted-foreground font-medium">Implementation stages</h2>
            <div className="mt-2 space-y-1">
              {STAGES.map((stage) => {
                const count = answeredCountForStage(stage.id, answers);
                const total = SCOPE_QUESTIONS.filter((q) => q.stage === stage.id).length;
                const active = selectedStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedStage(stage.id)}
                    className={[
                      "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[12.5px] hover-elevate",
                      active ? "bg-primary text-primary-foreground" : "bg-background text-foreground/90",
                    ].join(" ")}
                    data-testid={`button-stage-template-${stage.id}`}
                  >
                    <span>{stage.title}</span>
                    <span className={active ? "font-mono text-primary-foreground/80" : "font-mono text-muted-foreground"}>
                      {count}/{total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="rounded-lg border border-card-border bg-card p-4" data-testid="panel-stage-questions">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold tracking-tight">
                  {STAGES.find((s) => s.id === selectedStage)?.title} scope QA
                </h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  These answers become the source material for the generated project markdown.
                </p>
              </div>
              <Badge variant="outline" className="font-mono">
                {answeredCountForStage(selectedStage, answers)}/{stageQuestions.length}
              </Badge>
            </div>
            <div className="mt-5 space-y-5">
              {stageQuestions.map((question) => (
                <div key={question.id} className="rounded-lg border border-border bg-background p-4" data-testid={`card-scope-question-${question.id}`}>
                  <label htmlFor={`answer-${question.id}`} className="block text-[13px] font-semibold tracking-tight">
                    {question.prompt}
                  </label>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{question.guidance}</p>
                  <Textarea
                    id={`answer-${question.id}`}
                    value={answers[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder={question.placeholder}
                    className="mt-3 min-h-[116px] text-[13px]"
                    data-testid={`textarea-answer-${question.id}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="space-y-4">
          <div className="rounded-lg border border-card-border bg-card overflow-hidden" data-testid="panel-project-md-preview">
            <header className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-3">
              <h2 className="text-[13px] font-semibold tracking-tight">project.md</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadText("project.md", projectMarkdown)}
                data-testid="button-download-project-md"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </header>
            <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11.5px] leading-relaxed" data-testid="text-project-md-preview">
              {projectMarkdown}
            </pre>
          </div>

          <div className="rounded-lg border border-card-border bg-card overflow-hidden" data-testid="panel-llm-prompt-preview">
            <header className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-3">
              <h2 className="text-[13px] font-semibold tracking-tight">LLM prompt package</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadText("llm-planning-prompt.md", promptPackage)}
                data-testid="button-download-llm-prompt"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </header>
            <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11.5px] leading-relaxed" data-testid="text-llm-prompt-preview">
              {promptPackage}
            </pre>
          </div>

          <div className="rounded-lg border border-card-border bg-card overflow-hidden" data-testid="panel-generated-plan">
            <header className="flex items-center justify-between gap-3 border-b border-border bg-background/40 px-4 py-3">
              <div>
                <h2 className="text-[13px] font-semibold tracking-tight">Generated finished plan</h2>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Runs the LLM prompt against a backend-configured Ollama endpoint. No key is sent from the browser.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                data-testid="button-generate-plan"
                className="gap-2"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generateMutation.isPending ? "Generating…" : "Generate with Ollama"}
              </Button>
            </header>
            {generatedPlan ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-border bg-background/20 px-4 py-2">
                  <span className="text-[11.5px] text-muted-foreground" data-testid="text-generated-plan-model">
                    Model: <span className="font-mono">{generatedPlanModel || "unknown"}</span>
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => copyText("plan", generatedPlan)}
                      data-testid="button-copy-generated-plan"
                      className="gap-2"
                    >
                      {copied === "plan" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Copy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadText("final-plan.md", generatedPlan)}
                      data-testid="button-download-generated-plan"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre
                  className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11.5px] leading-relaxed"
                  data-testid="text-generated-plan-preview"
                >
                  {generatedPlan}
                </pre>
              </>
            ) : (
              <p className="px-4 py-6 text-[12px] text-muted-foreground" data-testid="text-generated-plan-empty">
                No generated plan yet. Click <span className="font-medium">Generate with Ollama</span> to call the
                configured backend model. If the backend is not configured the request returns a 503 explaining how to
                enable AI generation.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-card-border bg-card p-4" data-testid="card-save-project-spec">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[13px] font-semibold tracking-tight">Saved prompt packages</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">Save generated project files and prompt packages to the backend.</p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                data-testid="button-save-project-spec"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
            <div className="mt-3 space-y-2" data-testid="list-project-specs">
              {specsLoading ? (
                <p className="text-[12px] text-muted-foreground">Loading saved packages…</p>
              ) : savedSpecs.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No project prompt packages saved yet.</p>
              ) : (
                savedSpecs.map((spec) => (
                  <div key={spec.id} className="rounded-md border border-border bg-background p-3" data-testid={`card-project-spec-${spec.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] font-semibold tracking-tight" data-testid={`text-project-spec-name-${spec.id}`}>
                          {spec.name}
                        </h3>
                        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {spec.selectedModel} · {new Date(spec.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button type="button" size="sm" variant="outline" onClick={() => loadSpec(spec)} data-testid={`button-load-project-spec-${spec.id}`}>
                          Load
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(spec.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-project-spec-${spec.id}`}
                          aria-label={`Delete ${spec.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
