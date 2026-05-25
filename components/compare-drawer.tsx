'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { X, Scale, ChevronUp, ChevronDown, GraduationCap, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompareMetricsTable } from '@/components/compare-metrics-table';
import { RegistrationMiniPlan } from '@/components/registration-mini-plan';
import { useAppStore } from '@/lib/store';
import type { School } from '@/lib/types';
import { getAllSchoolDetails } from '@/lib/school-data';
import { resolveRegistrationYear } from '@/lib/filter-options';
import { rehydrateCompareSchools } from '@/lib/rehydrate-schools';
import {
  buildCompareSchools,
  generateRegistrationPlan,
  hasDeclared2ASelection,
  hasDeclared2BSelection,
} from '@/lib/registration-recommendations';
import { cn } from '@/lib/utils';

function getDistanceLabel(school: School): string {
  return school.distance != null ? `${school.distance.toFixed(2)}km` : '—';
}

export function CompareDrawer() {
  const details = useMemo(() => getAllSchoolDetails(), []);
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    showCompareDrawer,
    filters,
    userLat,
    userLng,
    registrationProfile,
  } = useAppStore();
  const [expanded, setExpanded] = useState(false);

  const registrationYear = Number(resolveRegistrationYear(filters.year));
  const home =
    userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null;

  const rehydratedCompare = useMemo(
    () => rehydrateCompareSchools(compareList, details, registrationYear, home),
    [compareList, details, registrationYear, home]
  );

  const compareListForTable = useMemo(
    () => rehydratedCompare.map((school) => ({ school })),
    [rehydratedCompare]
  );

  const selectedSchools = useMemo(
    () => buildCompareSchools(details, registrationYear, home, compareList),
    [details, registrationYear, home, compareList]
  );

  const plan = useMemo(() => {
    if (selectedSchools.length === 0) return null;
    return generateRegistrationPlan(registrationProfile, selectedSchools, registrationYear);
  }, [selectedSchools, registrationProfile, registrationYear]);

  const selectionsIncomplete = useMemo(() => {
    if (!plan) return false;
    const needs2A = plan.phase2A.notEligible && !hasDeclared2ASelection(registrationProfile, selectedSchools);
    const needs2B = plan.phase2B.notEligible && !hasDeclared2BSelection(registrationProfile, selectedSchools);
    return needs2A || needs2B;
  }, [plan, registrationProfile, selectedSchools]);

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
            {plan ? (
              <RegistrationMiniPlan
                plan={plan}
                tiesIncomplete={selectionsIncomplete}
                className="mb-4"
              />
            ) : null}

            {showCompareTable ? (
              <CompareMetricsTable
                compareList={compareListForTable}
                registrationYear={registrationYear}
                onRemove={removeFromCompare}
                registrationProfile={registrationProfile}
              />
            ) : (
              <div className="flex gap-3 overflow-x-auto">
                {compareListForTable.map(({ school }) => (
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

            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/compare">
                  {showCompareTable ? 'Registration planner' : 'Plan my registration'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
