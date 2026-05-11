'use client';

import { Filter, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAppStore } from '@/lib/store';
import { distanceBands, pressureLevels, years, phases } from '@/lib/mock-data';
import { useState } from 'react';

export function FilterPanel() {
  const { filters, setFilters, resetFilters } = useAppStore();
  const [open, setOpen] = useState(false);

  const activeFilterCount = [
    filters.distanceBand !== 'all',
    filters.pressure !== 'all',
    filters.year !== '2025',
    filters.phase !== '2C',
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Schools</SheetTitle>
          <SheetDescription>
            Narrow down schools based on your preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Distance */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Distance from Home</label>
            <Select
              value={filters.distanceBand}
              onValueChange={(value) => setFilters({ distanceBand: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                {distanceBands.map((band) => (
                  <SelectItem key={band.value} value={band.value}>
                    {band.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balloting Pressure */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Balloting Pressure</label>
            <Select
              value={filters.pressure}
              onValueChange={(value) => setFilters({ pressure: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pressure level" />
              </SelectTrigger>
              <SelectContent>
                {pressureLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Registration Year</label>
            <Select
              value={filters.year}
              onValueChange={(value) => setFilters({ year: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phase */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Registration Phase</label>
            <Select
              value={filters.phase}
              onValueChange={(value) => setFilters({ phase: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    Phase {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sort By</label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ sortBy: value as 'distance' | 'pressure' | 'name' | 'vacancies' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance (nearest first)</SelectItem>
                <SelectItem value="pressure">Pressure (lowest first)</SelectItem>
                <SelectItem value="vacancies">Vacancies (most first)</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              resetFilters();
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function FilterChips() {
  const { filters, setFilters } = useAppStore();

  const chips = [
    filters.distanceBand !== 'all' && {
      label: distanceBands.find((b) => b.value === filters.distanceBand)?.label,
      onRemove: () => setFilters({ distanceBand: 'all' }),
    },
    filters.pressure !== 'all' && {
      label: pressureLevels.find((p) => p.value === filters.pressure)?.label,
      onRemove: () => setFilters({ pressure: 'all' }),
    },
  ].filter(Boolean) as { label: string; onRemove: () => void }[];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <Badge
          key={i}
          variant="secondary"
          className="gap-1.5 pl-2.5 pr-1.5 py-1"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
