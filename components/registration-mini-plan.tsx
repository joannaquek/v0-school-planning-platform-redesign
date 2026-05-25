'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import type { RegistrationPlan } from '@/lib/registration-recommendations';
import { cn } from '@/lib/utils';

function phaseLine(
  phase: string,
  schoolName: string | null,
  notEligible?: boolean
): string {
  if (!schoolName) return `${phase}: —`;
  const short = schoolName.length > 22 ? `${schoolName.slice(0, 21)}…` : schoolName;
  return `${phase}: ${short}`;
}

type RegistrationMiniPlanProps = {
  plan: RegistrationPlan | null;
  tiesIncomplete?: boolean;
  className?: string;
};

export function RegistrationMiniPlan({
  plan,
  tiesIncomplete,
  className,
}: RegistrationMiniPlanProps) {
  if (!plan) return null;

  const lines = [
    { label: phaseLine('2A', plan.phase2A.school?.name ?? null), muted: plan.phase2A.notEligible },
    { label: phaseLine('2B', plan.phase2B.school?.name ?? null), muted: plan.phase2B.notEligible },
    { label: phaseLine('2C', plan.phase2C.school?.name ?? null), muted: plan.phase2C.notEligible },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="rounded-md bg-muted/40 px-3 py-2">
        <p className="mb-1 text-xs font-medium text-foreground">Suggested plan</p>
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {lines.map(({ label, muted }) => (
            <li key={label} className={cn(muted && 'text-warning-foreground/90')}>
              {label}
            </li>
          ))}
        </ul>
      </div>
      {tiesIncomplete ? (
        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          Pick one Phase 2A and/or 2B pathway per school on the planner page to compare odds.
        </p>
      ) : null}
      <Link href="/compare" className="text-xs font-medium text-primary hover:underline">
        Open registration planner →
      </Link>
    </div>
  );
}
