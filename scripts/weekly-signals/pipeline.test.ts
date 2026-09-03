import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPipelineOutput, hasSubstantiveChanges } from "./pipeline";
import type { CollectorResult, RawSignal, SourceId, WeeklySignalsDocument, WeeklySignalsState } from "./types";

const now = new Date("2026-09-03T12:00:00.000Z");

function rawSignal(overrides: Partial<RawSignal> = {}): RawSignal {
  return {
    stableId: "sbir:dod:af-001",
    companyName: "A10 Systems Inc.",
    companyWebsite: null,
    agency: "DOD",
    kind: "sbir_award",
    occurredAt: "2026-08-25",
    awardAmount: 1_250_000,
    phase: "Phase II",
    sourceTitle: "AI-native spectrum network orchestration",
    sourceUrl: "https://www.sbir.gov/portfolio",
    matchedThemes: ["networking & security"],
    confidence: "high",
    entityKey: "uei:KNOWNUEI001",
    fingerprint: "fingerprint-1",
    ...overrides,
  };
}

function collector(sourceId: SourceId, signals: RawSignal[] = []): CollectorResult {
  return {
    source: {
      id: sourceId,
      label: sourceId.toUpperCase(),
      url:
        sourceId === "sbir"
          ? "https://data.www.sbir.gov/mod_awarddatapublic_no_abstract/award_data_no_abstract.csv"
          : sourceId === "dod"
            ? "https://www.war.gov/News/Contracts/"
            : sourceId === "doe"
              ? "https://science.osti.gov/sbir/Awards"
              : "https://www.dhs.gov/science-and-technology/newsroom",
      status: "healthy",
      checkedAt: now.toISOString(),
      detail: "fixture checked",
    },
    signals,
    fingerprints: Object.fromEntries(
      signals.map((signal) => [
        signal.stableId,
        { fingerprint: signal.fingerprint, occurredAt: signal.occurredAt, source: sourceId },
      ]),
    ),
    discoveredCount: signals.length,
  };
}

function pendingDocument(): WeeklySignalsDocument {
  return {
    version: 1,
    generatedAt: null,
    window: { start: null, end: null, days: 30 },
    sources: [],
    signals: [],
  };
}

const emptyState: WeeklySignalsState = { version: 1, fingerprints: {} };

test("pipeline classifies aliases as known companies and keeps award kinds separate", () => {
  const result = buildPipelineOutput({
    now,
    previousDocument: pendingDocument(),
    previousState: emptyState,
    settledResults: [
      { sourceId: "sbir", result: { status: "fulfilled", value: collector("sbir", [rawSignal()]) } },
      {
        sourceId: "dod",
        result: {
          status: "fulfilled",
          value: collector("dod", [rawSignal({ stableId: "dod:announcement", kind: "agency_announcement" })]),
        },
      },
      { sourceId: "doe", result: { status: "fulfilled", value: collector("doe") } },
      { sourceId: "dhs", result: { status: "fulfilled", value: collector("dhs") } },
    ],
  });
  assert.equal(result.document.signals.length, 2);
  assert.ok(result.document.signals.every((signal) => signal.companyName === "AiRANACULUS"));
  assert.ok(result.document.signals.every((signal) => signal.classification === "known_company"));
  assert.deepEqual(new Set(result.document.signals.map((signal) => signal.kind)), new Set(["sbir_award", "agency_announcement"]));
});

test("same substantive result is idempotent even when run timestamps change", () => {
  const settled = [
    { sourceId: "sbir" as const, result: { status: "fulfilled" as const, value: collector("sbir", [rawSignal()]) } },
    { sourceId: "dod" as const, result: { status: "fulfilled" as const, value: collector("dod") } },
    { sourceId: "doe" as const, result: { status: "fulfilled" as const, value: collector("doe") } },
    { sourceId: "dhs" as const, result: { status: "fulfilled" as const, value: collector("dhs") } },
  ];
  const first = buildPipelineOutput({ now, previousDocument: pendingDocument(), previousState: emptyState, settledResults: settled });
  const later = buildPipelineOutput({
    now: new Date("2026-09-03T18:00:00.000Z"),
    previousDocument: first.document,
    previousState: first.state,
    settledResults: settled,
  });
  assert.equal(hasSubstantiveChanges(first.document, first.state, later), false);
});

test("one failed source is degraded and retains its prior in-window signal", () => {
  const previous = pendingDocument();
  previous.signals = [{ ...rawSignal(), classification: "known_company" }];
  const result = buildPipelineOutput({
    now,
    previousDocument: previous,
    previousState: emptyState,
    settledResults: [
      { sourceId: "sbir", result: { status: "rejected", reason: new Error("temporary outage") } },
      { sourceId: "dod", result: { status: "fulfilled", value: collector("dod") } },
      { sourceId: "doe", result: { status: "fulfilled", value: collector("doe") } },
      { sourceId: "dhs", result: { status: "fulfilled", value: collector("dhs") } },
    ],
  });
  assert.equal(result.document.signals.length, 1);
  assert.equal(result.document.sources.find((source) => source.id === "sbir")?.status, "degraded");
});

test("total source failure aborts without producing output", () => {
  assert.throws(
    () =>
      buildPipelineOutput({
        now,
        previousDocument: pendingDocument(),
        previousState: emptyState,
        settledResults: (["sbir", "dod", "doe", "dhs"] as SourceId[]).map((sourceId) => ({
          sourceId,
          result: { status: "rejected", reason: new Error("offline") },
        })),
      }),
    /All weekly signal sources failed/,
  );
});
