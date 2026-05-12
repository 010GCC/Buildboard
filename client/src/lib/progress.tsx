import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { MODULES, STAGES, Stage } from "@/data/modules";

type ProgressContextValue = {
  done: Set<string>;
  toggle: (id: string) => void;
  setDoneItems: (ids: string[]) => void;
  byModule: Record<string, { total: number; done: number }>;
  byStage: Record<Stage, { total: number; done: number }>;
  total: number;
  totalDone: number;
  percent: number;
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Set<string>>(() => new Set());

  const value = useMemo<ProgressContextValue>(() => {
    const byModule: Record<string, { total: number; done: number }> = {};
    let total = 0;
    let totalDone = 0;
    for (const m of MODULES) {
      const d = m.checklist.filter((c) => done.has(c.id)).length;
      byModule[m.id] = { total: m.checklist.length, done: d };
      total += m.checklist.length;
      totalDone += d;
    }
    const byStage: Record<Stage, { total: number; done: number }> = {} as any;
    for (const s of STAGES) {
      let t = 0, d = 0;
      for (const m of MODULES) {
        if (!m.stages.includes(s.id)) continue;
        t += m.checklist.length;
        d += m.checklist.filter((c) => done.has(c.id)).length;
      }
      byStage[s.id] = { total: t, done: d };
    }
    const percent = total === 0 ? 0 : Math.round((totalDone / total) * 100);
    return {
      done,
      toggle: (id) =>
        setDone((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      setDoneItems: (ids) => setDone(new Set(ids)),
      byModule,
      byStage,
      total,
      totalDone,
      percent,
    };
  }, [done]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const v = useContext(ProgressContext);
  if (!v) throw new Error("useProgress must be used inside ProgressProvider");
  return v;
}
