import type { EligibilityFilter } from './types';

/** Matches phases present in p1-school-selector ballot scrape / bundled JSON. */
export const phases = ['2A', '2B', '2C'] as const;

/** Years typically present after running `data:build` in p1-school-selector (update when MOE adds rows). */
export const years = ['2025', '2024', '2023', '2022', '2021', '2020'] as const;

export const distanceBands = [
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

export const eligibilityOptions = [
  {
    value: 'all',
    label: 'Any eligibility',
    phase: null,
    description: 'Keep the selected phase without applying a parent profile.',
  },
  {
    value: 'alumni',
    label: 'Alumni / former sibling',
    phase: '2A',
    description: 'Usually considered under Phase 2A.',
  },
  {
    value: 'staff',
    label: 'School staff / MOE Kindergarten',
    phase: '2A',
    description: 'Usually considered under Phase 2A.',
  },
  {
    value: 'parent-volunteer',
    label: 'Parent volunteer',
    phase: '2B',
    description: 'Usually considered under Phase 2B.',
  },
  {
    value: 'association-sponsor',
    label: 'Association / clan / church endorsement',
    phase: '2B',
    description: 'Usually considered under Phase 2B.',
  },
  {
    value: 'community-leader',
    label: 'Active community leader',
    phase: '2B',
    description: 'Usually considered under Phase 2B.',
  },
  {
    value: 'no-priority',
    label: 'No priority eligibility',
    phase: '2C',
    description: 'Use Phase 2C as the open application baseline.',
  },
] as const satisfies ReadonlyArray<{
  value: EligibilityFilter;
  label: string;
  phase: (typeof phases)[number] | null;
  description: string;
}>;
