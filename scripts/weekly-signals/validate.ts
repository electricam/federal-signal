import { readFile } from "node:fs/promises";
import path from "node:path";
import { MAX_SIGNALS, SOURCES, WINDOW_DAYS } from "./config";
import { sourceIds, type WeeklySignalsDocument, type WeeklySignalsState } from "./types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isOfficialSource(urlValue: string): boolean {
  const host = new URL(urlValue).hostname;
  return ["sbir.gov", "www.sbir.gov", "data.www.sbir.gov", "war.gov", "www.war.gov", "science.osti.gov", "dhs.gov", "www.dhs.gov"].includes(host);
}

async function main() {
  const generated = path.join(process.cwd(), "src/data/generated");
  const document = JSON.parse(await readFile(path.join(generated, "weekly-signals.json"), "utf8")) as WeeklySignalsDocument;
  const state = JSON.parse(await readFile(path.join(generated, "weekly-signals-state.json"), "utf8")) as WeeklySignalsState;

  assert(document.version === 1, "Unsupported weekly signals document version");
  assert(document.window.days === WINDOW_DAYS, `Signal window must be ${WINDOW_DAYS} days`);
  assert(document.sources.length === sourceIds.length, "Every configured source must have a status");
  assert(document.sources.every((source, index) => source.id === sourceIds[index]), "Source statuses are not in canonical order");
  assert(document.sources.every((source) => source.url === SOURCES[source.id].url), "Source status URL does not match configuration");
  assert(document.signals.length <= MAX_SIGNALS, `Inbox cannot exceed ${MAX_SIGNALS} signals`);

  const ids = new Set<string>();
  for (const signal of document.signals) {
    assert(!ids.has(signal.stableId), `Duplicate signal ID: ${signal.stableId}`);
    ids.add(signal.stableId);
    assert(signal.companyName.trim().length > 1, `Signal ${signal.stableId} has no company name`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(signal.occurredAt), `Signal ${signal.stableId} has an invalid date`);
    assert(signal.awardAmount === null || (Number.isInteger(signal.awardAmount) && signal.awardAmount >= 0), `Signal ${signal.stableId} has an invalid amount`);
    assert(signal.matchedThemes.length > 0, `Signal ${signal.stableId} has no matched themes`);
    assert(isOfficialSource(signal.sourceUrl), `Signal ${signal.stableId} does not link to an approved official host`);
    if (signal.companyWebsite) {
      const url = new URL(signal.companyWebsite);
      assert(url.protocol === "https:" || url.protocol === "http:", `Signal ${signal.stableId} has an invalid company website`);
    }
  }
  const sorted = [...document.signals].sort((left, right) => {
    const dateOrder = right.occurredAt.localeCompare(left.occurredAt);
    if (dateOrder) return dateOrder;
    const knownOrder = Number(right.classification === "known_company") - Number(left.classification === "known_company");
    return knownOrder || left.stableId.localeCompare(right.stableId);
  });
  assert(JSON.stringify(sorted) === JSON.stringify(document.signals), "Signals are not deterministically sorted");
  assert(state.version === 1 && typeof state.fingerprints === "object", "Invalid state manifest");
  console.log(`Validated ${document.signals.length} signals and ${Object.keys(state.fingerprints).length} fingerprints.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
