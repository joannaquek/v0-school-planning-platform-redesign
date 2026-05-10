'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, Map as MapIcon, List, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { SchoolCard } from '@/components/school-card';
import { FilterPanel, FilterChips } from '@/components/filter-panel';
import { SchoolSearchInput } from '@/components/search-input';
import { MapView } from '@/components/map-view';
import { CompareDrawer } from '@/components/compare-drawer';
import { useAppStore } from '@/lib/store';
import { detailsToSchools } from '@/lib/map-detail-to-school';
import type { SchoolDetailData } from '@/lib/bundled-types';
import type { GeoPoint } from '@/lib/geo';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list' | 'map';

export function SchoolsPageClient({ details }: { details: SchoolDetailData[] }) {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') as ViewMode | null;

  const [viewMode, setViewMode] = useState<ViewMode>(initialView || 'grid');
  const [searchQuery, setSearchQuery] = useState('');

  const { filters, selectedSchoolId, setSelectedSchoolId, userLat, userLng } = useAppStore();

  const home: GeoPoint | null =
    userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null;

  const filteredSchools = useMemo(() => {
    const allSchools = detailsToSchools(
      details,
      Number(filters.year),
      filters.phase,
      home
    );
    let result = [...allSchools];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (school) =>
          school.name.toLowerCase().includes(query) ||
          school.address.toLowerCase().includes(query)
      );
    }

    if (filters.distanceBand !== 'all' && home) {
      result = result.filter((school) => {
        const d = school.distance;
        if (d == null) return false;
        if (filters.distanceBand === '1') return d <= 1;
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
  }, [details, searchQuery, filters, home]);

  const sortLabels = {
    distance: 'Distance',
    pressure: 'Pressure',
    vacancies: 'Vacancies',
    name: 'Name',
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Browse Schools</h1>
          <p className="mt-1 text-muted-foreground">
            {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''} found · Phase{' '}
            {filters.phase} · Year {filters.year}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <SchoolSearchInput onSearch={setSearchQuery} className="max-w-md flex-1" />
            <FilterPanel />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-card p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
              <Button
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-4 w-4" />
                <span className="sr-only">Map view</span>
              </Button>
            </div>
          </div>
        </div>

        <FilterChips />

        <div className="mb-4 mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowUpDown className="h-4 w-4" />
          <span>Sorted by {sortLabels[filters.sortBy]}</span>
        </div>

        {viewMode === 'map' ? (
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <MapView
              schools={filteredSchools}
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
