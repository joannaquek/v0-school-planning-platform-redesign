export type GeoPoint = {
  lat: number;
  lng: number;
};

export type GeoBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

/** Approximate kilometres per degree of latitude (WGS84). */
export const KM_PER_DEG_LAT = 111.32;

export function kmPerDegLng(lat: number): number {
  return KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

/** Symmetric bounds around a point so circles render round on screen. */
export function boundsAroundPoint(center: GeoPoint, radiusKm: number): GeoBounds {
  const latDelta = radiusKm / KM_PER_DEG_LAT;
  const lngDelta = radiusKm / kmPerDegLng(center.lat);
  const uniform = Math.max(latDelta, lngDelta);
  return {
    minLat: center.lat - uniform,
    maxLat: center.lat + uniform,
    minLng: center.lng - uniform,
    maxLng: center.lng + uniform,
  };
}

export function pointToPercent(point: GeoPoint, bounds: GeoBounds): { x: number; y: number } {
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  const latSpan = bounds.maxLat - bounds.minLat || 1;
  const x = ((point.lng - bounds.minLng) / lngSpan) * 100;
  const y = ((bounds.maxLat - point.lat) / latSpan) * 100;
  return {
    x: Math.max(2, Math.min(98, x)),
    y: Math.max(2, Math.min(98, y)),
  };
}

/** Great-circle distance in kilometres (WGS84). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * r * Math.asin(Math.sqrt(h));
}
