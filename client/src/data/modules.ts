export type Stage =
  | "capture-intent"
  | "plan"
  | "design"
  | "build"
  | "provision-data"
  | "integrate-services"
  | "validate"
  | "deploy-handoff";

export const STAGES: { id: Stage; title: string; short: string; description: string }[] = [
  { id: "capture-intent", title: "Capture intent", short: "Intent", description: "Translate plain-language goals into structured requirements." },
  { id: "plan", title: "Plan", short: "Plan", description: "Break work into ordered tasks with explicit acceptance criteria." },
  { id: "design", title: "Design", short: "Design", description: "Sketch surfaces, compare variants, lock visual decisions." },
  { id: "build", title: "Build", short: "Build", description: "Generate, edit, and review code in a unified workbench." },
  { id: "provision-data", title: "Provision data", short: "Data", description: "Choose structured vs object storage and wire the schema." },
  { id: "integrate-services", title: "Integrate services", short: "Integrate", description: "Add external capabilities through declarative connectors." },
  { id: "validate", title: "Validate", short: "Validate", description: "Run automated checks and reproduce user paths before release." },
  { id: "deploy-handoff", title: "Deploy handoff", short: "Deploy", description: "Package a project as a deployable unit and pass it forward." },
];

export type Module = {
  id: string;
  title: string;
  tagline: string;
  stages: Stage[];
  definition: string;
  role: string;
  capabilities: string[];
  dependencies: string[];
  checklist: { id: string; label: string }[];
  risks: string[];
  sourceUrl: string;
};

export const MODULES: Module[] = [
  {
    id: "agent",
    title: "Agent",
    tagline: "Orchestrator that turns intent into a plan and a build.",
    stages: ["capture-intent", "plan", "build", "validate", "deploy-handoff"],
    definition:
      "A long-running orchestrator that captures plain-language intent, drafts a plan, scaffolds work, generates code, runs self-checks, repairs failures, and hands artifacts to deployment.",
    role:
      "Central conductor of the workflow. Owns the loop of plan → act → verify → repair. Routes work to the Editor for build, to Canvas for visual decisions, to Storage and Integrations when capabilities are needed, and to Projects for shipping.",
    capabilities: [
      "Intent capture from natural language",
      "Plan mode with reviewable task list",
      "Generation mode with checkpointed edits",
      "Automated verification of generated work",
      "Failure repair and re-plan loop",
      "Deploy handoff to a Project",
    ],
    dependencies: ["editor", "projects"],
    checklist: [
      { id: "agent-1", label: "Define how intent is captured (chat, brief, template)." },
      { id: "agent-2", label: "Decide plan-mode vs build-mode policy and switch criteria." },
      { id: "agent-3", label: "Specify checkpoint cadence and rollback granularity." },
      { id: "agent-4", label: "Define automated verification gates before deploy handoff." },
      { id: "agent-5", label: "Document repair-loop retry budget and escalation path." },
    ],
    risks: [
      "Non-goal: act as a generic chatbot — the Agent must always be tied to a Project.",
      "Risk: silent edits without checkpoints make rollback impossible.",
      "Risk: confusing plan and build modes leads to premature code generation.",
    ],
    sourceUrl: "https://docs.replit.com/core-concepts/agent",
  },
  {
    id: "workspaces",
    title: "Workspaces",
    tagline: "Team-scoped container for projects, access, and quota.",
    stages: ["capture-intent", "deploy-handoff"],
    definition:
      "Top-level container that groups projects, teammates, settings, billing, and access controls under a single boundary.",
    role:
      "Defines the people, permissions, and resource envelope that every Project inherits. Sets defaults for environment, integrations, and deploy targets.",
    capabilities: [
      "Member roster with roles",
      "Inherited environment defaults",
      "Quota and usage tracking",
      "Access policy (who can read, edit, deploy)",
      "Audit log of cross-project actions",
    ],
    dependencies: ["projects"],
    checklist: [
      { id: "ws-1", label: "Document role matrix (admin, builder, viewer)." },
      { id: "ws-2", label: "Define quota dimensions and soft/hard limits." },
      { id: "ws-3", label: "Decide which settings are inheritable vs project-overridable." },
      { id: "ws-4", label: "Plan billing surface and invoice ownership." },
    ],
    risks: [
      "Non-goal: workspace-level code editing — code lives in Projects.",
      "Risk: ambiguous inheritance causes config drift between projects.",
    ],
    sourceUrl: "https://docs.replit.com/core-concepts/workspaces",
  },
  {
    id: "editor",
    title: "Project Editor",
    tagline: "Unified workbench: chat, preview, and task board side by side.",
    stages: ["plan", "build", "validate"],
    definition:
      "The home-base work environment. Combines Agent conversation, live preview, task board, file tree, plan mode, and collaboration cursors into one surface.",
    role:
      "Where Agent decisions become visible, reviewable artifacts. Hosts plan/build toggles, imports, and real-time collaboration.",
    capabilities: [
      "Chat with the Agent in context",
      "Live preview of the current Project",
      "Task board with status per item",
      "File and artifact tree",
      "Plan mode vs build mode toggle",
      "Multi-user collaboration cursors",
      "Imports from existing repos and templates",
    ],
    dependencies: ["agent", "projects", "canvas"],
    checklist: [
      { id: "ed-1", label: "Specify preview refresh policy (eager vs on-save)." },
      { id: "ed-2", label: "Define task-board state machine (todo / in-progress / done / blocked)." },
      { id: "ed-3", label: "Decide which file operations require explicit confirmation." },
      { id: "ed-4", label: "Plan import flows from external sources (read-only initially)." },
    ],
    risks: [
      "Non-goal: replace a full IDE for power users — keep the surface focused.",
      "Risk: too many panes overwhelm new users; progressive disclosure is required.",
    ],
    sourceUrl: "https://docs.replit.com/core-concepts/project-editor",
  },
  {
    id: "canvas",
    title: "Design Canvas",
    tagline: "Spatial board for mockups, variants, and apply-to-project.",
    stages: ["design"],
    definition:
      "A free-form board where mockups, live previews, and annotations live in the same space. Variants can be compared and selectively merged back into a Project.",
    role:
      "The design-and-decide surface. Externalizes alternatives so the team can compare before committing changes back to code.",
    capabilities: [
      "Spatial canvas with zoom and pan",
      "Mockup nodes (static) and preview nodes (live)",
      "Annotation pins with threads",
      "Variant comparison side-by-side",
      "Apply-to-project action with diff preview",
    ],
    dependencies: ["editor", "projects"],
    checklist: [
      { id: "cv-1", label: "Define what an 'apply' operation actually writes to the Project." },
      { id: "cv-2", label: "Specify variant lifecycle (draft / proposed / applied / archived)." },
      { id: "cv-3", label: "Decide annotation permissions (anyone vs authors only)." },
      { id: "cv-4", label: "Plan canvas-to-editor navigation continuity." },
    ],
    risks: [
      "Non-goal: become a full vector design tool — it is a decision surface, not Figma.",
      "Risk: applied changes that bypass code review create silent drift.",
    ],
    sourceUrl: "https://docs.replit.com/replitai/canvas",
  },
  {
    id: "projects",
    title: "Projects",
    tagline: "The unit that ships — code, data, and artifacts together.",
    stages: ["build", "deploy-handoff"],
    definition:
      "The smallest deployable unit. Bundles code, data, and artifacts that share a backend and database. Publishing is always Project-scoped.",
    role:
      "Defines the deploy boundary. Owns the runtime environment, the database, and the artifact graph.",
    capabilities: [
      "Source tree with version history",
      "Shared backend and database across artifacts",
      "Build and deploy commands",
      "Release history with rollback",
      "Per-project environment variables",
    ],
    dependencies: ["workspaces", "storage", "integrations"],
    checklist: [
      { id: "pr-1", label: "Lock the Project boundary — what is inside vs outside." },
      { id: "pr-2", label: "Specify build command and deploy target." },
      { id: "pr-3", label: "Document env-var precedence (project > workspace defaults)." },
      { id: "pr-4", label: "Plan release history retention and rollback policy." },
    ],
    risks: [
      "Non-goal: cross-project shared state — that's what Workspaces are for.",
      "Risk: artifact sprawl inside one Project blurs the deploy boundary.",
    ],
    sourceUrl: "https://docs.replit.com/replitai/projects",
  },
  {
    id: "storage",
    title: "Storage",
    tagline: "Structured data and object storage, provisioned on demand.",
    stages: ["provision-data"],
    definition:
      "A two-tier data layer: SQL-shaped structured storage for queryable records, plus object storage for files such as images, video, and documents. The Agent can provision either tier on request.",
    role:
      "Backs every Project with predictable data primitives. Keeps relational logic in SQL and large binary content out of the relational store.",
    capabilities: [
      "Structured (SQL) tables with schema migrations",
      "Object storage with signed URLs",
      "Agent-provisioned schemas on demand",
      "Per-Project isolation",
      "Snapshot and restore",
    ],
    dependencies: ["projects"],
    checklist: [
      { id: "st-1", label: "Pick the structured engine and document its limits." },
      { id: "st-2", label: "Decide object-storage size and retention policy." },
      { id: "st-3", label: "Specify schema-change review flow (Agent-proposed vs human-approved)." },
      { id: "st-4", label: "Plan backup cadence and restore drill." },
    ],
    risks: [
      "Non-goal: store binary blobs in the SQL layer.",
      "Risk: implicit schema changes without migration history create lock-in.",
    ],
    sourceUrl: "https://docs.replit.com/category/storage-and-databases",
  },
  {
    id: "integrations",
    title: "Integrations",
    tagline: "Declarative connectors to payments, APIs, and tool servers.",
    stages: ["integrate-services"],
    definition:
      "A catalog of managed external capabilities: payments, generic REST APIs, MCP-style tool servers scoped per user, and background workers. Wired in by configuration rather than ad-hoc code.",
    role:
      "Extends a Project with capabilities the platform doesn't natively own. Keeps secrets out of source and standardizes failure modes.",
    capabilities: [
      "Payments (checkout, subscriptions)",
      "Generic REST API connectors with auth",
      "MCP tool servers scoped per user",
      "Background workers and cron",
      "Connector health and secret rotation",
    ],
    dependencies: ["projects", "workspaces"],
    checklist: [
      { id: "in-1", label: "Define connector taxonomy and required fields per category." },
      { id: "in-2", label: "Specify secret storage and rotation policy." },
      { id: "in-3", label: "Decide background-worker concurrency and retry budgets." },
      { id: "in-4", label: "Document failure-mode contract (retryable vs terminal)." },
    ],
    risks: [
      "Non-goal: hardcode any third-party SDK — connectors are configuration.",
      "Risk: leaking secrets through generated code or logs.",
    ],
    sourceUrl: "https://docs.replit.com/replitai/integrations",
  },
];

export const STAGE_TO_MODULES: Record<Stage, string[]> = STAGES.reduce((acc, s) => {
  acc[s.id] = MODULES.filter((m) => m.stages.includes(s.id)).map((m) => m.id);
  return acc;
}, {} as Record<Stage, string[]>);
