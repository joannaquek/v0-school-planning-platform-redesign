import { NextResponse } from 'next/server';

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results?: Array<{
    formatted_address?: string;
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry?: { location?: { lat: number; lng: number } };
  }>;
};

function postalFromComponents(
  components: GoogleGeocodeResponse['results'][0]['address_components'] | undefined
): string {
  if (!components) return '';
  const pc = components.find((c) => c.types.includes('postal_code'));
  return pc?.long_name?.trim() ?? '';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (!q) {
    return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_MAPS_SERVER_API_KEY on server' },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  upstreamUrl.searchParams.set('address', q);
  upstreamUrl.searchParams.set('components', 'country:SG');
  upstreamUrl.searchParams.set('region', 'sg');
  upstreamUrl.searchParams.set('key', key);

  const response = await fetch(upstreamUrl.toString(), { cache: 'no-store' });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Google Geocoding request failed (${response.status})` },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as GoogleGeocodeResponse;
  const status = payload.status ?? 'UNKNOWN_ERROR';

  if (status === 'ZERO_RESULTS') {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 });
  }

  if (status !== 'OK' || !payload.results?.length) {
    const msg = payload.error_message?.trim() || `Geocoding failed (${status})`;
    const authIssue = /denied|invalid|expired|API key|not authorized|REQUEST_DENIED/i.test(msg);
    return NextResponse.json({ error: msg }, { status: authIssue ? 401 : 502 });
  }

  const first = payload.results[0];
  const loc = first.geometry?.location;
  const lat = loc?.lat;
  const lng = loc?.lng;
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 });
  }

  const postalCode = postalFromComponents(first.address_components);
  const address = first.formatted_address?.trim() || q;

  return NextResponse.json({
    lat,
    lng,
    address,
    postalCode,
  });
}
