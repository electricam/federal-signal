import weeklySignalsJson from "./generated/weekly-signals.json";

export type WeeklySignal = {
  stableId: string;
  companyName: string;
  companyWebsite: string | null;
  agency: "DOD" | "DOE" | "DHS";
  kind: "sbir_award" | "agency_announcement";
  occurredAt: string;
  awardAmount: number | null;
  phase: string | null;
  sourceTitle: string;
  sourceUrl: string;
  classification: "known_company" | "new_company";
  matchedThemes: string[];
  confidence: "high" | "medium" | "low";
};

export type WeeklySourceStatus = {
  id: "sbir" | "dod" | "doe" | "dhs";
  label: string;
  url: string;
  status: "healthy" | "degraded" | "pending";
  checkedAt: string | null;
  detail: string;
};

export type WeeklySignalsDocument = {
  version: 1;
  generatedAt: string | null;
  window: { start: string | null; end: string | null; days: 30 };
  sources: WeeklySourceStatus[];
  signals: WeeklySignal[];
};

export const weeklySignals = weeklySignalsJson as WeeklySignalsDocument;
