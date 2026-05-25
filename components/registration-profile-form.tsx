'use client';

import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import {
  phase2AOptions,
  phase2BOptions,
  citizenshipLabel,
  getSchoolPhaseSelections,
} from '@/lib/registration-profile';
import type { Phase2ATie, Phase2BTie, School } from '@/lib/types';
import { cn } from '@/lib/utils';

const NONE_2A = '__none_2a__';
const NONE_2B = '__none_2b__';

type RegistrationProfileFormProps = {
  schools: School[];
  compact?: boolean;
};

export function RegistrationProfileForm({ schools, compact = false }: RegistrationProfileFormProps) {
  const { registrationProfile, setRegistrationProfile, setSchoolPhaseSelection } = useAppStore();

  const displaySchools = compact ? schools.slice(0, 4) : schools;

  return (
    <Card>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <CardTitle className={compact ? 'text-base' : undefined}>Your registration plan</CardTitle>
        <CardDescription>
          Pick one pathway per phase for each school in your shortlist. We compare historical fill
          rates across those schools.
          {!compact && (
            <>
              {' '}
              <Link href="/guide" className="text-primary underline-offset-2 hover:underline">
                MOE phase guide
              </Link>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">Child&apos;s citizenship</legend>
          <div className="flex flex-wrap gap-2">
            {(['sc', 'pr'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRegistrationProfile({ citizenship: value })}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  registrationProfile.citizenship === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                )}
                aria-pressed={registrationProfile.citizenship === value}
              >
                {citizenshipLabel(value)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Phase 2C applies to all shortlisted schools when your child is SC/PR (distance from home
            affects priority).
          </p>
        </fieldset>

        {displaySchools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add schools to compare from{' '}
            <Link href="/schools" className="text-primary hover:underline">
              Schools
            </Link>{' '}
            — then choose how you would register at each one per phase.
          </p>
        ) : (
          <div className="space-y-4">
            {displaySchools.map((school) => {
              const selections = getSchoolPhaseSelections(registrationProfile, school.id);

              return (
                <div
                  key={school.id}
                  className="space-y-3 rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{school.name}</p>
                    {school.distance != null && (
                      <p className="text-xs text-muted-foreground">
                        {school.distance.toFixed(2)}km from home
                      </p>
                    )}
                  </div>
                  <fieldset className="space-y-2">
                    <legend className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Phase 2A
                    </legend>
                    <RadioGroup
                      value={selections.phase2A ?? NONE_2A}
                      onValueChange={(v) =>
                        setSchoolPhaseSelection(
                          school.id,
                          '2A',
                          v === NONE_2A ? null : (v as Phase2ATie)
                        )
                      }
                      className="gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value={NONE_2A} id={`${school.id}-2a-none`} />
                        <Label
                          htmlFor={`${school.id}-2a-none`}
                          className="cursor-pointer text-xs font-normal text-muted-foreground"
                        >
                          Not applying in Phase 2A at this school
                        </Label>
                      </div>
                      {phase2AOptions.map(({ value, label, hint }) => (
                        <div key={value} className="flex items-start gap-2">
                          <RadioGroupItem value={value} id={`${school.id}-2a-${value}`} />
                          <Label
                            htmlFor={`${school.id}-2a-${value}`}
                            className="cursor-pointer text-xs font-normal leading-snug text-foreground"
                            title={hint}
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </fieldset>
                  <fieldset className="space-y-2">
                    <legend className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Phase 2B
                    </legend>
                    <RadioGroup
                      value={selections.phase2B ?? NONE_2B}
                      onValueChange={(v) =>
                        setSchoolPhaseSelection(
                          school.id,
                          '2B',
                          v === NONE_2B ? null : (v as Phase2BTie)
                        )
                      }
                      className="gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value={NONE_2B} id={`${school.id}-2b-none`} />
                        <Label
                          htmlFor={`${school.id}-2b-none`}
                          className="cursor-pointer text-xs font-normal text-muted-foreground"
                        >
                          Not applying in Phase 2B at this school
                        </Label>
                      </div>
                      {phase2BOptions.map(({ value, label, hint }) => (
                        <div key={value} className="flex items-start gap-2">
                          <RadioGroupItem value={value} id={`${school.id}-2b-${value}`} />
                          <Label
                            htmlFor={`${school.id}-2b-${value}`}
                            className="cursor-pointer text-xs font-normal leading-snug text-foreground"
                            title={hint}
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </fieldset>
                </div>
              );
            })}
            {compact && schools.length > 4 ? (
              <p className="text-xs text-muted-foreground">
                +{schools.length - 4} more schools on the full planner page
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
