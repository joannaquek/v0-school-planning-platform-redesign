#!/usr/bin/env node
/**
 * Import official MOE Primary 1 vacancy totals for all primary schools.
 *
 * Sources (embedded JSON in MOE pages):
 * - Current exercise: available_vacancies per school (179 schools)
 * - Past exercise: phase "0" = annual total; 2A/2B/2C/2CS = phase breakdown
 *
 * Usage (from repo root):
 *   node scripts/import-moe-p1-vacancies.mjs
 *   node scripts/import-moe-p1-vacancies.mjs --dry-run
 *   node scripts/import-moe-p1-vacancies.mjs --current-year 2026 --past-year 2025
 *   node scripts/import-moe-p1-vacancies.mjs --snapshots-dir scripts/moe-p1-snapshots
 *
 * Optional snapshots: save MOE past-vacancies HTML as `{snapshots-dir}/{year}.html`
 * when MOE rotates the past page each year, then re-run to backfill older years.
 *
 * @see https://www.moe.gov.sg/primary/p1-registration/vacancies-and-balloting
 * @see https://www.moe.gov.sg/primary/p1-registration/past-vacancies-and-balloting-data
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MOE_CURRENT_URL,
  MOE_PAST_URL,
  computeIntakeChange,
  fetchMoeHtml,
  mergeBallotingHistoryYear,
  moePhaseRowsForYear,
  normalizeSchoolName,
  parseCurrentVacanciesHtml,
  parsePastVacanciesHtml,
  resolveMoeSchoolName,
  totalApplicantsFromPhases,
} from './lib/moe-p1-vacancies.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_BUNDLE = join(ROOT, 'lib', 'schools-bundled.json');
const ALIASES_PATH = join(ROOT, 'scripts', 'moe-school-name-aliases.json');
const CACHE_PATH = join(ROOT, 'scripts', 'moe-vacancy-cache.json');
const REPORT_PATH = join(ROOT, 'scripts', 'moe-vacancy-import-report.json');
const DEFAULT_SNAPSHOTS_DIR = join(ROOT, 'scripts', 'moe-p1-snapshots');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    dryRun: false,
    bundlePath: DEFAULT_BUNDLE,
    currentYear: 2026,
    pastYear: 2025,
    snapshotsDir: DEFAULT_SNAPSHOTS_DIR,
    skipFetch: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--skip-fetch') out.skipFetch = true;
    else if (arg === '--bundle') out.bundlePath = args[++i];
    else if (arg === '--current-year') out.currentYear = Number(args[++i]);
    else if (arg === '--past-year') out.pastYear = Number(args[++i]);
    else if (arg === '--snapshots-dir') out.snapshotsDir = args[++i];
  }

  return out;
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function upsertSourceLink(sourceLinks, link) {
  const next = Array.isArray(sourceLinks) ? [...sourceLinks] : [];
  const idx = next.findIndex((item) => item.label === link.label);
  if (idx >= 0) next[idx] = link;
  else next.push(link);
  return next;
}

function loadSnapshotPastYears(snapshotsDir) {
  /** @type {Array<{ year: string, parsed: ReturnType<typeof parsePastVacanciesHtml> }>} */
  const snapshots = [];

  if (!existsSync(snapshotsDir)) return snapshots;

  for (const file of readdirSync(snapshotsDir)) {
    const match = file.match(/^(\d{4})\.html$/);
    if (!match) continue;
    const html = readFileSync(join(snapshotsDir, file), 'utf8');
    snapshots.push({
      year: match[1],
      parsed: parsePastVacanciesHtml(html),
    });
  }

  return snapshots.sort((a, b) => Number(b.year) - Number(a.year));
}

function applyPastYearToSchool(school, moeName, year, phases, report) {
  const phaseZero = phases.get('0');
  if (!phaseZero) {
    report.missingPhaseZero.push({ school: school.name, year });
    return;
  }

  school.annualTotalVacancies = {
    ...(school.annualTotalVacancies ?? {}),
    [year]: phaseZero.vacancies,
  };

  const applicants = totalApplicantsFromPhases(phases) || phaseZero.applicants;
  if (applicants > 0) {
    school.annualTotalRegistered = {
      ...(school.annualTotalRegistered ?? {}),
      [year]: applicants,
    };
  }

  const phaseRows = moePhaseRowsForYear(Number(year), phases);
  if (phaseRows.length > 0) {
    school.ballotingHistory = mergeBallotingHistoryYear(
      school.ballotingHistory ?? [],
      Number(year),
      phaseRows
    );
    report.updatedBallotingHistory.push({ school: school.name, year, phases: phaseRows.length });
  }
}

async function main() {
  const args = parseArgs();
  const aliases = readJson(ALIASES_PATH, {});
  const cache = readJson(CACHE_PATH, { annualTotalVacancies: {}, annualTotalRegistered: {} });
  const schools = readJson(args.bundlePath, null);

  if (!Array.isArray(schools)) {
    throw new Error(`Expected array in ${args.bundlePath}`);
  }

  console.log('Fetching MOE vacancy pages…');

  const [currentHtml, pastHtml] = args.skipFetch
    ? [
        readFileSync(join(args.snapshotsDir, `_live-current-${args.currentYear}.html`), 'utf8'),
        readFileSync(join(args.snapshotsDir, `_live-past-${args.pastYear}.html`), 'utf8'),
      ]
    : await Promise.all([fetchMoeHtml(MOE_CURRENT_URL), fetchMoeHtml(MOE_PAST_URL)]);

  const current = parseCurrentVacanciesHtml(currentHtml, String(args.currentYear));
  const past = parsePastVacanciesHtml(pastHtml);
  const snapshotPast = loadSnapshotPastYears(args.snapshotsDir);

  if (current.schoolCount !== 179) {
    console.warn(`Warning: expected 179 MOE current schools, parsed ${current.schoolCount}`);
  }
  if (past.schoolCount !== 179) {
    console.warn(`Warning: expected 179 MOE past schools, parsed ${past.schoolCount}`);
  }

  const report = {
    importedAt: new Date().toISOString(),
    currentYear: args.currentYear,
    pastYear: args.pastYear,
    moeCurrentSchools: current.schoolCount,
    moePastSchools: past.schoolCount,
    matched: [],
    unmatchedBundleSchools: [],
    unmatchedMoeSchools: [],
    missingPhaseZero: [],
    updatedBallotingHistory: [],
    snapshotYearsApplied: [],
  };

  const matchedMoeNames = new Set();

  for (const school of schools) {
    const moeCurrentName = resolveMoeSchoolName(school.name, current.bySchool, aliases);
    const moePastName = resolveMoeSchoolName(school.name, past.bySchool, aliases);

    if (!moeCurrentName && !moePastName) {
      report.unmatchedBundleSchools.push(school.name);
      continue;
    }

    if (moeCurrentName) matchedMoeNames.add(moeCurrentName);
    if (moePastName) matchedMoeNames.add(moePastName);

    // Upcoming exercise total (e.g. 2026)
    if (moeCurrentName) {
      const row = current.bySchool.get(moeCurrentName);
      school.annualTotalVacancies = {
        ...(school.annualTotalVacancies ?? {}),
        [String(args.currentYear)]: row.vacancies,
      };
      cache.annualTotalVacancies[school.slug] = {
        ...(cache.annualTotalVacancies[school.slug] ?? {}),
        [String(args.currentYear)]: row.vacancies,
      };
    }

    // Completed past exercise (e.g. 2025)
    if (moePastName) {
      const yearKey = String(args.pastYear);
      const phases = past.bySchool.get(moePastName)?.get(yearKey);
      if (phases) {
        applyPastYearToSchool(school, moePastName, yearKey, phases, report);
        cache.annualTotalVacancies[school.slug] = {
          ...(cache.annualTotalVacancies[school.slug] ?? {}),
          ...school.annualTotalVacancies,
        };
        if (school.annualTotalRegistered?.[yearKey] != null) {
          cache.annualTotalRegistered[school.slug] = {
            ...(cache.annualTotalRegistered[school.slug] ?? {}),
            [yearKey]: school.annualTotalRegistered[yearKey],
          };
        }
      }
    }

    // Optional HTML snapshots for older years (saved before MOE rotates the past page)
    for (const snapshot of snapshotPast) {
      if (snapshot.year === String(args.pastYear)) continue;
      const moeName = resolveMoeSchoolName(school.name, snapshot.parsed.bySchool, aliases);
      if (!moeName) continue;
      const phases = snapshot.parsed.bySchool.get(moeName)?.get(snapshot.year);
      if (!phases) continue;
      applyPastYearToSchool(school, moeName, snapshot.year, phases, report);
      if (!report.snapshotYearsApplied.includes(snapshot.year)) {
        report.snapshotYearsApplied.push(snapshot.year);
      }
    }

    // Merge cached historical totals (preserves manually snapshotted years)
    const cachedVacancies = cache.annualTotalVacancies[school.slug] ?? {};
    const cachedRegistered = cache.annualTotalRegistered[school.slug] ?? {};
    school.annualTotalVacancies = { ...cachedVacancies, ...(school.annualTotalVacancies ?? {}) };
    school.annualTotalRegistered = { ...cachedRegistered, ...(school.annualTotalRegistered ?? {}) };

    // Recompute intake change from latest two MOE annual totals
    const years = Object.keys(school.annualTotalVacancies)
      .map(Number)
      .filter((year) => Number.isFinite(year))
      .sort((a, b) => a - b);

    if (years.length >= 2) {
      const prevYear = years[years.length - 2];
      const latestYear = years[years.length - 1];
      const intake = computeIntakeChange(
        school.annualTotalVacancies[String(prevYear)],
        school.annualTotalVacancies[String(latestYear)]
      );
      school.intakeDirection = intake.direction;
      school.intakeDelta = intake.delta;
    }

    school.sourceLinks = upsertSourceLink(school.sourceLinks, {
      label: 'MOE — P1 vacancies and balloting (official import)',
      url: MOE_CURRENT_URL,
      lastUpdated: todayIsoDate(),
    });

    report.matched.push({
      school: school.name,
      slug: school.slug,
      moeCurrentName,
      moePastName,
      annualTotalVacancies: school.annualTotalVacancies,
      intakeDirection: school.intakeDirection,
      intakeDelta: school.intakeDelta,
    });
  }

  for (const moeName of current.bySchool.keys()) {
    if (!matchedMoeNames.has(moeName)) {
      report.unmatchedMoeSchools.push(moeName);
    }
  }

  cache.lastImportedAt = report.importedAt;
  cache.currentYear = args.currentYear;
  cache.pastYear = args.pastYear;

  if (args.dryRun) {
    console.log('Dry run — no files written.');
  } else {
    writeFileSync(args.bundlePath, `${JSON.stringify(schools)}\n`, 'utf8');
    writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
    writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    if (!existsSync(args.snapshotsDir)) mkdirSync(args.snapshotsDir, { recursive: true });
    if (!args.skipFetch) {
      writeFileSync(join(args.snapshotsDir, `_live-current-${args.currentYear}.html`), currentHtml);
      writeFileSync(join(args.snapshotsDir, `_live-past-${args.pastYear}.html`), pastHtml);
    }
    console.log(`Updated ${args.bundlePath}`);
    console.log(`Wrote ${REPORT_PATH}`);
  }

  console.log(`Matched ${report.matched.length} / ${schools.length} bundled schools`);
  console.log(`MOE current: ${report.moeCurrentSchools}, past: ${report.moePastSchools}`);
  if (report.unmatchedBundleSchools.length) {
    console.log('Unmatched bundled schools:', report.unmatchedBundleSchools.join(', '));
  }
  if (report.snapshotYearsApplied.length) {
    console.log('Snapshot years applied:', report.snapshotYearsApplied.join(', '));
  }

  const chij = report.matched.find((row) => row.slug === 'chij-our-lady-of-the-nativity');
  if (chij) {
    console.log('CHIJ sample:', JSON.stringify(chij.annualTotalVacancies), 'delta', chij.intakeDelta);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
