# Product Requirements — AI Build Ops Platform

## 1. Purpose
Build a **vendor-neutral knowledge and planning surface** for teams who design, build, and operate AI-assisted software delivery. The product organizes the abstract concepts of *Agent, Workspaces, Project Editor, Design Canvas, Projects, Storage, and Integrations* into:

- Module reference cards
- Implementation checklists
- An end-to-end workflow map
- An interactive dependency graph
- A Markdown implementation-plan export
- Backend-saved named plan snapshots
- Template-driven prompt backend with extensive implementation-stage QA
- Generated `project.md` and LLM-ready prompt packages
- A markdown-backed notes library

**Independence requirement (non-negotiable).** This is **not** a Replit app, fork, clone, or wrapper. It does **not** depend on Replit SDKs, APIs, branding, copy, or color. The referenced docs are used only as abstract source material. Nothing in this codebase imports a Replit package or calls a Replit endpoint.

## 2. Personas
| Persona            | Goal                                                       |
| ------------------ | ---------------------------------------------------------- |
| Build Lead         | Owns end-to-end delivery; needs a single map of the system |
| Platform Engineer  | Decides storage, integrations, deploy boundaries           |
| Design Engineer    | Bridges Design Canvas concept with shipped UI              |
| Implementation PM  | Tracks readiness across all seven modules                  |
| New Team Member    | Learns vocabulary and module relationships fast            |

## 3. Core Workflows
1. **Explore modules** — sidebar nav, search, filter, jump to detail.
2. **Read module detail** — definition, role in workflow, capabilities, dependencies, implementation checklist, risks/non-goals, source link.
3. **Follow the build pipeline** — capture intent → plan → design → build → provision data → integrate services → validate → deploy handoff.
4. **Track readiness** — dashboard score derived from checked items across modules (React state only, no persistence).
5. **Browse notes** — markdown notes excerpted and surfaced in-app; full files live in `/notes`.
6. **Toggle theme** — light/dark via React state only, with no browser persistence layer.
7. **Explore dependencies** — click module nodes to inspect upstream and downstream relationships.
8. **Export implementation plan** — generate copyable/downloadable Markdown from the current checklist state.
9. **Save named plans** — name the current checklist/export state, reload it later, or delete it.
10. **Scope with templates** — answer stage-specific QA prompts that define the project scope.
11. **Generate project markdown** — compile stage QA into `project.md` as the canonical input file for planning.
12. **Create LLM prompt package** — wrap `project.md` in model-specific instructions for the user's LLM of choice.
13. **Optional runtime generation via Ollama** — when the backend is configured with `OLLAMA_BASE_URL`, the LLM prompt package can be sent to `POST /api/generate-plan` to produce a finished plan that can be copied or downloaded as `final-plan.md`. The route returns 503 when AI generation is not configured, and the rest of the prompt-backend workflow works without it.

## 4. Non-Goals
- No actual code execution, terminal, or runtime sandbox.
- No real external service integration (Stripe, MCP, etc.) — modeled conceptually.
- No authentication, accounts, or multi-tenant data.
- No browser persistence layer of any kind; transient UI state stays in React state, while named plan snapshots are stored through the backend database.
- No live LLM dependency by default; the app generates copyable/downloadable prompt packages that can be used with the chosen model. An optional Ollama-compatible backend integration is supported via `OLLAMA_BASE_URL` / `OLLAMA_API_KEY` / `OLLAMA_MODEL`, but it is not required.
- No API keys are ever stored in the browser or sent from the client; only the backend reads `OLLAMA_API_KEY`.
- No imitation of any vendor's product UI, logo, or color palette.
- Not a Replit replacement, fork, or compatibility layer.

## 5. Success Criteria
- All seven modules surfaced with parity of detail.
- Search filters modules in under 100ms perceived latency.
- Workflow checklist is interactive and updates the readiness score live.
- Dark mode toggles cleanly with no flash or contrast failures.
- `npm run build` passes cleanly.
- Stable `data-testid` attributes on every interactive and key display element.
