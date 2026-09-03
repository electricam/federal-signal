import type { WeeklySignal, WeeklySourceStatus } from "../../src/data/weekly-signals";

export type { WeeklySignal, WeeklySignalsDocument } from "../../src/data/weekly-signals";

export const sourceIds = ["sbir", "dod", "doe", "dhs"] as const;

export type SourceId = (typeof sourceIds)[number];
export type Agency = "DOD" | "DOE" | "DHS";
export type SourceStatus = WeeklySourceStatus;

export type FingerprintRecord = {
  fingerprint: string;
  occurredAt: string;
  source: SourceId;
};

export type WeeklySignalsState = {
  version: 1;
  fingerprints: Record<string, FingerprintRecord>;
};

export type RawSignal = Omit<WeeklySignal, "classification"> & {
  entityKey: string;
  fingerprint: string;
};

export type CollectorResult = {
  source: SourceStatus;
  signals: RawSignal[];
  fingerprints: Record<string, FingerprintRecord>;
  discoveredCount: number;
};
