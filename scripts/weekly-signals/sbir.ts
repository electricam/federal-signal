import { Readable } from "node:stream";
import { parse } from "csv-parse";
import { FINGERPRINT_RETENTION_DAYS, SOURCES, WINDOW_DAYS } from "./config";
import type { CollectorResult, FingerprintRecord, RawSignal } from "./types";
import {
  daysAgo,
  entityKey,
  fetchWithRetry,
  fingerprint,
  isoDate,
  mapAgency,
  matchThemes,
  normalizeWhitespace,
  parseAmount,
  parseDate,
  safeWebsite,
  stableId,
} from "./utils";

type SbirRow = Record<string, string | undefined>;

export async function parseSbirCsv(
  input: NodeJS.ReadableStream,
  now: Date,
): Promise<{ signals: RawSignal[]; fingerprints: Record<string, FingerprintRecord>; rowCount: number }> {
  const parser = input.pipe(
    parse({
      bom: true,
      columns: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }),
  );

  const signalCutoff = daysAgo(now, WINDOW_DAYS);
  const retentionCutoff = daysAgo(now, FINGERPRINT_RETENTION_DAYS);
  const signals: RawSignal[] = [];
  const fingerprints: Record<string, FingerprintRecord> = {};
  let rowCount = 0;

  for await (const rawRow of parser) {
    rowCount += 1;
    const row = rawRow as SbirRow;
    const agency = mapAgency(row.Agency ?? "");
    if (!agency) continue;

    const companyName = normalizeWhitespace(row.Company ?? "");
    const title = normalizeWhitespace(row["Award Title"] ?? "");
    const occurred =
      parseDate(row["Proposal Award Date"]) ??
      parseDate(row["Date of Notification"]) ??
      parseDate(row["Award Year"] ? `${row["Award Year"]}-01-01` : undefined);
    if (!companyName || !title || !occurred || occurred > now || occurred < retentionCutoff) continue;

    const matchedThemes = matchThemes(title);
    if (matchedThemes.length === 0) continue;

    const awardKey = normalizeWhitespace(
      row.Contract ?? row["Agency Tracking Number"] ?? row["Solicitation Number"] ?? "",
    );
    const id = awardKey
      ? `sbir:${agency.toLowerCase()}:${awardKey.toLowerCase()}`
      : stableId("sbir", [agency, companyName, title, isoDate(occurred)]);
    const awardAmount = parseAmount(row["Award Amount"]);
    const phase = normalizeWhitespace(row.Phase ?? "") || null;
    const rowFingerprint = fingerprint({
      agency,
      companyName,
      title,
      occurredAt: isoDate(occurred),
      awardAmount,
      phase,
      uei: row.UEI?.trim().toUpperCase() || null,
    });

    fingerprints[id] = {
      fingerprint: rowFingerprint,
      occurredAt: isoDate(occurred),
      source: "sbir",
    };

    if (occurred < signalCutoff) continue;
    signals.push({
      stableId: id,
      companyName,
      companyWebsite: safeWebsite(row["Company Website"]),
      agency,
      kind: "sbir_award",
      occurredAt: isoDate(occurred),
      awardAmount,
      phase,
      sourceTitle: title,
      sourceUrl: "https://www.sbir.gov/portfolio",
      matchedThemes,
      confidence: row.UEI?.trim() ? "high" : "medium",
      entityKey: entityKey(companyName, row.UEI, row.State),
      fingerprint: rowFingerprint,
    });
  }

  return { signals, fingerprints, rowCount };
}

export async function collectSbir(now: Date, minimumRows = 1_000): Promise<CollectorResult> {
  const checkedAt = now.toISOString();
  const response = await fetchWithRetry(SOURCES.sbir.url);
  if (!response.body) throw new Error("SBIR response did not include a body");
  const result = await parseSbirCsv(Readable.fromWeb(response.body as never), now);
  if (result.rowCount < minimumRows) {
    throw new Error(`SBIR dataset contained only ${result.rowCount} rows; expected at least ${minimumRows}`);
  }
  return {
    source: {
      id: "sbir",
      label: SOURCES.sbir.label,
      url: SOURCES.sbir.url,
      status: "healthy",
      checkedAt,
      detail: `${result.rowCount.toLocaleString("en-US")} award rows scanned`,
    },
    signals: result.signals,
    fingerprints: result.fingerprints,
    discoveredCount: result.rowCount,
  };
}
