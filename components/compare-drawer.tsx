'use client';

import Image from 'next/image';
import { X, Scale, ChevronUp, ChevronDown, MapPin, Trash2, GraduationCap, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PressureBadge } from '@/components/pressure-badge';
import { useAppStore } from '@/lib/store';
import type { School } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

const MOBILE_COMPARE_METRICS = [
  { key: 'distance', label: 'Distance' },
  { key: 'pressure', label: 'Pressure' },
  { key: 'vacancies', label: 'Vacancies' },
  { key: 'registered', label: 'Registered' },
  { key: 'ballot', label: 'Ballot %' },
] as const;

const SCHOOL_COL_WIDTH = 'w-[92px] min-w-[92px] max-w-[92px]';
const STICKY_LABEL_WIDTH = 'w-[88px] min-w-[88px] max-w-[88px]';

function abbreviateSchoolName(name: string, maxLen = 18): string {
  if (name.length <= maxLen) return name;
  return `${name.slice(0, maxLen - 1)}…`;
}

function getMetricCellValue(school: School, key: (typeof MOBILE_COMPARE_METRICS)[number]['key']) {
  switch (key) {
    case 'distance':
      return school.distance != null ? `${school.distance.toFixed(2)}km` : '—';
    case 'pressure':
      return school.pressure;
    case 'vacancies':
      return String(school.totalVacancies);
    case 'registered':
      return String(school.registeredStudents);
    case 'ballot':
      return school.ballotChance != null ? `${school.ballotChance}%` : '—';
    default:
      return '—';
  }
}

function getBestIndices(
  compareList: { school: School }[],
  key: (typeof MOBILE_COMPARE_METRICS)[number]['key']
): number[] {
  if (compareList.length < 2) return [];

  const indices = compareList.map((_, i) => i);

  switch (key) {
    case 'distance': {
      const min = Math.min(...compareList.map(({ school }) => school.distance ?? 999));
      return indices.filter((i) => compareList[i].school.distance === min);
    }
    case 'pressure': {
      const low = indices.filter((i) => compareList[i].school.pressure === 'low');
      if (low.length) return low;
      return indices.filter((i) => compareList[i].school.pressure === 'moderate');
    }
    case 'vacancies': {
      const max = Math.max(...compareList.map(({ school }) => school.totalVacancies));
      return indices.filter((i) => compareList[i].school.totalVacancies === max);
    }
    case 'ballot': {
      const max = Math.max(...compareList.map(({ school }) => school.ballotChance ?? 0));
      return indices.filter((i) => compareList[i].school.ballotChance === max);
    }
    default:
      return [];
  }
}

function MobileCompareTable({
  compareList,
  onRemove,
}: {
  compareList: { school: School }[];
  onRemove: (schoolId: string) => void;
}) {
  const emptySlots = 4 - compareList.length;

  return (
    <div className="md:hidden">
      <p className="mb-2 text-xs text-muted-foreground">Swipe sideways to compare schools →</p>
      <div className="relative -mx-4">
        <div
          className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 bg-gradient-to-l from-card via-card/80 to-transparent"
          aria-hidden
        />
        <div className="overflow-x-auto px-4 pb-1">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th
                  className={cn(
                    STICKY_LABEL_WIDTH,
                    'sticky left-0 z-30 bg-card pb-2 pr-2 text-left align-bottom'
                  )}
                />
                {compareList.map(({ school }) => (
                  <th
                    key={school.id}
                    className={cn(SCHOOL_COL_WIDTH, 'relative px-1 pb-2 align-bottom')}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onRemove(school.id)}
                        className="absolute -right-0.5 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
                        aria-label={`Remove ${school.name} from comparison`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-md bg-secondary">
                        {school.imageUrl ? (
                          <Image
                            src={school.imageUrl}
                            alt=""
                            width={44}
                            height={44}
                            className="max-h-full w-auto max-w-full object-contain p-0.5"
                          />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-secondary-foreground/40" />
                        )}
                      </div>
                      <Link
                        href={`/schools/${school.id}`}
                        className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-foreground hover:text-primary"
                        title={school.name}
                      >
                        {abbreviateSchoolName(school.name)}
                      </Link>
                    </div>
                  </th>
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <th key={`empty-head-${i}`} className={cn(SCHOOL_COL_WIDTH, 'px-1 pb-2 align-bottom')}>
                    <div className="flex h-[88px] flex-col items-center justify-center rounded-lg border border-dashed border-border px-1 text-center">
                      <Plus className="mb-1 h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] leading-tight text-muted-foreground">Add school</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOBILE_COMPARE_METRICS.map(({ key, label }) => {
                const bestIndices = getBestIndices(compareList, key);

                return (
                  <tr key={key}>
                    <td
                      className={cn(
                        STICKY_LABEL_WIDTH,
                        'sticky left-0 z-10 bg-card py-2.5 pr-2 text-xs font-medium text-muted-foreground'
                      )}
                    >
                      {label}
                    </td>
                    {compareList.map(({ school }, index) => {
                      const value = getMetricCellValue(school, key);
                      const isBest = bestIndices.includes(index);

                      return (
                        <td key={school.id} className={cn(SCHOOL_COL_WIDTH, 'px-1 py-2.5 text-center')}>
                          {key === 'pressure' ? (
                            <div
                              className={cn(
                                'flex justify-center rounded-full',
                                isBest && 'ring-2 ring-success/40'
                              )}
                            >
                              <PressureBadge pressure={school.pressure} size="sm" />
                            </div>
                          ) : (
                            <span
                              className={cn(
                                'inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold',
                                isBest ? 'bg-success/15 text-success' : 'text-foreground'
                              )}
                            >
                              {value}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                      <td
                        key={`empty-metric-${key}-${i}`}
                        className={cn(SCHOOL_COL_WIDTH, 'px-1 py-2.5 text-center text-muted-foreground')}
                      >
                        —
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare, showCompareDrawer } = useAppStore();
  const [expanded, setExpanded] = useState(false);

  if (compareList.length === 0) return null;

  const showMobileTable = compareList.length >= 2;

  return (
    <div
      className={cn(
        'fixed bottom-16 left-0 right-0 z-40 transition-all duration-300 ease-out md:bottom-0',
        showCompareDrawer ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="border-t border-border bg-card shadow-lg">
        <div className="flex w-full items-center justify-between gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:bg-muted/50 rounded-md -ml-1 pl-1 py-0.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Comparing {compareList.length} school{compareList.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                {4 - compareList.length} more can be added
                {showMobileTable && !expanded ? ' · Tap to compare side by side' : ''}
              </p>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => clearCompare()}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted/50"
              aria-label={expanded ? 'Collapse comparison' : 'Expand comparison'}
            >
              {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            expanded ? 'max-h-[72vh] md:max-h-[500px]' : 'max-h-0'
          )}
        >
          <div className="overflow-y-auto border-t border-border p-4 md:max-h-[500px]">
            {showMobileTable && (
              <MobileCompareTable compareList={compareList} onRemove={removeFromCompare} />
            )}

            {/* Single school on mobile: compact strip */}
            {compareList.length === 1 && (
              <div className="flex gap-3 overflow-x-auto md:hidden">
                {compareList.map(({ school }) => (
                  <Card key={school.id} className="relative min-w-[140px] shrink-0">
                    <button
                      type="button"
                      onClick={() => removeFromCompare(school.id)}
                      className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <CardContent className="p-3">
                      <div className="mb-2 flex h-12 w-full items-center justify-center rounded-md bg-secondary">
                        {school.imageUrl ? (
                          <Image
                            src={school.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="max-h-full w-auto max-w-full object-contain p-1"
                          />
                        ) : (
                          <GraduationCap className="h-6 w-6 text-secondary-foreground/40" />
                        )}
                      </div>
                      <Link href={`/schools/${school.id}`}>
                        <h4 className="line-clamp-2 text-sm font-medium text-foreground">{school.name}</h4>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
                <Card className="min-w-[120px] shrink-0 border-dashed">
                  <CardContent className="flex h-full items-center justify-center p-4 text-center">
                    <p className="text-xs text-muted-foreground">Add one more to compare</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Desktop: card grid + table preview */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 gap-3">
                {compareList.map(({ school }) => (
                  <Card key={school.id} className="relative">
                    <button
                      type="button"
                      onClick={() => removeFromCompare(school.id)}
                      className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <CardContent className="p-3">
                      <div className="mb-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-md bg-secondary">
                        {school.imageUrl ? (
                          <Image
                            src={school.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="max-h-full w-auto max-w-full object-contain p-1"
                          />
                        ) : (
                          <GraduationCap className="h-6 w-6 text-secondary-foreground/40" />
                        )}
                      </div>
                      <Link href={`/schools/${school.id}`}>
                        <h4 className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {school.name}
                        </h4>
                      </Link>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{school.distance != null ? `${school.distance.toFixed(2)}km` : '—'}</span>
                      </div>
                      <div className="mt-2">
                        <PressureBadge pressure={school.pressure} size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                  <Card key={`empty-${i}`} className="border-dashed">
                    <CardContent className="flex items-center justify-center p-6 text-center">
                      <p className="text-xs text-muted-foreground">Add school to compare</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showMobileTable && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">Metric</th>
                        {compareList.map(({ school }) => (
                          <th key={school.id} className="px-2 pb-2 text-center font-medium text-foreground">
                            {abbreviateSchoolName(school.name, 24)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MOBILE_COMPARE_METRICS.map(({ key, label }) => (
                        <tr key={key}>
                          <td className="py-2 pr-4 text-muted-foreground">{label}</td>
                          {compareList.map(({ school }) => (
                            <td key={school.id} className="px-2 py-2 text-center font-medium">
                              {key === 'pressure' ? (
                                <div className="flex justify-center">
                                  <PressureBadge pressure={school.pressure} size="sm" />
                                </div>
                              ) : (
                                getMetricCellValue(school, key)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {showMobileTable && (
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/compare">View full comparison</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
