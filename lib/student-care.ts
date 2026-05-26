import centresPayload from '@/data/student-care-centres-geocoded.json';
import indexPayload from '@/data/student-care-index.json';
import type { GeoPoint } from '@/lib/geo';
import { haversineKm } from '@/lib/geo';
import type {
  StudentCareCentre,
  StudentCareIndex,
  StudentCareSchoolBucket,
  StudentCareSourceMeta,
} from '@/lib/student-care-types';

const index = indexPayload as StudentCareIndex;
const centresSource = centresPayload as {
  source: StudentCareSourceMeta;
  centres: StudentCareCentre[];
};

const EMPTY_BUCKET: StudentCareSchoolBucket = { atSchool: [], nearby: [] };

export function getStudentCareSource(): StudentCareSourceMeta {
  return centresSource.source;
}

export function getStudentCareForSchool(schoolSlug: string): StudentCareSchoolBucket {
  return index.bySchool[schoolSlug] ?? EMPTY_BUCKET;
}

export function getStudentCareForCompare(
  schoolSlugs: string[]
): Record<string, StudentCareSchoolBucket> {
  const out: Record<string, StudentCareSchoolBucket> = {};
  for (const slug of schoolSlugs) {
    out[slug] = getStudentCareForSchool(slug);
  }
  return out;
}

export type StudentCareMapPin = StudentCareCentre & {
  distanceFromHomeKm: number;
};

const MAP_PIN_CAP = 50;

export function getStudentCareNearHome(
  home: GeoPoint,
  radiusKm: number
): StudentCareMapPin[] {
  const withDistance: StudentCareMapPin[] = [];

  for (const centre of centresSource.centres) {
    const coords = centre.coordinates;
    if (!coords) continue;
    const distanceFromHomeKm = haversineKm(home, coords);
    if (distanceFromHomeKm > radiusKm) continue;
    withDistance.push({ ...centre, distanceFromHomeKm });
  }

  return withDistance
    .sort((a, b) => a.distanceFromHomeKm - b.distanceFromHomeKm)
    .slice(0, MAP_PIN_CAP);
}

export function summarizeStudentCare(bucket: StudentCareSchoolBucket): {
  total: number;
  minFee: number | null;
  minFeeDisplay: string | null;
} {
  const all = [...bucket.atSchool, ...bucket.nearby];
  const fees = all.map((c) => c.monthlyFee).filter((f): f is number => f != null);
  const min = fees.length ? Math.min(...fees) : null;
  const minCentre = all.find((c) => c.monthlyFee === min);
  return {
    total: all.length,
    minFee: min,
    minFeeDisplay: minCentre?.monthlyFeeDisplay ?? (min != null ? `$${min}` : null),
  };
}
