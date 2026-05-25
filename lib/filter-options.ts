import {
  plannerPhases,
  registrationPhaseFootnotes as moeRegistrationPhaseFootnotes,
} from './p1-registration-phases';

/** Matches phases present in p1-school-selector ballot scrape / bundled JSON. */
export const phases = plannerPhases;

/** Short parent-facing notes for the registration phase selector (see /guide, docs/p1-registration-phases.md). */
export const registrationPhaseFootnotes: Record<
  (typeof phases)[number],
  { label: string; summary: string }
> = {
  '2A': {
    label: moeRegistrationPhaseFootnotes['2A'].label,
    summary: moeRegistrationPhaseFootnotes['2A'].summary,
  },
  '2B': {
    label: moeRegistrationPhaseFootnotes['2B'].label,
    summary: moeRegistrationPhaseFootnotes['2B'].summary,
  },
  '2C': {
    label: moeRegistrationPhaseFootnotes['2C'].label,
    summary: moeRegistrationPhaseFootnotes['2C'].summary,
  },
};

export function isRegistrationPhase(phase: string): phase is (typeof phases)[number] {
  return (phases as readonly string[]).includes(phase);
}

/**
 * Years with published MOE P1 registration totals in bundled data.
 * Exclude 2026 until the July 2026 exercise (2027 intake) data is available.
 */
export const years = ['2025', '2024', '2023', '2022', '2021', '2020'] as const;

export function resolveRegistrationYear(year: string): (typeof years)[number] {
  return (years as readonly string[]).includes(year) ? (year as (typeof years)[number]) : years[0];
}

export const distanceBands = [
  { value: 'within-1', label: 'Within 1km (0–1km)' },
  { value: 'within-2', label: 'Within 2km (0–2km)' },
  { value: '1', label: 'Within 1km' },
  { value: '2', label: '1-2km' },
  { value: '3', label: 'Over 2km' },
  { value: 'all', label: 'All distances' },
] as const;

export const pressureLevels = [
  { value: 'all', label: 'All pressure levels' },
  { value: 'low', label: 'Low pressure' },
  { value: 'moderate', label: 'Moderate pressure' },
  { value: 'high', label: 'High pressure' },
] as const;
