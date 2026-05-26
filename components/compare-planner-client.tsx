'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Scale, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { CompareMetricsTable } from '@/components/compare-metrics-table';
import { RegistrationProfileForm } from '@/components/registration-profile-form';
import { RegistrationPlanPanel } from '@/components/registration-plan-panel';
import { StudentCareComparePanel } from '@/components/student-care-compare-panel';
import { useAppStore } from '@/lib/store';
import type { SchoolDetailData } from '@/lib/bundled-types';
import { resolveRegistrationYear } from '@/lib/filter-options';
import { rehydrateCompareSchools } from '@/lib/rehydrate-schools';
import { buildCompareSchools, generateRegistrationPlan } from '@/lib/registration-recommendations';

type ComparePlannerClientProps = {
  details: SchoolDetailData[];
};

export function ComparePlannerClient({ details }: ComparePlannerClientProps) {
  const {
    compareList,
    removeFromCompare,
    filters,
    userLat,
    userLng,
    userAddress,
    registrationProfile,
  } = useAppStore();

  const registrationYear = Number(resolveRegistrationYear(filters.year));
  const home =
    userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null;

  const selectedSchools = useMemo(
    () => rehydrateCompareSchools(compareList, details, registrationYear, home),
    [compareList, details, registrationYear, home]
  );

  const compareListForTable = useMemo(
    () => selectedSchools.map((school) => ({ school })),
    [selectedSchools]
  );

  const plan = useMemo(() => {
    if (selectedSchools.length === 0) return null;
    return generateRegistrationPlan(registrationProfile, selectedSchools, registrationYear);
  }, [registrationProfile, selectedSchools, registrationYear]);

  const homeMissing = home == null;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/schools" aria-label="Back to schools">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Registration planner</h1>
              <p className="text-sm text-muted-foreground">
                Year {registrationYear} · Compare odds across your shortlisted schools
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Guidance only — not MOE eligibility verification. Confirm rules on MOE and each school&apos;s
          website before registering.
        </p>

        {homeMissing ? (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
            <p className="text-foreground">
              Set your home address on{' '}
              <Link href="/schools" className="font-medium text-primary hover:underline">
                Schools
              </Link>{' '}
              to compare distance for Phase 2C.
              {userAddress ? ` (Current: ${userAddress} — geocode pending)` : ''}
            </p>
          </div>
        ) : (
          <p className="mb-6 text-xs text-muted-foreground">Home: {userAddress}</p>
        )}

        <div className="space-y-8">
          <RegistrationProfileForm schools={selectedSchools} />

          {compareListForTable.length >= 1 ? (
            <section>
              <h2 className="mb-1 text-lg font-semibold text-foreground">Phase odds comparison</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Historical registered/vacancies and fill % for each phase across your shortlist.
              </p>
              <CompareMetricsTable
                compareList={compareListForTable}
                registrationYear={registrationYear}
                onRemove={removeFromCompare}
                registrationProfile={registrationProfile}
                maxSlots={compareListForTable.length}
              />
            </section>
          ) : null}

          {selectedSchools.length > 0 ? (
            <StudentCareComparePanel schools={selectedSchools} />
          ) : null}

          <RegistrationPlanPanel plan={plan} homeMissing={homeMissing && selectedSchools.length === 0} />

          {compareListForTable.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Add schools from{' '}
                <Link href="/schools" className="text-primary hover:underline">
                  Schools
                </Link>{' '}
                to compare registration odds by phase.
              </p>
            </div>
          ) : null}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
