/**
 * Fetch and parse MOE Primary 1 vacancy data embedded in official MOE pages.
 *
 * @see https://www.moe.gov.sg/primary/p1-registration/vacancies-and-balloting
 * @see https://www.moe.gov.sg/primary/p1-registration/past-vacancies-and-balloting-data
 */

export const MOE_CURRENT_URL =
  'https://www.moe.gov.sg/primary/p1-registration/vacancies-and-balloting';

export const MOE_PAST_URL =
  'https://www.moe.gov.sg/primary/p1-registration/past-vacancies-and-balloting-data';

const CURRENT_RECORD_RE =
  /\\"school_name\\":\\"((?:\\\\.|[^"\\])*)\\",\\"no_vacancies\\":(?:true|false),\\"no_vacancies_this_phase\\":(?:true|false),\\"reserved_vacancies\\":\\"(\d+)\\",\\"available_vacancies\\":\\"(\d+)\\"/g;

const PAST_PHASE_RECORD_RE =
  /\\"school_name\\":\\"((?:\\\\.|[^"\\])*)\\",\\"phase\\":\\"([^"\\]*)\\",\\"year\\":\\"(\d{4})\\",\\"total_vacancies\\":\\"(\d+)\\",\\"total_applicants\\":\\"(\d+)\\"/g;

const PAST_PHASE_RECORD_RE_PLAIN =
  /"school_name":"((?:\\.|[^"\\])*)","phase":"([^"]*)","year":"(\d{4})","total_vacancies":"(\d+)","total_applicants":"(\d+)"/g;

export function normalizeSchoolName(name) {
  return name
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function unescapeMoeString(value) {
  return value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

export async function fetchMoeHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SchoolMatchMOEImport/1.0)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`MOE fetch failed (${response.status}) for ${url}`);
  }

  return response.text();
}

/**
 * Upcoming registration exercise totals (e.g. 2026 exercise → stored under that year).
 */
export function parseCurrentVacanciesHtml(html, registrationYear) {
  /** @type {Map<string, { vacancies: number, reserved: number }>} */
  const bySchool = new Map();

  for (const match of html.matchAll(CURRENT_RECORD_RE)) {
    const name = normalizeSchoolName(match[1]);
    bySchool.set(name, {
      reserved: Number(match[2]),
      vacancies: Number(match[3]),
    });
  }

  return {
    registrationYear,
    bySchool,
    schoolCount: bySchool.size,
  };
}

/**
 * Completed registration exercise with phase breakdown.
 * MOE phase "0" is the official annual total (not the sum of 2A+2B+2C).
 */
export function parsePastVacanciesHtml(html) {
  /** @type {Map<string, Map<string, Map<string, { vacancies: number, applicants: number }>>>} */
  const bySchool = new Map();

  const applyMatch = (nameRaw, phase, year, vacancies, applicants) => {
    const name = normalizeSchoolName(nameRaw);
    if (!bySchool.has(name)) bySchool.set(name, new Map());
    const byYear = bySchool.get(name);
    if (!byYear.has(year)) byYear.set(year, new Map());
    byYear.get(year).set(phase, {
      vacancies: Number(vacancies),
      applicants: Number(applicants),
    });
  };

  for (const match of html.matchAll(PAST_PHASE_RECORD_RE)) {
    applyMatch(match[1], match[2], match[3], match[4], match[5]);
  }

  for (const match of html.matchAll(PAST_PHASE_RECORD_RE_PLAIN)) {
    applyMatch(unescapeMoeString(match[1]), match[2], match[3], match[4], match[5]);
  }

  let registrationYear = null;
  for (const years of bySchool.values()) {
    for (const year of years.keys()) {
      registrationYear = registrationYear == null ? year : registrationYear;
    }
  }

  return {
    registrationYear,
    bySchool,
    schoolCount: bySchool.size,
  };
}

export function resolveMoeSchoolName(bundleName, moeBySchool, aliases = {}) {
  const normalizedBundle = normalizeSchoolName(bundleName);
  const aliasTarget = aliases[normalizedBundle];
  const candidates = [normalizedBundle, aliasTarget].filter(Boolean);

  for (const candidate of candidates) {
    if (moeBySchool.has(candidate)) return candidate;
  }

  // Loose match: strip punctuation and compare
  const loose = (value) => value.replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const bundleLoose = loose(normalizedBundle);
  for (const [moeName] of moeBySchool) {
    if (loose(moeName) === bundleLoose) return moeName;
  }

  return null;
}

export function computeIntakeChange(currentTotal, nextTotal) {
  if (!(currentTotal > 0 && nextTotal > 0)) {
    return { direction: 'no-change', delta: 0 };
  }

  const delta = nextTotal - currentTotal;
  if (delta > 0) return { direction: 'increase', delta };
  if (delta < 0) return { direction: 'decrease', delta };
  return { direction: 'no-change', delta: 0 };
}

export function mergeBallotingHistoryYear(existingHistory, year, phaseRows) {
  const retained = existingHistory.filter((row) => row.year !== year);
  const next = [...retained, ...phaseRows];
  next.sort((a, b) => b.year - a.year || b.phase.localeCompare(a.phase));
  return next;
}

export function moePhaseRowsForYear(year, phases) {
  const mapPhase = {
    '2A': '2A',
    '2B': '2B',
    '2C': '2C',
    '2CS': '2C',
  };

  /** @type {Array<{ year: number, phase: '2A'|'2B'|'2C', vacancies: number, applicants: number, balloted: boolean }>} */
  const rows = [];

  for (const [phase, data] of phases.entries()) {
    const uiPhase = mapPhase[phase];
    if (!uiPhase) continue;

    const existingIdx = rows.findIndex((row) => row.phase === uiPhase);
    const balloted = data.vacancies > 0 && data.applicants > data.vacancies;

    if (existingIdx >= 0) {
      // Prefer 2C over 2CS when both exist
      if (phase === '2C') {
        rows[existingIdx] = {
          year,
          phase: uiPhase,
          vacancies: data.vacancies,
          applicants: data.applicants,
          balloted,
        };
      }
      continue;
    }

    rows.push({
      year,
      phase: uiPhase,
      vacancies: data.vacancies,
      applicants: data.applicants,
      balloted,
    });
  }

  return rows;
}

export function totalApplicantsFromPhases(phases) {
  let total = 0;
  for (const phase of ['2A', '2B', '2C', '2CS']) {
    const data = phases.get(phase);
    if (data) total += data.applicants;
  }
  return total;
}
