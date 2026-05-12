import { useState } from "react";
import { FileText, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NOTES, excerpt } from "@/data/notes";

export default function Notes() {
  const [selected, setSelected] = useState(NOTES[0].id);
  const [copied, setCopied] = useState(false);

  const note = NOTES.find((n) => n.id === selected) ?? NOTES[0];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(note.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable in the sandbox; silently no-op.
    }
  }

  return (
    <div className="space-y-6" data-testid="page-notes">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Notes library</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground leading-relaxed">
          Markdown notes that live alongside the app source. The same files ship on disk under{" "}
          <code className="font-mono text-[12px] px-1 py-0.5 rounded bg-muted">notes/</code> so they can
          be reviewed, edited, and version-controlled outside the UI.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-5">
        <aside className="space-y-2" data-testid="notes-index">
          {NOTES.map((n) => {
            const active = n.id === selected;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n.id)}
                className={[
                  "w-full text-left rounded-md border p-3 hover-elevate",
                  active
                    ? "border-primary/60 bg-primary/5"
                    : "border-card-border bg-card",
                ].join(" ")}
                data-testid={`button-note-${n.id}`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[13px] font-semibold tracking-tight">{n.title}</span>
                </div>
                <code className="mt-1 block font-mono text-[10.5px] text-muted-foreground truncate">
                  {n.file}
                </code>
                <p className="mt-1.5 text-[12px] text-muted-foreground leading-snug line-clamp-2">
                  {excerpt(n.body, 160)}
                </p>
              </button>
            );
          })}
        </aside>

        <article
          className="rounded-lg border border-card-border bg-card overflow-hidden"
          data-testid={`note-content-${note.id}`}
        >
          <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background/40">
            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold tracking-tight truncate" data-testid="text-note-title">
                {note.title}
              </h2>
              <code className="block font-mono text-[10.5px] text-muted-foreground truncate">
                {note.file}
              </code>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {note.body.length.toLocaleString()} chars
            </Badge>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[12px] rounded-md border border-border px-2 py-1 hover-elevate"
              data-testid="button-copy-note"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </header>
          <pre
            className="p-4 text-[12.5px] leading-relaxed font-mono whitespace-pre-wrap break-words text-foreground/90 max-h-[68vh] overflow-y-auto"
            data-testid="text-note-body"
          >
            {note.body}
          </pre>
        </article>
      </div>
    </div>
  );
}
