/** Matches phases present in p1-school-selector ballot scrape / bundled JSON. */
export const phases = ['2A', '2B', '2C'] as const;

/** Years with MOE annual totals after running `npm run import:moe-vacancies` (add year when MOE publishes). */
export const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] as const;

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
