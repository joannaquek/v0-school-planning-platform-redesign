import { NextResponse } from 'next/server';

type GeocodeRow = {
  POSTALCODE?: string;
  POSTAL?: string;
  BLOCK?: string;
  ROAD?: string;
  BUILDINGNAME?: string;
  ADDRESS?: string;
};

type RevGeoPayload = {
  GeocodeInfo?: GeocodeRow[];
};

function formatRow(row: GeocodeRow): { postalCode: string; address: string } {
  const postal = (row.POSTALCODE ?? row.POSTAL ?? '').trim();
  const block = (row.BLOCK ?? '').trim();
  const road = (row.ROAD ?? '').trim();
  const building = (row.BUILDINGNAME ?? '').trim();
  const line =
    row.ADDRESS?.trim() ||
    [block, road].filter(Boolean).join(' ').trim() ||
    building ||
    '';
  const address =
    postal && line ? `${line} Singapore ${postal}` : postal ? `Singapore ${postal}` : line;
  return { postalCode: postal, address: address || `${postal}` };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400 });
  }

  const token = process.env.ONEMAP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Missing ONEMAP_ACCESS_TOKEN on server' },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL('https://www.onemap.gov.sg/api/private/commonsvc/revgeocode');
  upstreamUrl.searchParams.set('location', `${lat},${lng}`);
  upstreamUrl.searchParams.set('token', token);

  const response = await fetch(upstreamUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = `OneMap reverse geocode failed (${response.status})`;
    try {
      const errBody = (await response.json()) as { message?: string; error?: string };
      if (errBody.message) detail = errBody.message;
      else if (typeof errBody.error === 'string') detail = errBody.error;
    } catch {
      /* ignore */
    }
    const authIssue =
      response.status === 401 ||
      response.status === 403 ||
      /token|authentication|expired|missing authentication/i.test(detail);
    return NextResponse.json({ error: detail }, { status: authIssue ? 401 : 502 });
  }

  const payload = (await response.json()) as RevGeoPayload;
  const rows = payload.GeocodeInfo;
  const first = Array.isArray(rows) ? rows[0] : undefined;
  if (!first) {
    return NextResponse.json(
      { error: 'No address for coordinates', lat, lng },
      { status: 404 }
    );
  }

  const { postalCode, address } = formatRow(first);
  return NextResponse.json({
    lat,
    lng,
    postalCode,
    address: address || `Singapore ${postalCode}`.trim(),
  });
}
