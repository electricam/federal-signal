import type { SourceId } from "./types";

export const WINDOW_DAYS = 30 as const;
export const FINGERPRINT_RETENTION_DAYS = 180;
export const MAX_SIGNALS = 20;
export const REQUEST_TIMEOUT_MS = 20_000;
export const REQUEST_RETRIES = 3;
export const USER_AGENT =
  "FederalSignalBot/1.0 (+https://github.com/electricam/federal-signal; public-source monitor)";

export const SOURCES: Record<SourceId, { label: string; url: string }> = {
  sbir: {
    label: "SBIR/STTR bulk awards",
    url: "https://data.www.sbir.gov/mod_awarddatapublic_no_abstract/award_data_no_abstract.csv",
  },
  dod: {
    label: "Department of War contracts",
    url: "https://www.war.gov/News/Contracts/",
  },
  doe: {
    label: "DOE SBIR awards",
    url: "https://science.osti.gov/sbir/Awards",
  },
  dhs: {
    label: "DHS S&T newsroom",
    url: "https://www.dhs.gov/science-and-technology/newsroom",
  },
};

export const THEME_KEYWORDS = {
  "networking & security": [
    "5g",
    "6g",
    "cyber",
    "network",
    "spectrum",
    "zero trust",
    "communications",
    "electronic warfare",
  ],
  "space infrastructure": [
    "satellite",
    "spacecraft",
    "orbital",
    "remote sensing",
    "geospatial",
    "vleo",
    "space infrastructure",
  ],
  "energy storage": [
    "battery",
    "energy storage",
    "grid resilience",
    "long duration storage",
    "power electronics",
    "microgrid",
  ],
  "advanced manufacturing": [
    "additive manufacturing",
    "advanced manufacturing",
    "robotic manufacturing",
    "microfactory",
    "industrial automation",
    "digital manufacturing",
  ],
  "data infrastructure": [
    "data infrastructure",
    "data platform",
    "database",
    "cloud computing",
    "edge computing",
    "artificial intelligence",
    "machine learning",
    "data center",
  ],
} as const;

export type Theme = keyof typeof THEME_KEYWORDS;
