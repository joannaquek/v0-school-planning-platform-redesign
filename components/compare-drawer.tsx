'use client';

import Image from 'next/image';
import { X, Scale, ChevronUp, ChevronDown, GraduationCap, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { School } from '@/lib/types';
import { resolveRegistrationYear } from '@/lib/filter-options';
import {
  compareDrawerMetrics,
  getPhaseRegistrationSnapshot,
  getPhaseFillRatio,
  getPhaseFillIntensity,
  type CompareDrawerMetricKey,
  type RegistrationPhase,
  type PhaseFillIntensity,
} from '@/lib/compare-phase-metrics';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

const SCHOOL_COL_WIDTH = 'w-[92px] min-w-[92px] max-w-[92px]';
const STICKY_LABEL_WIDTH = 'w-[88px] min-w-[88px] max-w-[88px]';

function abbreviateSchoolName(name: string, maxLen = 18): string {
  if (name.length <= maxLen) return name;
  return `${name.slice(0, maxLen - 1)}…`;
}

function getDistanceLabel(school: School): string {
  return school.distance != null ? `${school.distance.toFixed(2)}km` : '—';
}

function getBestIndices(
  compareList: { school: School }[],
  key: CompareDrawerMetricKey,
  registrationYear: number
): number[] {
  if (compareList.length < 2) return [];

  const indices = compareList.map((_, i) => i);

  if (key === 'distance') {
    const min = Math.min(...compareList.map(({ school }) => school.distance ?? 999));
    return indices.filter((i) => compareList[i].school.distance === min);
  }

  const phase = key as RegistrationPhase;
  const ratios = compareList.map(({ school }) => getPhaseFillRatio(school, registrationYear, phase));
  const withinCapacity = ratios
    .map((r, i) => (r != null && r <= 1 ? { r, i } : null))
    .filter((x): x is { r: number; i: number } => x != null);
  if (withinCapacity.length === 0) return [];

  const minRatio = Math.min(...withinCapacity.map((x) => x.r));
  return withinCapacity.filter((x) => x.r === minRatio).map((x) => x.i);
}

function phaseCellTone(fillPercent: number, isBest: boolean): string {
  const intensity = getPhaseFillIntensity(fillPercent);
  if (intensity === 'oversubscribed') {
    return 'bg-destructive/15 text-destructive ring-1 ring-destructive/25';
  }
  if (intensity === 'high') {
    return 'bg-warning/15 text-warning-foreground ring-1 ring-warning/35';
  }
  if (isBest) {
    return 'bg-success/15 text-success ring-1 ring-success/25';
  }
  return 'text-foreground';
}

function phaseSublineTone(intensity: PhaseFillIntensity, isBest: boolean): string {
  if (intensity === 'oversubscribed') return 'text-destructive/90';
  if (intensity === 'high') return 'text-warning-foreground/90';
  if (isBest) return 'text-success/90';
  return 'text-muted-foreground';
}

function MetricCell({
  school,
  metricKey,
  registrationYear,
  isBest,
}: {
  school: School;
  metricKey: CompareDrawerMetricKey;
  registrationYear: number;
  isBest: boolean;
}) {
  if (metricKey === 'distance') {
    return (
      <span
        className={cn(
          'inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold',
          isBest ? 'bg-success/15 text-success' : 'text-foreground'
        )}
      >
        {getDistanceLabel(school)}
      </span>
    );
  }

  const snapshot = getPhaseRegistrationSnapshot(
    school,
    registrationYear,
    metricKey as RegistrationPhase
  );

  if (!snapshot) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const intensity = getPhaseFillIntensity(snapshot.fillPercent);
  const highlightBest = isBest && intensity === 'comfortable';

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center rounded-md px-1.5 py-0.5',
        phaseCellTone(snapshot.fillPercent, highlightBest)
      )}
    >
      <span className="text-xs font-semibold tabular-nums">{snapshot.label}</span>
      <span className={cn('text-[10px] tabular-nums', phaseSublineTone(intensity, highlightBest))}>
        {snapshot.fillPercent}% fill
      </span>
    </div>
  );
}

function CompareMetricsTable({
  compareList,
  registrationYear,
  onRemove,
  className,
}: {
  compareList: { school: School }[];
  registrationYear: number;
  onRemove: (schoolId: string) => void;
  className?: string;
}) {
  const emptySlots = 4 - compareList.length;

  return (
    <div className={className}>
      <p className="mb-2 text-xs text-muted-foreground">
        {registrationYear} registration · registered/vacancies per phase
        <span className="md:hidden"> · Swipe sideways →</span>
      </p>
      <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
          ≤100% fill
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
          &gt;100% (high demand)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden />
          &gt;150% (oversubscribed)
        </span>
      </p>
      <div className="relative md:-mx-0 -mx-4">
        <div
          className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 bg-gradient-to-l from-card via-card/80 to-transparent md:hidden"
          aria-hidden
        />
        <div className="overflow-x-auto px-4 pb-1 md:px-0">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th
                  className={cn(
                    STICKY_LABEL_WIDTH,
                    'sticky left-0 z-30 bg-card pb-2 pr-2 text-left align-bottom md:static md:z-auto'
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
              {compareDrawerMetrics.map(({ key, label }) => {
                const bestIndices = getBestIndices(compareList, key, registrationYear);

                return (
                  <tr key={key}>
                    <td
                      className={cn(
                        STICKY_LABEL_WIDTH,
                        'sticky left-0 z-10 bg-card py-2.5 pr-2 text-xs font-medium text-muted-foreground md:static md:z-auto'
                      )}
                    >
                      {label}
                    </td>
                    {compareList.map(({ school }, index) => (
                      <td key={school.id} className={cn(SCHOOL_COL_WIDTH, 'px-1 py-2.5 text-center')}>
                        <MetricCell
                          school={school}
                          metricKey={key}
                          registrationYear={registrationYear}
                          isBest={bestIndices.includes(index)}
                        />
                      </td>
                    ))}
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
  const { compareList, removeFromCompare, clearCompare, showCompareDrawer, filters } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const registrationYear = Number(resolveRegistrationYear(filters.year));

  if (compareList.length === 0) return null;

  const showCompareTable = compareList.length >= 2;

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
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md -ml-1 py-0.5 pl-1 text-left transition-colors hover:bg-muted/50"
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
                {showCompareTable && !expanded ? ' · Tap to compare side by side' : ''}
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
            {showCompareTable ? (
              <CompareMetricsTable
                compareList={compareList}
                registrationYear={registrationYear}
                onRemove={removeFromCompare}
              />
            ) : (
              <div className="flex gap-3 overflow-x-auto">
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
                      <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                        {getDistanceLabel(school)}
                      </p>
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

            {showCompareTable ? (
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href="/compare">View full comparison</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
