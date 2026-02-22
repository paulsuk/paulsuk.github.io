import { createContext, useContext, useState } from "react";
import type { ScoringMode } from "../api/types";
import { defaultScoringMode } from "../utils/sport-config";

interface SportContextValue {
  slug: string;
  scoringMode: ScoringMode;
  setScoringMode: (mode: ScoringMode) => void;
}

const SportContext = createContext<SportContextValue | null>(null);

export function SportProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [scoringMode, setScoringMode] = useState<ScoringMode>(() => defaultScoringMode(slug));

  return (
    <SportContext.Provider value={{ slug, scoringMode, setScoringMode }}>
      {children}
    </SportContext.Provider>
  );
}

export function useSport(): SportContextValue {
  const ctx = useContext(SportContext);
  if (!ctx) throw new Error("useSport must be used within <SportProvider>");
  return ctx;
}
