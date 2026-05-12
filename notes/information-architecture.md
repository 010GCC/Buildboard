# Information Architecture

## Top-level Navigation (sidebar)
1. **Dashboard** (`/#/`) — value prop, readiness score, stage tracker.
2. **Modules** (`/#/modules`) — searchable grid of the seven core modules.
3. **Module Detail** (`/#/modules/:id`) — single-module deep view.
4. **Workflow** (`/#/workflow`) — end-to-end pipeline + interactive checklist.
5. **Dependencies** (`/#/dependencies`) — interactive graph of module relationships.
6. **Prompt backend** (`/#/prompt-backend`) — template-driven stage QA, generated `project.md`, and LLM prompt package.
7. **Export plan** (`/#/plan`) — live Markdown implementation plan generated from checklist state.
8. **Notes** (`/#/notes`) — markdown library view.

A persistent **Workflow Map** sits at the bottom of the sidebar — a compact diagram showing pipeline stages.

## Interactive Dependency Graph
- Nodes are positioned as a conceptual system map rather than a force-directed diagram, keeping the seven-module graph readable at small sizes.
- Clicking a node highlights upstream dependencies and downstream dependents, then updates the detail panel.
- Graph state is in-memory only and does not change the canonical module data.

## Exportable Implementation Plan
- The export page builds a Markdown implementation plan from `STAGES`, `STAGE_TO_MODULES`, `MODULES`, and live checklist state.
- Users can copy the Markdown or download `buildboard-implementation-plan.md`.
- Checked items are reflected as completed Markdown checkboxes; unchecked items remain open.
- Users can save named snapshots of the checklist and generated Markdown to the backend database, then load or delete those snapshots later.

## Saved Plan Persistence
- `saved_plans` stores a name, checklist JSON, generated Markdown, and timestamps.
- The API surface is intentionally small: list plans, create a plan, and delete a plan.
- Loading a plan replaces the in-memory checklist state with the saved checklist snapshot.

## Template-Driven Prompt Backend
- `SCOPE_QUESTIONS` defines extensive QA prompts for every implementation stage.
- Answers are compiled into a generated `project.md` file with answered and unanswered questions preserved.
- A prompt package wraps `project.md` with instructions for the chosen model so the user can create a finished plan in the LLM of choice.
- Prompt packages are saved in `project_specs` with project name, selected model, answers JSON, generated markdown, and generated prompt.
- The app does not require a live model connection; copy/download are the default handoff paths.

## Modules (canonical IDs)
| ID            | Title             | Stage in pipeline       |
| ------------- | ----------------- | ----------------------- |
| `agent`       | Agent             | Capture intent · Plan   |
| `workspaces`  | Workspaces        | Foundation (spans all)  |
| `editor`      | Project Editor    | Build · Validate        |
| `canvas`      | Design Canvas     | Design                  |
| `projects`    | Projects          | Build · Deploy          |
| `storage`     | Storage           | Provision data          |
| `integrations`| Integrations      | Integrate services      |

## Module Detail data shape (TypeScript)
```ts
type Module = {
  id: string;
  title: string;
  tagline: string;
  stage: Stage[];                 // which pipeline stages this touches
  definition: string;
  role: string;                   // role in workflow
  capabilities: string[];
  dependencies: string[];         // ids of other modules
  checklist: { id: string; label: string }[];
  risks: string[];                // includes non-goals
  sourceUrl: string;              // for transparency, not import
}
```

## Workflow Stages (canonical)
1. **Capture intent** — agent
2. **Plan** — agent, editor
3. **Design** — canvas
4. **Build** — editor, projects
5. **Provision data** — storage
6. **Integrate services** — integrations
7. **Validate** — editor, agent
8. **Deploy handoff** — projects, workspaces

## Routing
Hash routing via `wouter` + `useHashLocation`. All app navigation uses `<Link href="/x">`. In-page anchors use `onClick + scrollIntoView` to avoid hash collisions.

## State / Persistence
- All state is in-memory React state.
- Theme toggle uses `useState` seeded from `matchMedia('(prefers-color-scheme: dark)')`. No browser persistence layer is used.
- Checklist progress is in-memory only.

## Data source
Module content is a static TypeScript module under `client/src/data/modules.ts`. The Notes view imports the markdown text via Vite's `?raw` suffix so the same `notes/*.md` files are rendered in-app.
