'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GraduationCap, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registrationPhaseFootnotes } from '@/lib/filter-options';
import type { RegistrationPlan, PhaseRecommendation } from '@/lib/registration-recommendations';
import { getPhaseFillIntensity } from '@/lib/compare-phase-metrics';
import { cn } from '@/lib/utils';

function fillToneClass(fillPercent: number | undefined): string {
  if (fillPercent == null) return '';
  const intensity = getPhaseFillIntensity(fillPercent);
  if (intensity === 'oversubscribed') return 'text-destructive';
  if (intensity === 'high') return 'text-warning-foreground';
  return 'text-success';
}

function PhaseCard({ rec, year }: { rec: PhaseRecommendation; year: number }) {
  const footnote = registrationPhaseFootnotes[rec.phase];

  return (
    <Card className={cn(rec.notEligible && 'opacity-80')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Phase {rec.phase}</CardTitle>
        <CardDescription className="text-xs">
          <span className="font-medium text-foreground">{footnote.label}</span>
          {' — '}
          {footnote.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rec.school ? (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
                {rec.school.imageUrl ? (
                  <Image
                    src={rec.school.imageUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="max-h-full w-auto max-w-full object-contain p-1"
                  />
                ) : (
                  <GraduationCap className="h-6 w-6 text-secondary-foreground/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{rec.headline}</p>
                <Link
                  href={`/schools/${rec.school.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View school
                </Link>
                {rec.school.distance != null && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {rec.school.distance.toFixed(2)}km
                    {rec.school.distanceBand === '1km' ? ' · within 1km' : ''}
                  </p>
                )}
                {rec.fillPercent != null && (
                  <p className={cn('mt-1 text-xs font-medium tabular-nums', fillToneClass(rec.fillPercent))}>
                    {year} data: {rec.fillPercent}% fill
                  </p>
                )}
              </div>
            </div>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
              {rec.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {rec.alternatives.length > 0 && (
              <div className="border-t border-border pt-2">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Runner-up</p>
                <ul className="space-y-1">
                  {rec.alternatives.map((alt) => (
                    <li key={alt.id}>
                      <Link
                        href={`/schools/${alt.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {alt.name}
                        {alt.distance != null ? ` (${alt.distance.toFixed(2)}km)` : ''}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="font-medium text-foreground">{rec.headline}</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {rec.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type RegistrationPlanPanelProps = {
  plan: RegistrationPlan | null;
  homeMissing?: boolean;
};

export function RegistrationPlanPanel({ plan, homeMissing }: RegistrationPlanPanelProps) {
  if (homeMissing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your registration plan</CardTitle>
          <CardDescription>
            Enter your home address on Schools to enable distance-based Phase 2C recommendations and
            nearby school ties.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!plan) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Your registration plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Best historical odds among your shortlisted schools for each phase, based on your one
          pathway per school and {plan.year} registration data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <PhaseCard rec={plan.phase2A} year={plan.year} />
        <PhaseCard rec={plan.phase2B} year={plan.year} />
        <PhaseCard rec={plan.phase2C} year={plan.year} />
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
          ≤100% fill
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
          &gt;100%
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden />
          &gt;150%
        </span>
      </p>
    </div>
  );
}
