import { candidates } from "../../src/data/candidates";
import { FINGERPRINT_RETENTION_DAYS, MAX_SIGNALS, SOURCES, WINDOW_DAYS } from "./config";
import type {
  CollectorResult,
  FingerprintRecord,
  RawSignal,
  SourceId,
  SourceStatus,
  WeeklySignal,
  WeeklySignalsDocument,
  WeeklySignalsState,
} from "./types";
import { sourceIds } from "./types";
import { daysAgo, isoDate, normalizeCompanyName } from "./utils";

const knownCompanies = new Map(
  candidates.flatMap((candidate) =>
    [candidate.name, ...candidate.aliases].map((name) => [normalizeCompanyName(name), candidate] as const),
  ),
);

export type PipelineBuild = {
  document: WeeklySignalsDocument;
  state: WeeklySignalsState;
  newIds: string[];
  correctedIds: string[];
};

function sourceForSignal(signal: WeeklySignal): SourceId {
  const prefix = signal.stableId.split(":", 1)[0] as SourceId;
  return sourceIds.includes(prefix) ? prefix : "sbir";
}

function classify(signal: RawSignal): WeeklySignal {
  const known = knownCompanies.get(normalizeCompanyName(signal.companyName));
  const { entityKey: _entityKey, fingerprint: _fingerprint, ...publicSignal } = signal;
  void _entityKey;
  void _fingerprint;
  return {
    ...publicSignal,
    companyName: known?.name ?? publicSignal.companyName,
    companyWebsite: known?.website ?? publicSignal.companyWebsite,
    classification: known ? "known_company" : "new_company",
  };
}

function compareSignals(left: WeeklySignal, right: WeeklySignal): number {
  const dateOrder = right.occurredAt.localeCompare(left.occurredAt);
  if (dateOrder !== 0) return dateOrder;
  const classificationOrder = Number(right.classification === "known_company") - Number(left.classification === "known_company");
  if (classificationOrder !== 0) return classificationOrder;
  return left.stableId.localeCompare(right.stableId);
}

function degradedStatus(sourceId: SourceId, now: Date, reason: string): SourceStatus {
  return {
    id: sourceId,
    label: SOURCES[sourceId].label,
    url: SOURCES[sourceId].url,
    status: "degraded",
    checkedAt: now.toISOString(),
    detail: reason.slice(0, 180),
  };
}

export function buildPipelineOutput({
  now,
  previousDocument,
  previousState,
  settledResults,
}: {
  now: Date;
  previousDocument: WeeklySignalsDocument;
  previousState: WeeklySignalsState;
  settledResults: Array<{ sourceId: SourceId; result: PromiseSettledResult<CollectorResult> }>;
}): PipelineBuild {
  const successes = settledResults.filter(
    (item): item is { sourceId: SourceId; result: PromiseFulfilledResult<CollectorResult> } =>
      item.result.status === "fulfilled",
  );
  if (successes.length === 0) throw new Error("All weekly signal sources failed; generated files were left unchanged");

  const failedSources = new Set(
    settledResults.filter((item) => item.result.status === "rejected").map((item) => item.sourceId),
  );
  const signalCutoff = isoDate(daysAgo(now, WINDOW_DAYS));
  const retentionCutoff = isoDate(daysAgo(now, FINGERPRINT_RETENTION_DAYS));
  const rawSignals = successes.flatMap((item) => item.result.value.signals);
  const newSignals = rawSignals.map(classify);
  const retainedSignals = previousDocument.signals.filter(
    (signal) => failedSources.has(sourceForSignal(signal)) && signal.occurredAt >= signalCutoff,
  );
  const uniqueSignals = new Map<string, WeeklySignal>();
  [...retainedSignals, ...newSignals].forEach((signal) => uniqueSignals.set(signal.stableId, signal));
  const signals = [...uniqueSignals.values()]
    .filter((signal) => signal.occurredAt >= signalCutoff)
    .sort(compareSignals)
    .slice(0, MAX_SIGNALS);

  const fingerprints: Record<string, FingerprintRecord> = Object.fromEntries(
    Object.entries(previousState.fingerprints).filter(([, value]) => value.occurredAt >= retentionCutoff),
  );
  for (const success of successes) {
    Object.assign(fingerprints, success.result.value.fingerprints);
  }

  const newIds: string[] = [];
  const correctedIds: string[] = [];
  for (const [id, record] of Object.entries(fingerprints)) {
    const previous = previousState.fingerprints[id];
    if (!previous) newIds.push(id);
    else if (previous.fingerprint !== record.fingerprint) correctedIds.push(id);
  }

  const statuses = new Map<SourceId, SourceStatus>();
  for (const item of settledResults) {
    if (item.result.status === "fulfilled") statuses.set(item.sourceId, item.result.value.source);
    else {
      const reason = item.result.reason instanceof Error ? item.result.reason.message : String(item.result.reason);
      statuses.set(item.sourceId, degradedStatus(item.sourceId, now, reason));
    }
  }

  return {
    document: {
      version: 1,
      generatedAt: now.toISOString(),
      window: { start: signalCutoff, end: isoDate(now), days: WINDOW_DAYS },
      sources: sourceIds.map((id) => statuses.get(id) ?? degradedStatus(id, now, "Source did not run")),
      signals,
    },
    state: { version: 1, fingerprints },
    newIds: newIds.sort(),
    correctedIds: correctedIds.sort(),
  };
}

function semanticDocument(document: WeeklySignalsDocument): unknown {
  return {
    version: document.version,
    sources: document.sources.map((source) => ({
      id: source.id,
      label: source.label,
      url: source.url,
      status: source.status,
      detail: source.detail,
    })),
    signals: document.signals,
  };
}

export function hasSubstantiveChanges(
  previousDocument: WeeklySignalsDocument,
  previousState: WeeklySignalsState,
  next: PipelineBuild,
): boolean {
  return (
    JSON.stringify(semanticDocument(previousDocument)) !== JSON.stringify(semanticDocument(next.document)) ||
    JSON.stringify(previousState) !== JSON.stringify(next.state)
  );
}

export function summarizeRun(build: PipelineBuild): string {
  const newSet = new Set(build.newIds);
  const visibleNew = build.document.signals.filter((signal) => newSet.has(signal.stableId));
  const knownUpdates = visibleNew.filter((signal) => signal.classification === "known_company");
  const newCompanies = new Set(
    visibleNew.filter((signal) => signal.classification === "new_company").map((signal) => signal.companyName),
  );
  const phaseProgressions = visibleNew.filter((signal) => /phase\s+(ii|iii)/i.test(signal.phase ?? ""));
  const degraded = build.document.sources.filter((source) => source.status === "degraded");
  return [
    "## Weekly Federal Signal refresh",
    "",
    `- Signals in inbox: ${build.document.signals.length}`,
    `- New source records: ${build.newIds.length}`,
    `- Corrected source records: ${build.correctedIds.length}`,
    `- Updates to known candidates: ${knownUpdates.length}`,
    `- Newly surfaced companies: ${newCompanies.size}`,
    `- Phase II/III signals: ${phaseProgressions.length}`,
    `- Degraded sources: ${degraded.length ? degraded.map((source) => source.label).join(", ") : "none"}`,
    "",
    "### Source freshness",
    "",
    ...build.document.sources.map(
      (source) => `- **${source.label}** — ${source.status}; ${source.detail}`,
    ),
    "",
    "### Review queue",
    "",
    ...(build.document.signals.length
      ? build.document.signals.slice(0, 10).map(
          (signal) =>
            `- **${signal.companyName}** — ${signal.agency} ${signal.kind.replace("_", " ")} · ${signal.occurredAt} · [source](${signal.sourceUrl})`,
        )
      : ["- No signals in the current window."]),
  ].join("\n");
}
