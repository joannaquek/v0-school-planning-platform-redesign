/** Filter values for postal-code “nearby schools” radius. */
export const NEARBY_WITHIN_1 = 'within-1' as const;
export const NEARBY_WITHIN_2 = 'within-2' as const;

export type NearbyDistanceBand = typeof NEARBY_WITHIN_1 | typeof NEARBY_WITHIN_2;

export function isNearbyDistanceBand(band: string): band is NearbyDistanceBand {
  return band === NEARBY_WITHIN_1 || band === NEARBY_WITHIN_2;
}

export function nearbyRadiusKm(band: string): 1 | 2 | null {
  if (band === NEARBY_WITHIN_1 || band === '1') return 1;
  if (band === NEARBY_WITHIN_2) return 2;
  return null;
}

export function nearbyRadiusLabelKm(band: string): string | null {
  const km = nearbyRadiusKm(band);
  if (km == null) return null;
  return `${km}km`;
}

export function schoolWithinNearbyRadius(
  distanceKm: number | undefined,
  band: string
): boolean {
  const radius = nearbyRadiusKm(band);
  if (radius == null) return true;
  if (distanceKm == null) return false;
  return distanceKm <= radius;
}
