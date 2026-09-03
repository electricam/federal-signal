# Federal Signal

Federal Signal is an interview-ready venture-sourcing memo built from public federal R&D data. It screens 1,530 award records, investigates ten companies, and ranks five private, product-led startups for government validation, Microsoft relevance, venture-stage fit, technical defensibility, and founder-market fit.

## Shortlist

| Rank | Company | Score |
| --- | --- | ---: |
| 1 | AiRANACULUS | 92 |
| 2 | Albedo | 90 |
| 3 | Adena Power | 88 |
| 4 | Solideon | 87 |
| 5 | AirMettle | 84 |

The page includes fixed-rank filtering, expandable evidence dossiers, a comparison table, explicit alternates and screen-outs, methodology, and a claim-level source ledger.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run build
```

## Research notes

- Award counts and dollars are anchored to SBIR.gov portfolio pages.
- Private financing is labeled as reported and kept distinct from verified federal dollars.
- Microsoft relevance is an analytical adjacency, not a claimed commercial relationship.
- Evidence is current to September 2, 2026 and should be refreshed before investment use.

Built with Next.js, React, TypeScript, and CSS Modules. Designed for deployment on Vercel.
