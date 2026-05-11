import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const filePath = path.join(repoRoot, 'lib', 'schools-bundled.json');
const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;

if (!key) {
  console.error('Missing GOOGLE_MAPS_SERVER_API_KEY in environment.');
  process.exit(1);
}

const raw = await fs.readFile(filePath, 'utf8');
const schools = JSON.parse(raw);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeSgPostal(postalCode) {
  const postal = String(postalCode ?? '').trim();
  if (!postal) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', postal);
  url.searchParams.set('components', 'country:SG|postal_code:' + postal);
  url.searchParams.set('region', 'sg');
  url.searchParams.set('key', key);

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== 'OK' || !Array.isArray(data.results) || !data.results[0]) return null;

  const loc = data.results[0]?.geometry?.location;
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return null;
  return { lat: loc.lat, lng: loc.lng };
}

let updated = 0;
let failed = 0;

for (let i = 0; i < schools.length; i += 1) {
  const school = schools[i];
  if (school.lat != null && school.lng != null) continue;

  const coords = await geocodeSgPostal(school.postalCode);
  if (coords) {
    school.lat = coords.lat;
    school.lng = coords.lng;
    updated += 1;
  } else {
    failed += 1;
  }

  if ((i + 1) % 20 === 0 || i === schools.length - 1) {
    console.log(`Processed ${i + 1}/${schools.length} (updated=${updated}, failed=${failed})`);
  }

  await sleep(120);
}

await fs.writeFile(filePath, JSON.stringify(schools), 'utf8');
console.log(`Done. Updated: ${updated}, Failed: ${failed}`);
