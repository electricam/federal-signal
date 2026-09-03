import * as cheerio from "cheerio";
import { SOURCES, WINDOW_DAYS } from "./config";
import type { Agency, CollectorResult, FingerprintRecord, RawSignal, SourceId } from "./types";
import {
  daysAgo,
  entityKey,
  extractDollarAmount,
  fetchWithRetry,
  fingerprint,
  isoDate,
  matchThemes,
  normalizeCompanyName,
  normalizeWhitespace,
  parseDate,
  stableId,
} from "./utils";

type AnnouncementLink = {
  title: string;
  url: string;
  occurredAt: string;
  context: string;
};

const MONTH_DATE = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2},\s+\d{4}(?!\d)/i;
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/;

function dateFromText(value: string): Date | null {
  const match = value.match(MONTH_DATE) ?? value.match(ISO_DATE);
  return match ? parseDate(match[0]) : null;
}

function absoluteOfficialUrl(href: string, pageUrl: string): string | null {
  try {
    const url = new URL(href, pageUrl);
    const pageHost = new URL(pageUrl).hostname;
    if (url.protocol !== "https:" || url.hostname !== pageHost) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function parseAnnouncementIndex(
  html: string,
  pageUrl: string,
  now: Date,
): { links: AnnouncementLink[]; discoveredCount: number } {
  const $ = cheerio.load(html);
  const cutoff = daysAgo(now, WINDOW_DAYS);
  const modified = parseDate($("meta[property='article:modified_time']").attr("content"));
  const links = new Map<string, AnnouncementLink>();
  let discoveredCount = 0;

  $("a[href]").each((_, element) => {
    const title = normalizeWhitespace($(element).text());
    if (title.length < 12 || title.length > 240) return;
    const url = absoluteOfficialUrl($(element).attr("href") ?? "", pageUrl);
    if (!url || url === pageUrl) return;

    const container = $(element).closest("article, li, .item, .news-item, .views-row, div").first();
    const context = normalizeWhitespace(container.text()).slice(0, 1_500);
    const occurred = dateFromText(context) ?? dateFromText(title) ?? modified;
    if (!occurred || occurred > now || occurred < cutoff) return;

    const isContractRollup = /contracts for/i.test(title);
    const themes = matchThemes(`${title} ${context}`);
    if (!isContractRollup && themes.length === 0) return;
    discoveredCount += 1;
    links.set(url, { title, url, occurredAt: isoDate(occurred), context });
  });

  return { links: [...links.values()], discoveredCount };
}

function extractCompany(title: string): string | null {
  const patterns = [
    /\b(?:awards?|awarded)\b.*?\bto\s+(.+?)(?:\s+for\b|\s+to\b|$)/i,
    /\b(?:selects?|partners? with|invests? in|agreement with)\s+(.+?)(?:\s+for\b|\s+to\b|$)/i,
    /^(.+?)\s+(?:receives?|wins?|awarded)\b/i,
  ];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    const candidate = normalizeWhitespace(match?.[1] ?? "").replace(/[.:;,]+$/, "");
    if (candidate.length >= 2 && candidate.length <= 100) return candidate;
  }
  return null;
}

export function parseDODContractDetail(link: AnnouncementLink, html: string): RawSignal[] {
  const $ = cheerio.load(html);
  const rows = new Map<string, RawSignal>();
  $("article p, main p, .content p, .body p, article li, main li").each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    if (text.length < 80 || !/\b(?:awarded|award|contract|agreement)\b/i.test(text)) return;
    const matchedThemes = matchThemes(text);
    if (matchedThemes.length === 0) return;

    const companyName = normalizeWhitespace(text.split(/,|\s+(?:was|has been|is)\s+awarded\b/i)[0]);
    if (companyName.length < 2 || companyName.length > 120) return;
    const id = stableId("dod", [link.occurredAt, normalizeCompanyName(companyName), text]);
    const rowFingerprint = fingerprint({ companyName, text, occurredAt: link.occurredAt });
    rows.set(id, {
      stableId: id,
      companyName,
      companyWebsite: null,
      agency: "DOD",
      kind: "agency_announcement",
      occurredAt: link.occurredAt,
      awardAmount: extractDollarAmount(text),
      phase: null,
      sourceTitle: link.title,
      sourceUrl: link.url,
      matchedThemes,
      confidence: "medium",
      entityKey: entityKey(companyName, undefined, undefined),
      fingerprint: rowFingerprint,
    });
  });
  return [...rows.values()];
}

function announcementSignal(agency: Agency, sourceId: SourceId, link: AnnouncementLink): RawSignal | null {
  const companyName = extractCompany(link.title);
  const matchedThemes = matchThemes(`${link.title} ${link.context}`);
  if (!companyName || matchedThemes.length === 0) return null;
  const id = stableId(sourceId, [link.url, companyName]);
  const rowFingerprint = fingerprint({ companyName, title: link.title, occurredAt: link.occurredAt });
  return {
    stableId: id,
    companyName,
    companyWebsite: null,
    agency,
    kind: "agency_announcement",
    occurredAt: link.occurredAt,
    awardAmount: extractDollarAmount(`${link.title} ${link.context}`),
    phase: null,
    sourceTitle: link.title,
    sourceUrl: link.url,
    matchedThemes,
    confidence: "low",
    entityKey: entityKey(companyName, undefined, undefined),
    fingerprint: rowFingerprint,
  };
}

export async function collectAgencyPage(sourceId: "dod" | "doe" | "dhs", now: Date): Promise<CollectorResult> {
  const source = SOURCES[sourceId];
  const response = await fetchWithRetry(source.url);
  const html = await response.text();
  const parsed = parseAnnouncementIndex(html, source.url, now);
  const healthDom = cheerio.load(html);
  if (!html.toLowerCase().includes("<html") || healthDom("a[href], main, body").length === 0) {
    throw new Error(`${source.label} returned an unexpected page structure`);
  }

  const agency = sourceId.toUpperCase() as Agency;
  let signals: RawSignal[] = [];
  if (sourceId === "dod") {
    const details = await Promise.allSettled(
      parsed.links
        .filter((link) => /contracts for/i.test(link.title))
        .slice(0, 12)
        .map(async (link) => parseDODContractDetail(link, await (await fetchWithRetry(link.url)).text())),
    );
    signals = details.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    signals.push(
      ...parsed.links
        .filter((link) => !/contracts for/i.test(link.title))
        .map((link) => announcementSignal(agency, sourceId, link))
        .filter((signal): signal is RawSignal => signal !== null),
    );
  } else {
    signals = parsed.links
      .map((link) => announcementSignal(agency, sourceId, link))
      .filter((signal): signal is RawSignal => signal !== null);
  }

  const fingerprints = Object.fromEntries(
    signals.map((signal) => [
      signal.stableId,
      { fingerprint: signal.fingerprint, occurredAt: signal.occurredAt, source: sourceId } satisfies FingerprintRecord,
    ]),
  );
  return {
    source: {
      id: sourceId,
      label: source.label,
      url: source.url,
      status: "healthy",
      checkedAt: now.toISOString(),
      detail: `${parsed.discoveredCount} recent source items checked`,
    },
    signals,
    fingerprints,
    discoveredCount: parsed.discoveredCount,
  };
}
