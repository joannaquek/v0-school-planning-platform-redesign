'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Map as MapIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SchoolSearchInput } from '@/components/search-input';
import { NearbyRadiusToggle } from '@/components/nearby-radius-toggle';
import { useAppStore } from '@/lib/store';
import {
  distanceBands,
  pressureLevels,
  years,
  phases,
  resolveRegistrationYear,
  registrationPhaseFootnotes,
  isRegistrationPhase,
} from '@/lib/filter-options';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list' | 'map';

type FilterFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

const FilterField = ({ label, children, className }: FilterFieldProps) => (
  <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </div>
);

const compactSelectTriggerClass =
  'h-9 w-full min-w-[7.5rem] bg-background text-sm';

type SchoolsFilterBarProps = {
  onSearch: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasHome: boolean;
  className?: string;
};

export function SchoolsFilterBar({
  onSearch,
  viewMode,
  onViewModeChange,
  hasHome,
  className,
}: SchoolsFilterBarProps) {
  const { filters, setFilters, resetFilters } = useAppStore();
  const registrationYear = resolveRegistrationYear(filters.year);

  useEffect(() => {
    if (filters.year !== registrationYear) {
      setFilters({ year: registrationYear });
    }
  }, [filters.year, registrationYear, setFilters]);

  const handleReset = () => {
    resetFilters();
    onSearch('');
  };

  const phaseFootnote = isRegistrationPhase(filters.phase)
    ? registrationPhaseFootnotes[filters.phase]
    : null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Tier 1 — registration data (MOE year / phase) */}
      <section
        className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
        aria-labelledby="registration-data-heading"
      >
        <h2
          id="registration-data-heading"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Registration data
        </h2>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <FilterField label="Year" className="sm:w-32">
            <Select value={registrationYear} onValueChange={(value) => setFilters({ year: value })}>
              <SelectTrigger className={compactSelectTriggerClass}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[12rem]">
            <FilterField label="Phase" className="w-full">
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={filters.phase}
                onValueChange={(value) => value && setFilters({ phase: value })}
                className="w-full justify-stretch"
                aria-label="Registration phase"
                aria-describedby="phase-footnote"
              >
                {phases.map((phase) => (
                  <ToggleGroupItem
                    key={phase}
                    value={phase}
                    className="flex-1 px-2 text-xs sm:text-sm"
                  >
                    {phase}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FilterField>
            {phaseFootnote ? (
              <p
                id="phase-footnote"
                className="rounded-md bg-muted/50 px-2.5 py-2 text-xs leading-relaxed text-muted-foreground"
              >
                <span className="font-medium text-foreground">
                  Phase {filters.phase} — {phaseFootnote.label}:
                </span>{' '}
                {phaseFootnote.summary}{' '}
                <Link href="/guide" className="font-medium text-primary underline-offset-2 hover:underline">
                  Full guide
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Tier 2 — refine list / map results */}
      <section
        className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
        aria-labelledby="refine-results-heading"
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="refine-results-heading"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Refine results
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-muted-foreground"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        <div className="mt-3">
          <SchoolSearchInput onSearch={onSearch} className="w-full" />
        </div>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {hasHome ? (
              <NearbyRadiusToggle layout="inline" className="sm:min-w-[10rem]" />
            ) : (
              <FilterField label="Distance" className="sm:w-40">
                <Select
                  value={filters.distanceBand}
                  onValueChange={(value) => setFilters({ distanceBand: value })}
                >
                  <SelectTrigger className={compactSelectTriggerClass}>
                    <SelectValue placeholder="All distances" />
                  </SelectTrigger>
                  <SelectContent>
                    {distanceBands.map((band) => (
                      <SelectItem key={band.value} value={band.value}>
                        {band.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            <FilterField label="Pressure" className="sm:w-44">
              <Select
                value={filters.pressure}
                onValueChange={(value) => setFilters({ pressure: value })}
              >
                <SelectTrigger className={compactSelectTriggerClass}>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  {pressureLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Sort" className="sm:w-48">
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters({ sortBy: value as 'distance' | 'pressure' | 'name' | 'vacancies' })
                }
              >
                <SelectTrigger className={compactSelectTriggerClass}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance (nearest)</SelectItem>
                  <SelectItem value="pressure">Pressure (lowest)</SelectItem>
                  <SelectItem value="vacancies">Vacancies (most)</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>
          </div>

          <div className="flex shrink-0 items-center justify-end">
            <div className="flex rounded-lg border border-border bg-background p-1">
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onViewModeChange('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                type="button"
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onViewModeChange('list')}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
              <Button
                type="button"
                variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onViewModeChange('map')}
              >
                <MapIcon className="h-4 w-4" />
                <span className="sr-only">Map view</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
