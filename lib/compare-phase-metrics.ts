import type { School } from './types';
import { phases } from './filter-options';

export type RegistrationPhase = (typeof phases)[number];

export type PhaseRegistrationSnapshot = {
  registered: number;
  vacancies: number;
  /** registered ÷ vacancies × 100 */
  fillPercent: number;
  label: string;
};

/** Visual demand level from registered/vacancies fill %. */
export type PhaseFillIntensity = 'comfortable' | 'high' | 'oversubscribed';

export function getPhaseFillIntensity(fillPercent: number): PhaseFillIntensity {
  if (fillPercent > 150) return 'oversubscribed';
  if (fillPercent > 100) return 'high';
  return 'comfortable';
}

/** registered ÷ vacancies × 100 — same as compare table “% fill”. */
export function computePhaseFillPercent(registered: number, vacancies: number): number | undefined {
  if (vacancies <= 0 || !Number.isFinite(registered)) return undefined;
  return Math.round((registered / vacancies) * 100);
}

export function getPhaseRegistrationSnapshot(
  school: School,
  year: number,
  phase: RegistrationPhase
): PhaseRegistrationSnapshot | null {
  const row = school.historicalData.find((d) => d.year === year && d.phase === phase);
  if (!row || row.vacancies <= 0) return null;

  const fillPercent = computePhaseFillPercent(row.registered, row.vacancies) ?? 0;
  return {
    registered: row.registered,
    vacancies: row.vacancies,
    fillPercent,
    label: `${row.registered}/${row.vacancies}`,
  };
}

export function getPhaseFillRatio(school: School, year: number, phase: RegistrationPhase): number | null {
  const snapshot = getPhaseRegistrationSnapshot(school, year, phase);
  if (!snapshot) return null;
  return snapshot.registered / snapshot.vacancies;
}

export const compareDrawerMetrics = [
  { key: 'distance' as const, label: 'Distance' },
  ...phases.map((phase) => ({ key: phase, label: `Phase ${phase}` })),
];

export type CompareDrawerMetricKey = (typeof compareDrawerMetrics)[number]['key'];
