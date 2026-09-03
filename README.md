# Federal Signal

Federal Signal is an interview-ready venture-sourcing memo built from public federal R&D data. It screens 1,530 award records, investigates ten companies, and ranks five private, product-led startups for government validation, Microsoft relevance, venture-stage fit, technical defensibility, and founder-market fit.

https://federal-signal.vercel.app/

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
npm test
npm run signals:validate
npm run lint
npm run build
```

## Weekly signal refresh

The sourcing inbox is refreshed remotely by the `Weekly Federal Signals` GitHub Actions workflow. It streams the keyless SBIR bulk dataset and checks official DOD, DOE, and DHS announcement pages. Raw downloads live only in the temporary GitHub runner filesystem.

- Manual runs always execute from the Actions tab.
- Scheduled runs use two UTC triggers plus an Eastern-time guard to run once at 8:00 a.m. every Monday.
- The schedule remains dormant until the repository variable `WEEKLY_SIGNALS_SCHEDULE_ENABLED` is set to `true` after two successful manual runs.
- Changed results update one `automation/weekly-signals` pull request. Vercel supplies its normal Git-connected Preview deployment; merging to `main` publishes production.
- No-change runs do not create a pull request. A failed run leaves the generated data and production site unchanged and retains a diagnostic log for seven days.

The generated inbox and compact 180-day fingerprint manifest live in `src/data/generated`. Git history is the archive; raw CSV and HTML files are never committed. The ranked shortlist remains manually curated.

To exercise the same pipeline locally without retaining the source downloads:

```bash
npm run signals:refresh
npm run signals:validate
```

Set `WEEKLY_SIGNALS_DRY_RUN=true` when you want to check every live source without changing the generated snapshot.

Local dependencies and build output are disposable. When development is finished, removing `node_modules` and `.next` reclaims the space; `npm ci` restores dependencies later.

## Research notes

- Award counts and dollars are anchored to SBIR.gov portfolio pages.
- Private financing is labeled as reported and kept distinct from verified federal dollars.
- Microsoft relevance is an analytical adjacency, not a claimed commercial relationship.
- Evidence is current to September 2, 2026 and should be refreshed before investment use.

Built with Next.js, React, TypeScript, and CSS Modules. Designed for deployment on Vercel.
