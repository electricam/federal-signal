import { createHash } from "node:crypto";
import { REQUEST_RETRIES, REQUEST_TIMEOUT_MS, THEME_KEYWORDS, USER_AGENT } from "./config";
import type { Agency } from "./types";

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeCompanyName(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(incorporated|inc|llc|ltd|limited|corporation|corp|company|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function entityKey(company: string, uei: string | undefined, state: string | undefined): string {
  if (uei?.trim()) return `uei:${uei.trim().toUpperCase()}`;
  return `name:${normalizeCompanyName(company)}:${normalizeWhitespace(state ?? "").toLowerCase()}`;
}

export function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function stableId(prefix: string, value: unknown): string {
  return `${prefix}:${fingerprint(value).slice(0, 20)}`;
}

export function matchThemes(value: string): string[] {
  const haystack = normalizeWhitespace(value).toLowerCase();
  return Object.entries(THEME_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([theme]) => theme);
}

export function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function parseDate(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function mapAgency(value: string): Agency | null {
  const agency = value.toLowerCase();
  if (agency.includes("defense") || agency.includes("department of war")) return "DOD";
  if (agency.includes("energy")) return "DOE";
  if (agency.includes("homeland security")) return "DHS";
  return null;
}

export function parseAmount(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/[$,\s]/g, "");
  const number = Number(normalized.replace(/(?:billion|million|[bm])$/i, ""));
  if (!Number.isFinite(number) || number < 0) return null;
  if (/(?:million|m)$/i.test(normalized)) return Math.round(number * 1_000_000);
  if (/(?:billion|b)$/i.test(normalized)) return Math.round(number * 1_000_000_000);
  return Math.round(number);
}

export function safeWebsite(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim().startsWith("http") ? value.trim() : `https://${value.trim()}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/html,application/xhtml+xml,text/csv;q=0.9,*/*;q=0.8", "User-Agent": USER_AGENT },
        redirect: "follow",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < REQUEST_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`Unable to fetch ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

export function extractDollarAmount(value: string): number | null {
  const match = value.match(/\$([\d,.]+)\s*(billion|million|[bm])?/i);
  if (!match) return null;
  const base = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(base)) return null;
  const unit = match[2]?.toLowerCase();
  if (unit === "billion" || unit === "b") return Math.round(base * 1_000_000_000);
  if (unit === "million" || unit === "m") return Math.round(base * 1_000_000);
  return Math.round(base);
}
