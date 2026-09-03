"use client";

import { useMemo, useState } from "react";
import {
  alternates,
  candidates,
  scoreLabels,
  screenOuts,
  type Candidate,
  type ScoreBreakdown,
} from "@/data/candidates";
import styles from "./page.module.css";

const sectors = [...new Set(candidates.map((candidate) => candidate.sector))];
const agencies = [...new Set(candidates.flatMap((candidate) => candidate.agencies))].sort();
const scoreKeys = Object.keys(scoreLabels) as Array<keyof ScoreBreakdown>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <article className={styles.candidateCard} aria-labelledby={`candidate-${candidate.rank}`}>
      <div className={styles.cardRail}>
        <span className={styles.rankLabel}>Rank</span>
        <strong>{String(candidate.rank).padStart(2, "0")}</strong>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTopline}>
          <div className={styles.badges}>
            <span>{candidate.sector}</span>
            <span>{candidate.stage}</span>
            {candidate.isAgeException && <span className={styles.exceptionBadge}>Age exception</span>}
          </div>
          <div className={styles.scoreLockup} aria-label={`${candidate.totalScore} out of 100`}>
            <strong>{candidate.totalScore}</strong>
            <span>/ 100</span>
          </div>
        </div>

        <div className={styles.cardIntro}>
          <div>
            <p className={styles.companyMeta}>
              Founded {candidate.foundedYear} · {candidate.headquarters}
            </p>
            <h3 id={`candidate-${candidate.rank}`}>
              <a
                href={candidate.website}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${candidate.name} official website (opens in a new tab)`}
              >
                {candidate.name}
                <span className={styles.companyLinkIcon} aria-hidden="true">↗</span>
              </a>
            </h3>
            {candidate.aliases.length > 0 && (
              <p className={styles.alias}>Also known as {candidate.aliases.join(", ")}</p>
            )}
          </div>
          <p className={styles.thesis}>{candidate.oneLineThesis}</p>
        </div>

        <div className={styles.signalGrid}>
          <div>
            <span>Awards</span>
            <strong>{candidate.awardSignal.awardCount}</strong>
            <small>{candidate.awardSignal.confidence}</small>
          </div>
          <div>
            <span>Phase mix</span>
            <strong>
              {candidate.awardSignal.phaseI} / {candidate.awardSignal.phaseII}
            </strong>
            <small>Phase I / II</small>
          </div>
          <div>
            <span>Federal dollars</span>
            <strong>{formatCurrency(candidate.awardSignal.totalDollars)}</strong>
            <small>verified total</small>
          </div>
          <div>
            <span>Outside capital</span>
            <strong>{candidate.outsideFunding.display}</strong>
            <small>{candidate.outsideFunding.label.replace("-", " ")}</small>
          </div>
        </div>

        <div className={styles.scoreSection}>
          <div className={styles.sectionKicker}>Score anatomy</div>
          <div className={styles.scoreRows}>
            {scoreKeys.map((key) => {
              const value = candidate.scoreBreakdown[key];
              const max = scoreLabels[key].max;
              return (
                <div className={styles.scoreRow} key={key}>
                  <div className={styles.scoreRowLabel}>
                    <span>{scoreLabels[key].label}</span>
                    <strong>
                      {value}<small>/{max}</small>
                    </strong>
                  </div>
                  <div className={styles.scoreTrack} aria-hidden="true">
                    <span style={{ width: `${(value / max) * 100}%` }} />
                  </div>
                  <p>{candidate.scoreNotes[key]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <details className={styles.dossier}>
          <summary>
            <span>Open investment dossier</span>
            <span className={styles.summaryHint}>7 evidence modules</span>
          </summary>
          <div className={styles.dossierGrid}>
            <section>
              <span>Technology</span>
              <p>{candidate.technology}</p>
            </section>
            <section>
              <span>Why now</span>
              <p>{candidate.whyNow}</p>
            </section>
            <section>
              <span>Microsoft adjacency</span>
              <p>{candidate.microsoftAdjacency}</p>
            </section>
            <section>
              <span>Founder evidence</span>
              <p>{candidate.founderEvidence}</p>
            </section>
            <section>
              <span>Commercial evidence</span>
              <p>{candidate.commercialEvidence}</p>
            </section>
            <section className={styles.riskModule}>
              <span>Primary risk</span>
              <p>{candidate.primaryRisk}</p>
            </section>
            <section className={styles.talkModule}>
              <span>Interview talking point</span>
              <p>{candidate.interviewTalkingPoint}</p>
            </section>
          </div>
          <div className={styles.cardSources}>
            <span>Primary source trail</span>
            <div>
              {candidate.sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.label} <ArrowIcon />
                </a>
              ))}
            </div>
          </div>
        </details>
      </div>
    </article>
  );
}

export default function FederalSignal() {
  const [sector, setSector] = useState("all");
  const [agency, setAgency] = useState("all");
  const [maxAge, setMaxAge] = useState(10);
  const [minimumScore, setMinimumScore] = useState(0);

  const visibleCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) =>
          (sector === "all" || candidate.sector === sector) &&
          (agency === "all" || candidate.agencies.includes(agency)) &&
          candidate.age <= maxAge &&
          candidate.totalScore >= minimumScore,
      ),
    [agency, maxAge, minimumScore, sector],
  );

  function resetFilters() {
    setSector("all");
    setAgency("all");
    setMaxAge(10);
    setMinimumScore(0);
  }

  return (
    <main id="top">
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Federal Signal home">
          <span>FS</span>
          <strong>Federal Signal</strong>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#ranking">Ranking</a>
          <a href="#methodology">Methodology</a>
          <a href="#sources">Sources</a>
          <span>02 Sep 2026</span>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>Venture sourcing from public signal</p>
            <h1>Government R&amp;D is an underpriced venture signal.</h1>
          </div>
          <div className={styles.heroAside}>
            <p>
              Federal Signal turns recent awards into a repeatable sourcing edge—then tests for
              company age, venture readiness, technical defensibility, founder depth, and strategic fit.
            </p>
            <span>Independent analysis · Evidence current 02 Sep 2026</span>
          </div>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Research snapshot">
        <div>
          <strong>1,530</strong>
          <span>companies screened</span>
        </div>
        <div>
          <strong>10</strong>
          <span>deeply researched</span>
        </div>
        <div>
          <strong>5</strong>
          <span>finalists</span>
        </div>
        <div>
          <strong>$18.4M</strong>
          <span>verified SBIR/STTR</span>
        </div>
      </section>

      <section className={styles.section} id="ranking">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>01 · Ranked shortlist</p>
            <h2>Five companies worth the next meeting.</h2>
          </div>
          <p>
            Fixed ranking, responsive filters. Every finalist cleared the private, product-led, and
            ten-year eligibility gates; AirMettle is the sole age exception.
          </p>
        </div>

        <div className={styles.filterPanel} aria-label="Candidate filters">
          <label>
            <span>Sector</span>
            <select value={sector} onChange={(event) => setSector(event.target.value)}>
              <option value="all">All sectors</option>
              {sectors.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Agency</span>
            <select value={agency} onChange={(event) => setAgency(event.target.value)}>
              <option value="all">All agencies</option>
              {agencies.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Max company age</span>
            <select value={maxAge} onChange={(event) => setMaxAge(Number(event.target.value))}>
              <option value={10}>10 years</option>
              <option value={7}>7 years</option>
              <option value={5}>5 years</option>
            </select>
          </label>
          <label className={styles.rangeLabel}>
            <span>Minimum score <strong>{minimumScore}</strong></span>
            <input
              type="range"
              min="0"
              max="95"
              step="1"
              value={minimumScore}
              onChange={(event) => setMinimumScore(Number(event.target.value))}
            />
          </label>
          <div className={styles.filterResult} aria-live="polite">
            <span>{visibleCandidates.length} / 5 shown</span>
            <button type="button" onClick={resetFilters}>Reset</button>
          </div>
        </div>

        <div className={styles.candidateList}>
          {visibleCandidates.length > 0 ? (
            visibleCandidates.map((candidate) => (
              <CandidateCard key={candidate.name} candidate={candidate} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <span>00 results</span>
              <h3>No finalist clears this combination.</h3>
              <p>Reset the screen to return to the fixed five-company ranking.</p>
              <button type="button" onClick={resetFilters}>Reset filters</button>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.comparison}`}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>02 · Side-by-side</p>
            <h2>The signal stack at a glance.</h2>
          </div>
          <p>Reported private funding is distinct from verified federal award dollars.</p>
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Rank / company</th>
                <th>Score</th>
                <th>Founded</th>
                <th>Sector</th>
                <th>Awards</th>
                <th>Phase II</th>
                <th>Federal $</th>
                <th>Outside capital</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.name}>
                  <th><span>{String(candidate.rank).padStart(2, "0")}</span>{candidate.name}</th>
                  <td><strong>{candidate.totalScore}</strong></td>
                  <td>{candidate.foundedYear}{candidate.isAgeException && <sup>†</sup>}</td>
                  <td>{candidate.sector}</td>
                  <td>{candidate.awardSignal.awardCount}</td>
                  <td>{candidate.awardSignal.phaseII}</td>
                  <td>{formatCurrency(candidate.awardSignal.totalDollars)}</td>
                  <td>{candidate.outsideFunding.display}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>† Eight-year age exception. Ranking remains fixed when filters are applied.</p>
      </section>

      <section className={`${styles.section} ${styles.watchlist}`}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>03 · Watch list</p>
            <h2>Near misses, with a re-entry condition.</h2>
          </div>
          <p>Alternates are useful only if we can state what evidence would change the decision.</p>
        </div>
        <div className={styles.watchGrid}>
          {alternates.map((alternate) => (
            <article key={alternate.name}>
              <div className={styles.watchTopline}>
                <span>{alternate.status}</span>
                <strong>{alternate.score ?? "—"}</strong>
              </div>
              <h3>{alternate.name}</h3>
              <p>{alternate.reason}</p>
              <div className={styles.changeSignal}>
                <span>What changes the call</span>
                <p>{alternate.changeSignal}</p>
              </div>
              <a href={alternate.sourceUrl} target="_blank" rel="noreferrer noopener">
                Review source <ArrowIcon />
              </a>
            </article>
          ))}
        </div>
        <div className={styles.screenOuts}>
          <span>Explicit screen-outs</span>
          {screenOuts.map((company) => (
            <p key={company.name}>
              <a href={company.url} target="_blank" rel="noreferrer noopener">{company.name} <ArrowIcon /></a>
              {company.reason}
            </p>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.methodology}`} id="methodology">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>04 · Methodology</p>
            <h2>A repeatable screen, not a grant leaderboard.</h2>
          </div>
          <p>Scores express sourcing priority based on public evidence; they are not investment returns or company valuations.</p>
        </div>
        <div className={styles.methodGrid}>
          <div className={styles.methodSteps}>
            <article>
              <span>1</span>
              <div><h3>Start broad</h3><p>Screen 1,530 recent federal-award company records, then investigate ten high-potential candidates across official and independent sources.</p></div>
            </article>
            <article>
              <span>2</span>
              <div><h3>Apply hard gates</h3><p>Private, independently investable, product-led, and no more than ten years old. Ages eight to ten require an explicit exception.</p></div>
            </article>
            <article>
              <span>3</span>
              <div><h3>Score the venture signal</h3><p>Government validation 25, Microsoft relevance 25, venture-stage fit 20, technical defensibility 15, and founder-market fit 15.</p></div>
            </article>
            <article>
              <span>4</span>
              <div><h3>Separate evidence from inference</h3><p>Award totals come from SBIR.gov. Private funding stays labeled “reported.” Microsoft adjacency is a strategic inference—not a claimed relationship.</p></div>
            </article>
          </div>
          <aside className={styles.pitchBox}>
            <span>60-second explanation</span>
            <p>“Federal grants are usually treated as non-dilutive capital. I treat them as customer evidence.”</p>
            <p>A strong candidate shows repeated technical selection, Phase II conversion, a product beyond bespoke services, founder credibility, and a market where Microsoft has a strategic right to win.</p>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sources}`} id="sources">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>05 · Source ledger</p>
            <h2>Every claim should survive a click.</h2>
          </div>
          <p>Government records anchor awards; company materials explain products; institutional sources and reporting triangulate age, team, and financing.</p>
        </div>
        <div className={styles.ledger}>
          {candidates.map((candidate) => (
            <details key={candidate.name}>
              <summary><span>{String(candidate.rank).padStart(2, "0")} · {candidate.name}</span><span>{candidate.sources.length} sources</span></summary>
              <div>
                {candidate.sources.map((source) => (
                  <a href={source.url} target="_blank" rel="noreferrer noopener" key={source.url}>
                    <span className={styles.sourceKind}>{source.kind}</span>
                    <strong>{source.label}</strong>
                    <p>{source.supports}</p>
                    <small>Accessed {source.accessedOn} <ArrowIcon /></small>
                  </a>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerMark}><span>FS</span><strong>Federal Signal</strong></div>
        <p>Independent research for interview discussion. Not affiliated with Microsoft, any government agency, or the companies named. Not investment advice.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
