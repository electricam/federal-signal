import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { collectAgencyPage } from "./agency";
import { collectSbir } from "./sbir";
import { buildPipelineOutput, hasSubstantiveChanges, summarizeRun } from "./pipeline";
import type { CollectorResult, SourceId, WeeklySignalsDocument, WeeklySignalsState } from "./types";

const root = process.cwd();
const documentPath = path.join(root, "src/data/generated/weekly-signals.json");
const statePath = path.join(root, "src/data/generated/weekly-signals-state.json");

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function main() {
  const now = process.env.WEEKLY_SIGNALS_NOW ? new Date(process.env.WEEKLY_SIGNALS_NOW) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error("WEEKLY_SIGNALS_NOW must be a valid date when provided");
  const previousDocument = await readJson<WeeklySignalsDocument>(documentPath);
  const previousState = await readJson<WeeklySignalsState>(statePath);
  const collectors: Array<{ sourceId: SourceId; task: Promise<CollectorResult> }> = [
    { sourceId: "sbir", task: collectSbir(now) },
    { sourceId: "dod", task: collectAgencyPage("dod", now) },
    { sourceId: "doe", task: collectAgencyPage("doe", now) },
    { sourceId: "dhs", task: collectAgencyPage("dhs", now) },
  ];
  const settled = await Promise.allSettled(collectors.map((collector) => collector.task));
  const build = buildPipelineOutput({
    now,
    previousDocument,
    previousState,
    settledResults: collectors.map((collector, index) => ({ sourceId: collector.sourceId, result: settled[index] })),
  });
  const summary = summarizeRun(build);
  const summaryPath = process.env.WEEKLY_SIGNALS_SUMMARY_PATH ?? path.join(tmpdir(), "weekly-signals-summary.md");
  await writeFile(summaryPath, `${summary}\n`, "utf8");
  if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, { flag: "a" });

  if (process.env.WEEKLY_SIGNALS_DRY_RUN === "true") {
    console.log(`Dry run completed with ${build.document.signals.length} visible signals; generated files left untouched.`);
    return;
  }

  if (!hasSubstantiveChanges(previousDocument, previousState, build)) {
    console.log("No substantive signal changes; generated files left untouched.");
    return;
  }
  await Promise.all([
    writeFile(documentPath, `${JSON.stringify(build.document, null, 2)}\n`, "utf8"),
    writeFile(statePath, `${JSON.stringify(build.state, null, 2)}\n`, "utf8"),
  ]);
  console.log(`Updated ${build.document.signals.length} visible signals (${build.newIds.length} new, ${build.correctedIds.length} corrected).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
