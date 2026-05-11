import { NextResponse } from 'next/server';

type OneMapResult = {
  SEARCHVAL?: string;
  ADDRESS?: string;
  POSTAL?: string;
  LATITUDE?: string;
  LONGITUDE?: string;
  /** OneMap typo field seen in some responses */
  LONGTITUDE?: string;
};

type OneMapSearchResponse = {
  error?: string;
  results?: OneMapResult[];
};

/** Prefer a row whose POSTAL matches a 6-digit query so the first elastic hit is not used by mistake. */
function pickSearchResult(query: string, results: OneMapResult[] | undefined): OneMapResult | undefined {
  if (!results?.length) return undefined;
  const digits = query.replace(/\D/g, '');
  if (digits.length === 6) {
    const match = results.find((r) => (r.POSTAL ?? '').replace(/\D/g, '') === digits);
    if (match) return match;
  }
  return results[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (!q) {
    return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  }

  const token = process.env.ONEMAP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Missing ONEMAP_ACCESS_TOKEN on server' },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL('https://www.onemap.gov.sg/api/common/elastic/search');
  upstreamUrl.searchParams.set('searchVal', q);
  upstreamUrl.searchParams.set('returnGeom', 'Y');
  upstreamUrl.searchParams.set('getAddrDetails', 'Y');
  upstreamUrl.searchParams.set('pageNum', '1');

  const response = await fetch(upstreamUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `OneMap search failed (${response.status})` },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as OneMapSearchResponse;
  const upstreamError = typeof payload.error === 'string' ? payload.error.trim() : '';
  const first = pickSearchResult(q, payload.results);
  const latStr = first?.LATITUDE;
  const lngStr = first?.LONGITUDE ?? first?.LONGTITUDE;
  const lat = latStr != null && latStr !== '' ? Number(latStr) : NaN;
  const lng = lngStr != null && lngStr !== '' ? Number(lngStr) : NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    if (upstreamError) {
      const authIssue = /token missing|invalid authentication|expired|renew your api token|generate or renew/i.test(
        upstreamError
      );
      return NextResponse.json({ error: upstreamError }, { status: authIssue ? 401 : 404 });
    }
    return NextResponse.json({ error: 'Address not found' }, { status: 404 });
  }

  return NextResponse.json({
    lat,
    lng,
    address: first.ADDRESS ?? first.SEARCHVAL ?? q,
    postalCode: first.POSTAL ?? '',
    ...(upstreamError ? { oneMapWarning: upstreamError } : {}),
  });
}
