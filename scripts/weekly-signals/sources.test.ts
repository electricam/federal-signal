import assert from "node:assert/strict";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { parseAnnouncementIndex, parseDODContractDetail } from "./agency";
import { parseSbirCsv } from "./sbir";
import { entityKey, normalizeCompanyName, parseAmount } from "./utils";

const fixtures = path.join(process.cwd(), "scripts/weekly-signals/fixtures");
const now = new Date("2026-09-03T12:00:00.000Z");

test("SBIR parser filters agencies and themes while retaining 180-day fingerprints", async () => {
  const result = await parseSbirCsv(createReadStream(path.join(fixtures, "sbir.csv")), now);
  assert.equal(result.rowCount, 5);
  assert.equal(result.signals.length, 2);
  assert.equal(Object.keys(result.fingerprints).length, 3);
  assert.equal(result.signals[0].awardAmount, 1_250_000);
  assert.equal(result.signals[1].awardAmount, null);
  assert.equal(result.signals[1].companyWebsite, "https://gridsafe.example/");
});

test("agency index parser tolerates different card containers and ignores old or irrelevant items", async () => {
  const dod = await readFile(path.join(fixtures, "dod-index.html"), "utf8");
  const dhs = await readFile(path.join(fixtures, "dhs-index.html"), "utf8");
  assert.equal(parseAnnouncementIndex(dod, "https://www.war.gov/News/Contracts/", now).links.length, 1);
  const dhsLinks = parseAnnouncementIndex(dhs, "https://www.dhs.gov/science-and-technology/newsroom", now).links;
  assert.equal(dhsLinks.length, 1);
  assert.match(dhsLinks[0].title, /Sentinel Mesh/);
});

test("DOD detail parser extracts only relevant contract paragraphs", async () => {
  const html = await readFile(path.join(fixtures, "dod-detail.html"), "utf8");
  const [link] = parseAnnouncementIndex(
    await readFile(path.join(fixtures, "dod-index.html"), "utf8"),
    "https://www.war.gov/News/Contracts/",
    now,
  ).links;
  const signals = parseDODContractDetail(link, html);
  assert.equal(signals.length, 1);
  assert.equal(signals[0].companyName, "Mesh Defense Systems LLC");
  assert.equal(signals[0].awardAmount, 12_500_000);
  assert.equal(signals[0].kind, "agency_announcement");
});

test("normalization, entity keys, and amount parsing are deterministic", () => {
  assert.equal(normalizeCompanyName("A10 Systems, Inc."), "a10 systems");
  assert.equal(entityKey("Any Name", " abc123 ", "Virginia"), "uei:ABC123");
  assert.equal(parseAmount("$1.5 billion"), 1_500_000_000);
  assert.equal(parseAmount("not disclosed"), null);
});
