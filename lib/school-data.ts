import bundled from './schools-bundled.json';
import type { SchoolDetailData } from './bundled-types';

const details = bundled as SchoolDetailData[];

export function getAllSchoolDetails(): SchoolDetailData[] {
  return details;
}

export function getSchoolDetailBySlug(slug: string): SchoolDetailData | undefined {
  return details.find((d) => d.slug === slug);
}

export function getSchoolCount(): number {
  return details.length;
}
