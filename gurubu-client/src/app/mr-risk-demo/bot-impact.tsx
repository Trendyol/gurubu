"use client";

import { useId, useMemo, useRef, useState } from "react";
import { IconArrowDown, IconArrowDownRight, IconArrowUpRight, IconChartBar, IconListDetails, IconMinus } from "@tabler/icons-react";
import { Button, Card } from "./dashboard-ui";
import { all, duration, formatNumber, projectLabel, unlinked } from "./risk-dashboard";
import { botFlows, riskBandIndex, riskScoreBands, safeLink, summarize, type RiskRow, type Unit } from "./risk-data";
import styles from "./dashboard.module.scss";

const durationOptions = {
  merge: { label: "Merge duration", phrase: "merge duration" },
  approval: { label: "Time to second approval", phrase: "time to second approval" },
} as const;

type DurationMetric = keyof typeof durationOptions;
const durationKeys = Object.keys(durationOptions) as DurationMetric[];
const measures = [
  { key: "median", label: "Median" },
  { key: "average", label: "Average" },
] as const;

function compareBot(rows: RiskRow[], bot: typeof botFlows[number], metric: DurationMetric) {
  const approved: number[] = [];
  const notApproved: number[] = [];
  for (const row of rows) {
    const value = row[metric];
    if (value === null) continue;
    if (row[bot.key] === true) approved.push(value);
    else notApproved.push(value);
  }
  return { bot, approved: summarize(approved), notApproved: summarize(notApproved) };
}

type Comparison = ReturnType<typeof compareBot>;
type Direction = "faster" | "slower" | "equal";

function comparisonCohorts({ approved, notApproved }: Comparison) {
  return [
    { name: "Approved", key: "approved", stats: approved },
    { name: "Not approved", key: "baseline", stats: notApproved },
  ] as const;
}

function compare(approved: number, baseline: number): Direction {
  const tolerance = Number.EPSILON * Math.max(1, approved, baseline) * 8;
  if (Math.abs(approved - baseline) <= tolerance) return "equal";
  return approved < baseline ? "faster" : "slower";
}

function readout({approved, notApproved}: Comparison) {
  if (approved.median === null || notApproved.median === null || approved.average === null || notApproved.average === null) {
    return { text: "Both groups are needed", tone: "neutral" };
  }
  const median = compare(approved.median, notApproved.median);
  const average = compare(approved.average, notApproved.average);
  if (median === "equal" && average === "equal") return { text: "Same durations on both measures", tone: "neutral" };
  if (median === average) return { text: `${median === "faster" ? "Shorter" : "Longer"} on both measures`, tone: median };
  const label = { faster: "shorter", slower: "longer", equal: "unchanged" };
  return { text: `Median ${label[median]} · Average ${label[average]}`, tone: "neutral" };
}

function Delta({ approved, baseline, unit }: {
  approved: number | null; baseline: number | null; unit: Unit;
}) {
  if (approved === null || baseline === null) return null;
  const direction = compare(approved, baseline);
  if (direction === "equal") return <span className={styles.delta} data-tone="neutral"><IconMinus size={15} />Same duration</span>;
  const absolute = Math.abs(approved - baseline);
  const percent = baseline > 0 ? absolute / baseline * 100 : null;
  const absoluteText = duration(absolute, unit);
  const percentText = percent === null ? null : percent < 0.1 ? "<0.1%" : `${formatNumber.format(percent)}%`;
  const Icon = direction === "faster" ? IconArrowDownRight : IconArrowUpRight;
  return (
    <span className={styles.delta} data-tone={direction}>
      <Icon size={16} />
      {percentText ? `${percentText} ${direction === "faster" ? "shorter" : "longer"}` : `${absoluteText} longer`}
      {percentText && <small>{absoluteText} difference</small>}
    </span>
  );
}

function ComparisonCard({ comparison, metric, scale, unit }: {
  comparison: Comparison; metric: DurationMetric; scale: number; unit: Unit;
}) {
  const { bot, approved, notApproved } = comparison;
  const { text, tone } = readout(comparison);
  const cohorts = comparisonCohorts(comparison);
  return (
    <Card className={styles.impactCard}>
      <div className={styles.impactCardTop}>
        <h2>{bot.label}</h2>
        <span className={styles.impactReadout} data-tone={tone}>{text}</span>
      </div>
      <div className={styles.impactSamples}>
        {cohorts.map(({name, key, stats}) => (
          <span key={key}><i data-cohort={key} />{name} <strong>n={formatNumber.format(stats.count)}</strong></span>
        ))}
      </div>
      {measures.map(({ key, label }) => (
        <section className={styles.impactMeasure} key={key} aria-label={`${label} ${durationOptions[metric].phrase}`}>
          <h3>{label} {durationOptions[metric].phrase}</h3>
          <div className={styles.impactBars}>
            {cohorts.map((cohort) => {
              const value = cohort.stats[key];
              return (
                <div key={cohort.key} className={styles.impactBar}>
                  <span className={styles.impactCohortLabel}>{cohort.name}</span>
                  <span className={styles.impactTrack} aria-hidden="true">
                    {value !== null && <i data-cohort={cohort.key} style={{ width: `${(value / scale) * 100}%` }} />}
                  </span>
                  <strong>{duration(value, unit)}</strong>
                </div>
              );
            })}
          </div>
          <Delta approved={approved[key]} baseline={notApproved[key]} unit={unit} />
        </section>
      ))}
    </Card>
  );
}

type LongestMR = { row: RiskRow; hours: number };
type LongestSelection = { context: string; groups: [string, LongestMR[]][] };

function longestByProject(rows: RiskRow[], metric: DurationMetric, bot: typeof botFlows[number], approved: boolean, project: string) {
  const ranked = rows.flatMap((row) => {
    const hours = row[metric];
    return hours !== null && (row[bot.key] === true) === approved ? [{ row, hours }] : [];
  }).sort((a, b) => b.hours - a.hours || b.row.collectedAt - a.row.collectedAt || a.row.id - b.row.id);

  const groups = new Map<string, LongestMR[]>();
  for (const entry of ranked) {
    const keys = project !== all ? [project] : entry.row.projects.length ? entry.row.projects : [unlinked];
    for (const key of keys) {
      const group = groups.get(key);
      if (!group) groups.set(key, [entry]);
      else if (group.length < 3) group.push(entry);
    }
  }
  return [...groups].sort(([a], [b]) => a === unlinked ? 1 : b === unlinked ? -1 : a.localeCompare(b));
}

function RiskBandComparison({ id, rows, metric, unit, project }: {
  id: string; rows: RiskRow[]; metric: DurationMetric; unit: Unit; project: string;
}) {
  const titleId = useId();
  const [statistic, setStatistic] = useState<(typeof measures)[number]["key"]>("median");
  const [selection, setSelection] = useState<LongestSelection | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogTitle = useId();
  const bandRows = useMemo(() => {
    const bands = riskScoreBands.map(() => [] as RiskRow[]);
    for (const row of rows) {
      const index = riskBandIndex(row.risk);
      if (index !== null) bands[index].push(row);
    }
    return bands;
  }, [rows]);
  const byBot = useMemo(() => botFlows.map((bot) => ({
    bot,
    comparisons: bandRows.map((group) => compareBot(group, bot, metric)),
  })), [bandRows, metric]);

  function showLongest(bot: typeof botFlows[number], bandIndex: number, approved: boolean, label: string) {
    setSelection({
      context: `${bot.label} · Risk score ${riskScoreBands[bandIndex].label} · ${label}`,
      groups: longestByProject(bandRows[bandIndex], metric, bot, approved, project),
    });
    dialog.current?.showModal();
  }
  const scale = Math.max(0, ...byBot.flatMap(({ comparisons }) =>
    comparisons.flatMap(({ approved, notApproved }) => [approved[statistic] ?? 0, notApproved[statistic] ?? 0]))) || 1;

  return (
    <section id={id} className={styles.bandSection} aria-labelledby={titleId}>
      <header className={styles.bandHeader}>
        <div>
          <h2 id={titleId}>{durationOptions[metric].label} by risk score</h2>
          <p>Approved and not-approved MRs by score band. Both bots use the same scale.</p>
        </div>
        <div className={styles.impactMetricSwitch} role="group" aria-label={`${durationOptions[metric].label} statistic`}>
          {measures.map(({ key, label }) => (
            <button key={key} type="button" aria-pressed={statistic === key} onClick={() => setStatistic(key)}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.impactGrid}>
        {byBot.map(({ bot, comparisons }) => (
          <Card key={bot.key} className={styles.impactCard}>
            <h3 className={styles.bandBotTitle}>{bot.label}</h3>
            <ol className={styles.bandRows} aria-label={`${bot.label} risk score bands`}>
              {riskScoreBands.map((band, index) => (
                <li key={band.label} className={styles.bandRow} data-tone={"tone" in band ? band.tone : undefined}>
                  <div className={styles.bandLabel}>
                    <strong>{band.label}</strong>
                    {"threshold" in band && <span>{band.threshold}</span>}
                  </div>
                  <div className={styles.bandBars}>
                    {comparisonCohorts(comparisons[index]).map(({ name, key, stats }) => (
                      <button
                        type="button"
                        className={styles.bandBar}
                        key={key}
                        disabled={stats.count === 0}
                        aria-haspopup="dialog"
                        aria-label={`Show longest MRs for ${bot.label}, risk score ${band.label}, ${name}. ${duration(stats[statistic], unit)}, ${stats.count} MRs`}
                        onClick={() => showLongest(bot, index, key === "approved", name)}
                      >
                        <span className={styles.impactCohortLabel}>{name}</span>
                        <span className={styles.impactTrack} aria-hidden="true">
                          {stats[statistic] !== null && <i data-cohort={key} style={{ width: `${(stats[statistic] / scale) * 100}%` }} />}
                        </span>
                        <strong>{duration(stats[statistic], unit)}</strong>
                        <small>n={formatNumber.format(stats.count)}</small>
                        <IconListDetails className={styles.bandDrillIcon} size={13} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
      <p className={styles.analysisNote}>Each bar uses MRs with a recorded risk score and duration. Select a bar to see up to three of the longest MRs per Jira project.</p>
      <dialog ref={dialog} className={`${styles.dateDialog} ${styles.longestDialog}`} aria-labelledby={dialogTitle}
        onClose={() => setSelection(null)}>
        <div className={styles.longestHeading}>
          <div>
            <h2 id={dialogTitle}>{metric === "merge" ? "Longest merge durations" : "Longest times to second approval"}</h2>
            <p>{selection?.context}</p>
          </div>
          <Button onClick={() => dialog.current?.close()}>Close</Button>
        </div>
        {selection && (
          <div className={styles.longestGroups}>
            {selection.groups.map(([key, entries]) => (
              <section key={key} aria-label={projectLabel(key)} className={styles.longestProject}>
                <h3>{projectLabel(key)}</h3>
                <ol>
                  {entries.map(({ row, hours }) => {
                    const link = safeLink(row.link);
                    const title = row.title || row.issue || "Merge request";
                    return (
                      <li key={row.id}>
                        <div className={styles.longestMR}>
                          {link ? <a href={link} target="_blank" rel="noreferrer">{title} <IconArrowUpRight size={13} aria-hidden="true" /></a> : title}
                          {row.issue && <span>{row.issue}</span>}
                        </div>
                        <strong>{duration(hours, unit)}</strong>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        )}
      </dialog>
    </section>
  );
}

export default function BotImpact({ rows, unit, project, loaded }: { rows: RiskRow[]; unit: Unit; project: string; loaded: boolean }) {
  const [metric, setMetric] = useState<DurationMetric>("merge");
  const comparisons = useMemo(() => botFlows.map((bot) => compareBot(rows, bot, metric)), [rows, metric]);
  const scale = Math.max(0, ...comparisons.flatMap(({ approved, notApproved }) =>
    [approved.median, approved.average, notApproved.median, notApproved.average].map((value) => value ?? 0))) || 1;
  if (!loaded) {
    return <Card className={styles.impactEmpty}><IconChartBar size={25} /> Import a CSV to compare bot approval groups.</Card>;
  }
  return (
    <section className={styles.impact} aria-label="Bot approval comparisons">
      <div className={styles.impactControls}>
        <div className={styles.impactMetricSwitch} role="group" aria-label="Duration to compare">
          {durationKeys.map((key) => (
            <button key={key} type="button" aria-pressed={metric === key} onClick={() => setMetric(key)}>
              {durationOptions[key].label}
            </button>
          ))}
        </div>
        <div className={styles.impactJumps} role="group" aria-label="Compare by risk score">
          <a href="#risk-band-comparison">Merge by risk score <IconArrowDown size={15} /></a>
          <a href="#second-approval-by-risk-score">Second approval by risk score <IconArrowDown size={15} /></a>
        </div>
      </div>
      <div className={styles.impactGrid}>
        {comparisons.map((comparison) => (
          <ComparisonCard key={comparison.bot.key} comparison={comparison} metric={metric} scale={scale} unit={unit} />
        ))}
      </div>
      <details className={styles.impactMethod}>
        <summary>How to read the comparison</summary>
        <p>Each group includes MRs with a recorded {durationOptions[metric].phrase}. The median describes a typical MR. Long-running MRs can pull the average up.</p>
        <p>Not approved includes explicit non-approvals and unreported bot results.</p>
        <p>Percentage differences use the not-approved group as the baseline. Bars start at zero and share one duration scale across both bots.</p>
        <p>These are observed differences. Project, risk and change size can also influence duration.</p>
      </details>
      <RiskBandComparison id="risk-band-comparison" rows={rows} metric="merge" unit={unit} project={project} />
      <RiskBandComparison id="second-approval-by-risk-score" rows={rows} metric="approval" unit={unit} project={project} />
    </section>
  );
}
