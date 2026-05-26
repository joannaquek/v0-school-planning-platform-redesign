/**
 * Link student care centres to primary schools → data/student-care-index.json
 *
 * Prerequisite: data/student-care-centres-geocoded.json (run geocode-student-care.mjs)
 * Usage: node scripts/link-student-care-schools.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const centresGeocodedPath = path.join(repoRoot, 'data', 'student-care-centres-geocoded.json');
const centresBasePath = path.join(repoRoot, 'data', 'student-care-centres.json');
const cachePath = path.join(repoRoot, 'data', 'student-care-geocode-cache.json');
const schoolsPath = path.join(repoRoot, 'lib', 'schools-bundled.json');
const outPath = path.join(repoRoot, 'data', 'student-care-index.json');

const NEARBY_KM = 1.5;
const KM_PER_DEG_LAT = 111.32;
const kmPerDegLng = (lat) => KM_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);

function haversineKm(a, b) {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * r * Math.asin(Math.sqrt(h));
}

function normalizeText(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSchoolNameFragment(fragment) {
  return normalizeText(fragment)
    .replace(/\bprimary\s+school\b/g, '')
    .replace(/\bpri\b/g, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHostSchoolFromAddress(address) {
  const match = String(address).match(/(.+?)\s+primary\s+school/i);
  if (!match) return null;
  return normalizeSchoolNameFragment(match[1]);
}

function extractHostSchoolFromName(name) {
  const atMatch = String(name).match(/@\s*(.+)$/i);
  if (atMatch) {
    const part = atMatch[1].replace(/\s*\(.*$/, '').trim();
    return normalizeSchoolNameFragment(part);
  }
  const parenMatch = String(name).match(/\(([^)]+)\s*primary[^)]*\)/i);
  if (parenMatch) return normalizeSchoolNameFragment(parenMatch[1]);
  return null;
}

function schoolNormName(school) {
  return normalizeSchoolNameFragment(school.name);
}

function matchSchoolByFragment(fragment, schools) {
  if (!fragment || fragment.length < 3) return null;
  let best = null;
  let bestScore = 0;
  for (const school of schools) {
    const norm = schoolNormName(school);
    if (norm === fragment) {
      return school;
    }
    if (norm.includes(fragment) || fragment.includes(norm)) {
      const score = Math.min(norm.length, fragment.length);
      if (score > bestScore) {
        bestScore = score;
        best = school;
      }
    }
  }
  return best;
}

function enrichCentre(centre, school, matchMethod, distanceToSchoolKm) {
  return {
    ...centre,
    linkedSchoolSlug: school.slug,
    matchMethod,
    distanceToSchoolKm:
      distanceToSchoolKm != null ? Math.round(distanceToSchoolKm * 1000) / 1000 : null,
  };
}

let centresPayload;
try {
  centresPayload = JSON.parse(await fs.readFile(centresGeocodedPath, 'utf8'));
} catch {
  centresPayload = JSON.parse(await fs.readFile(centresBasePath, 'utf8'));
}

let geocodeCache = {};
try {
  geocodeCache = JSON.parse(await fs.readFile(cachePath, 'utf8'));
} catch {
  geocodeCache = {};
}

const schools = JSON.parse(await fs.readFile(schoolsPath, 'utf8'));

function resolveCoordinates(centre) {
  if (centre.coordinates?.lat != null) {
    return centre.coordinates;
  }
  const cached = geocodeCache[centre.postalCode];
  if (cached?.lat != null) {
    return { lat: cached.lat, lng: cached.lng };
  }
  return null;
}

const postalToSchool = new Map();
for (const school of schools) {
  if (school.postalCode) postalToSchool.set(school.postalCode, school);
}

const index = {};
for (const school of schools) {
  index[school.slug] = { atSchool: [], nearby: [] };
}

const assigned = new Map();

for (const centre of centresPayload.centres) {
  let school = null;
  let matchMethod = null;

  const hostFrag =
    extractHostSchoolFromAddress(centre.address) || extractHostSchoolFromName(centre.name);
  if (hostFrag) {
    school = matchSchoolByFragment(hostFrag, schools);
    if (school) matchMethod = 'host-name';
  }

  if (!school && centre.postalCode && postalToSchool.has(centre.postalCode)) {
    school = postalToSchool.get(centre.postalCode);
    matchMethod = 'postal';
  }

  if (!school || !matchMethod) continue;

  const key = `${centre.id}:${school.slug}`;
  if (assigned.has(key)) continue;
  assigned.set(key, true);

  const coords = resolveCoordinates(centre);
  const schoolPoint =
    school.lat != null && school.lng != null ? { lat: school.lat, lng: school.lng } : null;
  const dist =
    coords && schoolPoint ? haversineKm(coords, schoolPoint) : null;

  const entry = enrichCentre(centre, school, matchMethod, dist);
  index[school.slug].atSchool.push(entry);
}

for (const centre of centresPayload.centres) {
  const coords = resolveCoordinates(centre);
  if (!coords) continue;

  const keyBase = centre.id;
  const alreadyAt = new Set(
    Object.values(index)
      .flatMap((b) => b.atSchool)
      .filter((c) => c.id === centre.id)
      .map((c) => c.linkedSchoolSlug)
  );

  const candidates = [];
  for (const school of schools) {
    if (school.lat == null || school.lng == null) continue;
    if (alreadyAt.has(school.slug)) continue;
    const dist = haversineKm(coords, { lat: school.lat, lng: school.lng });
    if (dist <= NEARBY_KM) {
      candidates.push({ school, dist });
    }
  }

  candidates.sort((a, b) => a.dist - b.dist);
  for (const { school, dist } of candidates.slice(0, 3)) {
    const key = `${keyBase}:${school.slug}`;
    if (assigned.has(key)) continue;
    assigned.set(key, true);
    index[school.slug].nearby.push(enrichCentre(centre, school, 'distance', dist));
  }
}

for (const slug of Object.keys(index)) {
  index[slug].atSchool.sort((a, b) => (a.monthlyFee ?? 9999) - (b.monthlyFee ?? 9999));
  index[slug].nearby.sort((a, b) => {
    const d = (a.distanceToSchoolKm ?? 99) - (b.distanceToSchoolKm ?? 99);
    if (d !== 0) return d;
    return (a.monthlyFee ?? 9999) - (b.monthlyFee ?? 9999);
  });
}

const withAny = Object.values(index).filter(
  (b) => b.atSchool.length > 0 || b.nearby.length > 0
).length;

await fs.writeFile(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString().slice(0, 10),
      nearbyRadiusKm: NEARBY_KM,
      schoolsWithCentres: withAny,
      bySchool: index,
    },
    null,
    2
  ) + '\n',
  'utf8'
);

console.log(`Wrote ${outPath} — ${withAny} schools with linked centres`);
