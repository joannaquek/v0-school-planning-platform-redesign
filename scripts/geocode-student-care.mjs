/**
 * Geocode unique SCC postals via Google Geocoding API; write cache + enriched centres file.
 * Requires GOOGLE_MAPS_SERVER_API_KEY (see .env.local).
 *
 * Usage: node scripts/geocode-student-care.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const centresPath = path.join(repoRoot, 'data', 'student-care-centres.json');
const schoolsPath = path.join(repoRoot, 'lib', 'schools-bundled.json');
const cachePath = path.join(repoRoot, 'data', 'student-care-geocode-cache.json');
const outPath = path.join(repoRoot, 'data', 'student-care-centres-geocoded.json');
const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeSgPostal(postalCode) {
  const postal = String(postalCode ?? '').trim();
  if (!/^\d{6}$/.test(postal)) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', postal);
  url.searchParams.set('components', `country:SG|postal_code:${postal}`);
  url.searchParams.set('region', 'sg');
  url.searchParams.set('key', key);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) return null;

  const { lat, lng } = data.results[0].geometry.location;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return { lat, lng };
}

async function saveCache(cache) {
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2) + '\n', 'utf8');
}

const raw = await fs.readFile(centresPath, 'utf8');
const payload = JSON.parse(raw);
const schools = JSON.parse(await fs.readFile(schoolsPath, 'utf8'));

let cache = {};
try {
  cache = JSON.parse(await fs.readFile(cachePath, 'utf8'));
} catch {
  cache = {};
}

for (const school of schools) {
  if (school.postalCode && school.lat != null && school.lng != null && !cache[school.postalCode]) {
    cache[school.postalCode] = { lat: school.lat, lng: school.lng, source: 'school' };
  }
}

const postals = [...new Set(payload.centres.map((c) => c.postalCode).filter(Boolean))];
let fetched = 0;
let failed = 0;
let skipped = 0;

if (key) {
  for (let i = 0; i < postals.length; i += 1) {
    const postal = postals[i];
    if (cache[postal]?.lat != null && cache[postal]?.lng != null) {
      skipped += 1;
      continue;
    }

    const coords = await geocodeSgPostal(postal);
    if (coords) {
      cache[postal] = { ...coords, source: 'google' };
      fetched += 1;
    } else {
      failed += 1;
      console.warn(`Failed to geocode postal ${postal}`);
    }

    if ((i + 1) % 10 === 0) {
      await saveCache(cache);
      console.log(`Postals ${i + 1}/${postals.length} (new=${fetched}, failed=${failed}, cached=${skipped})`);
    }

    await sleep(120);
  }
  await saveCache(cache);
} else {
  console.warn('No GOOGLE_MAPS_SERVER_API_KEY — using school postal coords only.');
}

const centres = payload.centres.map((centre) => {
  const coords = cache[centre.postalCode];
  if (!coords) return centre;
  return {
    ...centre,
    coordinates: { lat: coords.lat, lng: coords.lng },
  };
});

const missing = centres.filter((c) => !c.coordinates).length;

await fs.writeFile(cachePath, JSON.stringify(cache, null, 2) + '\n', 'utf8');
await fs.writeFile(
  outPath,
  JSON.stringify({ ...payload, centres, geocodedAt: new Date().toISOString().slice(0, 10) }, null, 2) +
    '\n',
  'utf8'
);

console.log(`Wrote ${outPath} (${centres.length} centres, ${missing} without coordinates)`);
