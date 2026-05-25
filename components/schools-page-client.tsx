'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Map as MapIcon, AlertTriangle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { SchoolCard } from '@/components/school-card';
import { SchoolsFilterBar } from '@/components/schools-filter-bar';
import { MapView } from '@/components/map-view';
import { CompareDrawer } from '@/components/compare-drawer';
import { useAppStore } from '@/lib/store';
import {
  NEARBY_WITHIN_2,
  isNearbyDistanceBand,
  nearbyRadiusKm,
  nearbyRadiusLabelKm,
} from '@/lib/nearby-radius';
import { resolveRegistrationYear } from '@/lib/filter-options';
import { detailsToSchools } from '@/lib/map-detail-to-school';
import { eligibilityOptions } from '@/lib/filter-options';
import type { SchoolDetailData } from '@/lib/bundled-types';
import type { GeoPoint } from '@/lib/geo';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list' | 'map';

function viewFromSearchParams(params: URLSearchParams): ViewMode {
  const view = params.get('view');
  if (view === 'map' || view === 'list' || view === 'grid') return view;
  return 'grid';
}

export function SchoolsPageClient({ details }: { details: SchoolDetailData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<ViewMode>(() => viewFromSearchParams(searchParams));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setViewMode(viewFromSearchParams(searchParams));
  }, [searchParams]);

  const setViewModeAndUrl = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      const params = new URLSearchParams(searchParams.toString());
      if (mode === 'grid') {
        params.delete('view');
      } else {
        params.set('view', mode);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const {
    filters,
    selectedSchoolId,
    setSelectedSchoolId,
    userLat,
    userLng,
    oneMapLastWarning,
    dismissOneMapWarning,
  } = useAppStore();

  const home: GeoPoint | null =
    userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null;
  const currentEligibility = filters.eligibility ?? 'all';
  const selectedEligibility = eligibilityOptions.find((option) => option.value === currentEligibility);

  const registrationYear = resolveRegistrationYear(filters.year);

  const filteredSchools = useMemo(() => {
    const allSchools = detailsToSchools(
      details,
      Number(registrationYear),
      filters.phase,
      home
    );
    let result = [...allSchools];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const normalizedDigits = query.replace(/\D/g, '');
      result = result.filter(
        (school) => {
          const schoolPostalDigits = school.postalCode.replace(/\D/g, '');
          const postalMatch =
            normalizedDigits.length >= 4 && schoolPostalDigits.includes(normalizedDigits);

          return (
            school.name.toLowerCase().includes(query) ||
            school.address.toLowerCase().includes(query) ||
            school.postalCode.toLowerCase().includes(query) ||
            postalMatch
          );
        }
      );
    }

    if (filters.distanceBand !== 'all' && home) {
      result = result.filter((school) => {
        const d = school.distance;
        if (d == null) return false;
        if (filters.distanceBand === 'within-1' || filters.distanceBand === '1') return d <= 1;
        if (filters.distanceBand === 'within-2') return d <= 2;
        if (filters.distanceBand === '2') return d > 1 && d <= 2;
        if (filters.distanceBand === '3') return d > 2;
        return true;
      });
    }

    if (filters.pressure !== 'all') {
      result = result.filter((school) => school.pressure === filters.pressure);
    }

    switch (filters.sortBy) {
      case 'distance':
        result.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
        break;
      case 'pressure': {
        const pressureOrder = { low: 0, moderate: 1, high: 2 };
        result.sort((a, b) => pressureOrder[a.pressure] - pressureOrder[b.pressure]);
        break;
      }
      case 'vacancies':
        result.sort((a, b) => b.totalVacancies - a.totalVacancies);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [details, searchQuery, filters, home, registrationYear]);

  const sortLabels = {
    distance: 'distance (nearest first)',
    pressure: 'pressure (lowest first)',
    vacancies: 'vacancies (most first)',
    name: 'name (A–Z)',
  };

  const activeNearbyBand = isNearbyDistanceBand(filters.distanceBand)
    ? filters.distanceBand
    : NEARBY_WITHIN_2;
  const mapRadiusKm = home ? (nearbyRadiusKm(activeNearbyBand) ?? 2) : 2;
  const nearbyLabel = home ? nearbyRadiusLabelKm(activeNearbyBand) : null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {oneMapLastWarning ? (
          <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Home location notice</AlertTitle>
            <AlertDescription className="space-y-3">
              <p className="text-amber-950/90 dark:text-amber-50/90">{oneMapLastWarning}</p>
              <p className="text-xs text-amber-950/80 dark:text-amber-50/80">
                If this mentions the Geocoding API or your key, confirm the Geocoding API is enabled and billing is active in{' '}
                <a
                  href="https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com"
                  className="font-medium underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Cloud Console
                </a>
                , then update <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[11px]">GOOGLE_MAPS_SERVER_API_KEY</code> in{' '}
                <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[11px]">.env.local</code> and restart{' '}
                <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[11px]">npm run dev</code>.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => dismissOneMapWarning()}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Browse Schools</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''}
            {nearbyLabel ? ` within ${nearbyLabel} of your home` : ''}
            {' · '}
            Sorted by {sortLabels[filters.sortBy]}
          </p>
          {selectedEligibility && selectedEligibility.value !== 'all' ? (
            <div className="mt-3 max-w-2xl rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Eligibility context:</span> Phase{' '}
              {filters.phase} historical demand for {selectedEligibility.label.toLowerCase()} applicants.
              Confirm final eligibility with the school and MOE before applying.
            </div>
          ) : null}
        </div>

        <SchoolsFilterBar
          className="mb-6"
          onSearch={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewModeAndUrl}
          hasHome={home != null}
        />

        {home != null ? (
          <div className="mb-6">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/compare" className="inline-flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Plan my registration
              </Link>
            </Button>
          </div>
        ) : null}

        {viewMode === 'map' ? (
          <div className="h-[calc(100vh-420px)] min-h-[400px]">
            <MapView
              schools={filteredSchools}
              home={home}
              radiusKm={mapRadiusKm as 1 | 2}
              selectedSchoolId={selectedSchoolId}
              onSelectSchool={setSelectedSchoolId}
            />
          </div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-3'
            )}
          >
            {filteredSchools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                vacancyYearLabel={registrationYear}
              />
            ))}
          </div>
        )}

        {filteredSchools.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MapIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No schools found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </main>

      <CompareDrawer />
      <MobileNav />
    </div>
  );
}
