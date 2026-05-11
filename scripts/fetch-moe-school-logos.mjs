#!/usr/bin/env node
/**
 * One-time helper: fetch school logos from MOE SchoolFinder HTML and save under public/school-logos/.
 *
 * Important: The UUID in /api/media/{uuid}/... is different for every file. This script resolves the
 * real logo URL from each school's detail page — it does NOT guess a single UUID for all schools.
 *
 * Usage (from repo root):
 *   node scripts/fetch-moe-school-logos.mjs
 *   node scripts/fetch-moe-school-logos.mjs --dry-run
 *   node scripts/fetch-moe-school-logos.mjs --limit 5
 *   node scripts/fetch-moe-school-logos.mjs --delay-ms 400
 *   node scripts/fetch-moe-school-logos.mjs --no-skip-existing   # re-download all
 *
 * Optional overrides when MOE's URL slug does not match heuristics (slug -> path segment only):
 *   scripts/moe-detail-slug-overrides.json  e.g. { "some-slug": "exact-moe-detail-segment" }
 *
 * @see https://www.moe.gov.sg/schoolfinder/primary%20school
 */

import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_BUNDLE = join(ROOT, 'lib', 'schools-bundled.json');
const OUT_DIR = join(ROOT, 'public', 'school-logos');
const MANIFEST_PATH = join(ROOT, 'lib', 'school-logo-manifest.json');
const OVERRIDES_PATH = join(ROOT, 'scripts', 'moe-detail-slug-overrides.json');

const MOE_ORIGIN = 'https://www.moe.gov.sg';
const DETAIL_PREFIX = '/schoolfinder/schooldetail/';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    dryRun: false,
    limit: Infinity,
    delayMs: 450,
    bundlePath: DEFAULT_BUNDLE,
    skipExisting: true,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--no-skip-existing') out.skipExisting = false;
    else if (a === '--limit') out.limit = Math.max(1, Number(args[++i]) || 1);
    else if (a === '--delay-ms') out.delayMs = Math.max(0, Number(args[++i]) || 0);
    else if (a === '--bundle') out.bundlePath = args[++i];
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Slug-like string from official school name (MOE detail URLs often follow this). */
function nameSlug(name) {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isJuniorName(name) {
  const u = name.toUpperCase();
  return u.includes('(JUNIOR)') || /\bJUNIOR\b/.test(u);
}

function isPrimaryName(name) {
  const u = name.toUpperCase();
  return u.includes('(PRIMARY)') || u.includes('PRIMARY SCHOOL');
}

/**
 * Ordered MOE schooldetail path segments to try (no leading slash).
 */
function moeDetailPathCandidates(slug, name) {
  const ns = nameSlug(name);
  const c = [];
  const jnr = isJuniorName(name);
  const pri = isPrimaryName(name);

  if (pri) {
    if (ns.endsWith('-primary-school')) {
      c.push(ns);
    } else {
      c.push(`${ns}-primary`);
      c.push(`${ns}-school-primary`);
    }
  }
  if (jnr) {
    if (ns.endsWith('-junior')) {
      c.push(`${ns}-school`);
      c.push(ns);
      c.push(`${ns}-junior-school`);
    } else {
      c.push(`${ns}-junior`);
      c.push(`${ns}-junior-school`);
      const base = ns.replace(/-school$/, '');
      if (base !== ns) c.push(`${base}-school-junior`);
    }
  }

  if (slug.endsWith('-primary')) {
    c.push(`${slug.slice(0, -'-primary'.length)}-school-primary`);
  }
  if (slug.endsWith('-junior')) {
    const base = slug.slice(0, -'-junior'.length);
    c.push(`${base}-school-junior`);
    c.push(`${slug}-junior-school`);
  }

  c.push(`${slug}-primary-school`);
  if (!slug.endsWith('-primary') && !slug.endsWith('-junior')) {
    c.push(`${slug}-school-primary`);
  }
  c.push(slug);
  if (ns !== slug) c.push(ns);

  return [...new Set(c)];
}

/**
 * Prefer `alt="Logo of …"` img; some MOE pages only embed the asset URL in the RSC/streamed HTML.
 * @param {string} detailHint MOE schooldetail path segment (e.g. casuarina-primary-school)
 */
function extractLogoPath(html, detailHint) {
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    if (!/alt="Logo of/i.test(tag)) continue;
    const src = /\bsrc="(\/api\/media\/[^"]+)"/i.exec(tag);
    if (src) return src[1];
  }

  const mediaRe =
    /\/api\/media\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/[a-z0-9-]+\.(?:png|jpe?g|webp|gif)/gi;
  const hits = [...html.matchAll(mediaRe)].map((x) => x[0]);
  const filtered = hits.filter((p) => {
    const parts = p.split('/');
    const file = (parts[parts.length - 1] || '').toLowerCase();
    const id = parts[3] || '';
    const base = file.replace(/\.[^.]+$/, '');
    if (base === id) return false;
    if (/moe-logo|logo-mark|singapore-government|favicon/i.test(p)) return false;
    return true;
  });
  if (detailHint) {
    const h = detailHint.toLowerCase();
    const prefer = filtered.find((p) => p.toLowerCase().includes(h));
    if (prefer) return prefer;
  }
  return filtered[0] ?? null;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'SchoolLogoFetcher/1.0 (local one-time; +https://github.com/)',
      accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  if (!res.ok) return { ok: false, status: res.status, html: '' };
  const html = await res.text();
  return { ok: true, status: res.status, html };
}

async function downloadFile(url, destFsPath) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'SchoolLogoFetcher/1.0 (local one-time)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const body = Readable.fromWeb(res.body);
  await pipeline(body, createWriteStream(destFsPath));
}

function loadOverrides() {
  if (!existsSync(OVERRIDES_PATH)) return {};
  try {
    return JSON.parse(readFileSync(OVERRIDES_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function main() {
  const { dryRun, limit, delayMs, bundlePath, skipExisting } = parseArgs();
  const schools = JSON.parse(readFileSync(bundlePath, 'utf8'));
  const overrides = loadOverrides();
  if (!Array.isArray(schools)) {
    console.error('Bundle must be a JSON array');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  /** @type {Record<string, string>} */
  const manifest = existsSync(MANIFEST_PATH)
    ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
    : {};

  const report = { ok: 0, skipped: 0, failed: [], at: new Date().toISOString() };
  let processed = 0;

  for (const row of schools) {
    if (processed >= limit) break;
    const slug = row.slug;
    const name = row.name || '';
    if (!slug) continue;
    processed++;

    if (skipExisting && manifest[slug]) {
      const rel = manifest[slug].replace(/^\//, '');
      const abs = join(ROOT, 'public', rel);
      try {
        if (statSync(abs).isFile()) {
          console.log(`SKIP ${slug} (already in manifest + file exists)`);
          report.skipped++;
          continue;
        }
      } catch {
        /* missing file — refetch */
      }
    }

    const overridePath = overrides[slug];
    const candidates = overridePath ? [overridePath.replace(/^\/+|\/+$/g, '')] : moeDetailPathCandidates(slug, name);

    let logoPath = null;
    let usedDetail = null;
    for (const seg of candidates) {
      const url = `${MOE_ORIGIN}${DETAIL_PREFIX}${encodeURI(seg)}`;
      const { ok, status, html } = await fetchText(url);
      await sleep(delayMs);
      if (!ok || status >= 400) continue;
      const lp = extractLogoPath(html, seg);
      if (lp) {
        logoPath = lp;
        usedDetail = seg;
        break;
      }
    }

    if (!logoPath) {
      report.failed.push({ slug, name, tried: candidates });
      console.warn(`MISS ${slug} (${name}) tried: ${candidates.join(', ')}`);
      continue;
    }

    const extMatch = logoPath.match(/\.(png|jpe?g|webp|gif)$/i);
    const ext = extMatch ? extMatch[0].toLowerCase() : '.png';
    const filename = `${slug}${ext}`;
    const relativePublic = `/school-logos/${filename}`;
    const dest = join(OUT_DIR, filename);
    const absolute = `${MOE_ORIGIN}${logoPath}`;

    if (dryRun) {
      console.log(`DRY  ${slug} <- ${usedDetail} (${logoPath})`);
      report.ok++;
      continue;
    }

    await downloadFile(absolute, dest);
    manifest[slug] = relativePublic;
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`OK   ${slug} (${usedDetail}) -> ${relativePublic}`);
    report.ok++;
  }

  const reportPath = join(ROOT, 'scripts', 'moe-logo-fetch-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  if (dryRun) {
    console.log(`\nDry run: manifest not updated (${Object.keys(manifest).length} existing slugs on disk)`);
  } else {
    console.log(`\nUpdated ${MANIFEST_PATH} (${Object.keys(manifest).length} slugs)`);
  }
  console.log(`Report: ${reportPath} ok=${report.ok} skipped=${report.skipped} failed=${report.failed.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
