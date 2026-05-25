import type { SchoolDetailData } from './bundled-types';
import type { GeoPoint } from './geo';
import { detailToSchool } from './map-detail-to-school';
import type { CompareItem, School } from './types';

/** Refresh compare shortlist schools from bundled data for the active year and home. */
export function rehydrateCompareSchools(
  compareList: CompareItem[],
  details: SchoolDetailData[],
  year: number,
  home: GeoPoint | null
): School[] {
  return compareList
    .map((item) => {
      const detail = details.find((d) => d.slug === item.school.id);
      if (!detail) return item.school;
      return detailToSchool(detail, year, '2C', home);
    })
    .filter(Boolean);
}
