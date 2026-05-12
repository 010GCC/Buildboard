// Bring the markdown notes from /notes into the bundle as raw text so the in-app
// Notes view stays in lockstep with the source markdown files on disk.
import sourceSummaries from "../../../notes/source-summaries.md?raw";
import productRequirements from "../../../notes/product-requirements.md?raw";
import informationArchitecture from "../../../notes/information-architecture.md?raw";
import qaHandoff from "../../../notes/qa-handoff.md?raw";

export type Note = {
  id: string;
  title: string;
  file: string;
  body: string;
};

export const NOTES: Note[] = [
  { id: "source-summaries", title: "Source Summaries", file: "notes/source-summaries.md", body: sourceSummaries },
  { id: "product-requirements", title: "Product Requirements", file: "notes/product-requirements.md", body: productRequirements },
  { id: "information-architecture", title: "Information Architecture", file: "notes/information-architecture.md", body: informationArchitecture },
  { id: "qa-handoff", title: "QA & Handoff", file: "notes/qa-handoff.md", body: qaHandoff },
];

export function excerpt(body: string, max = 220): string {
  const stripped = body
    .replace(/^#.*$/gm, "")
    .replace(/[`*_>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > max ? stripped.slice(0, max).trimEnd() + "…" : stripped;
}
