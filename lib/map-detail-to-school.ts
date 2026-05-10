import type { SchoolDetailData } from './bundled-types';
import type { School, YearlyData } from './types';

const SG_FALLBACK = { lat: 1.3521, lng: 103.8198 };

function ballotingPressureFromRatio(
  applicants: number,
  vacancies: number
): 'Low' | 'Moderate' | 'High' {
  if (vacancies <= 0 || !Number.isFinite(applicants)) return 'Moderate';
  const r = applicants / vacancies;
  if (r >= 1.5) return 'High';
  if (r >= 1.0) return 'Moderate';
  return 'Low';
}

function pressureToUi(p: 'Low' | 'Moderate' | 'High'): School['pressure'] {
  return p.toLowerCase() as School['pressure'];
}

function distanceBandFromKm(distanceKm: number | null): School['distanceBand'] {
  if (distanceKm == null) return 'unknown';
  if (distanceKm <= 1) return '1km';
  if (distanceKm <= 2) return '1-2km';
  return '2km+';
}

function normalizePhase(phase: string): '2A' | '2B' | '2C' {
  if (phase === '2A' || phase === '2B' || phase === '2C') return phase;
  return '2C';
}

function historyToYearlyData(history: SchoolDetailData['ballotingHistory']): YearlyData[] {
  return [...history]
    .sort((a, b) => b.year - a.year || b.phase.localeCompare(a.phase))
    .map((h) => ({
      year: h.year,
      phase: h.phase,
      vacancies: h.vacancies,
      registered: h.applicants,
      balloted: h.balloted,
      ballotRate:
        h.vacancies > 0 && h.applicants > 0
          ? Math.round((h.vacancies / h.applicants) * 100)
          : undefined,
    }));
}

/**
 * Maps official bundled school detail into UI `School` for a given registration year/phase.
 */
export function detailToSchool(
  detail: SchoolDetailData,
  year: number,
  phase: string
): School {
  const ph = normalizePhase(phase);
  const rec = detail.ballotingHistory.find((h) => h.year === year && h.phase === ph);
  const pressureRaw =
    rec && rec.vacancies > 0
      ? ballotingPressureFromRatio(rec.applicants, rec.vacancies)
      : detail.ballotingPressure;

  const ballotChance =
    rec && rec.vacancies > 0 && rec.applicants > 0
      ? Math.round((rec.vacancies / rec.applicants) * 100)
      : undefined;

  return {
    id: detail.slug,
    name: detail.name,
    address: detail.address,
    postalCode: detail.postalCode,
    distance: detail.distanceKm ?? undefined,
    distanceBand: distanceBandFromKm(detail.distanceKm),
    pressure: pressureToUi(pressureRaw),
    intakeChange: detail.intakeDirection,
    intakeChangeValue: detail.intakeDelta,
    totalVacancies: rec?.vacancies ?? 0,
    registeredStudents: rec?.applicants ?? 0,
    ballotChance,
    ccas: detail.ccas,
    affiliation: detail.affiliation ?? undefined,
    specialPrograms: detail.programmes.length > 0 ? detail.programmes : undefined,
    historicalData: historyToYearlyData(detail.ballotingHistory),
    coordinates: {
      lat: detail.lat ?? SG_FALLBACK.lat,
      lng: detail.lng ?? SG_FALLBACK.lng,
    },
  };
}

export function detailsToSchools(
  details: SchoolDetailData[],
  year: number,
  phase: string
): School[] {
  return details.map((d) => detailToSchool(d, year, phase));
}
