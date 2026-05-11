'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const phases = [
  {
    phase: 'Phase 1',
    shortPhase: 'P1',
    description: 'Siblings of current students',
    registrationStart: '30 Jun, 9am',
    registrationEnd: '2 Jul, 4:30pm',
    results: '8 Jul',
    startDate: new Date('2026-06-30'),
    endDate: new Date('2026-07-02'),
    resultsDate: new Date('2026-07-08'),
  },
  {
    phase: 'Phase 2A',
    shortPhase: '2A',
    description: 'Children of alumni, school staff & advisory committee',
    registrationStart: '9 Jul, 9am',
    registrationEnd: '10 Jul, 4:30pm',
    results: '17 Jul',
    startDate: new Date('2026-07-09'),
    endDate: new Date('2026-07-10'),
    resultsDate: new Date('2026-07-17'),
  },
  {
    phase: 'Phase 2B',
    shortPhase: '2B',
    description: 'Parents who are community volunteers or church/clan members',
    registrationStart: '20 Jul, 9am',
    registrationEnd: '21 Jul, 4:30pm',
    results: '27 Jul',
    startDate: new Date('2026-07-20'),
    endDate: new Date('2026-07-21'),
    resultsDate: new Date('2026-07-27'),
  },
  {
    phase: 'Phase 2C',
    shortPhase: '2C',
    description: 'Open to all Singapore Citizens and PRs',
    registrationStart: '28 Jul, 9am',
    registrationEnd: '30 Jul, 4:30pm',
    results: '11 Aug',
    startDate: new Date('2026-07-28'),
    endDate: new Date('2026-07-30'),
    resultsDate: new Date('2026-08-11'),
  },
  {
    phase: 'Phase 2C Supp.',
    shortPhase: '2C+',
    description: 'Schools with remaining vacancies after Phase 2C',
    registrationStart: '17 Aug, 9am',
    registrationEnd: '18 Aug, 4:30pm',
    results: '27 Aug',
    startDate: new Date('2026-08-17'),
    endDate: new Date('2026-08-18'),
    resultsDate: new Date('2026-08-27'),
  },
];

function getPhaseStatus(startDate: Date, resultsDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today > resultsDate) return 'completed';
  if (today >= startDate && today <= resultsDate) return 'active';
  return 'upcoming';
}

export function RegistrationTimeline() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Section header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                2026 Registration Timeline
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Primary One Registration Exercise key dates
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs px-3 py-1.5">
              <Clock className="mr-1.5 h-3 w-3" />
              Jun – Aug 2026
            </Badge>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-5 bottom-5 w-px bg-border sm:left-7" />

            <div className="space-y-3">
              {phases.map((p, idx) => {
                const status = getPhaseStatus(p.startDate, p.resultsDate);
                const isExpanded = expanded === p.phase;
                const isLast = idx === phases.length - 1;

                return (
                  <div key={p.phase} className="relative">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.phase)}
                      className="group relative w-full text-left"
                      aria-expanded={isExpanded}
                      aria-label={`Toggle ${p.phase} details`}
                    >
                      <div
                        className={cn(
                          'flex items-start gap-4 rounded-2xl border p-4 transition-all sm:gap-5',
                          status === 'active'
                            ? 'border-primary/40 bg-primary/5 shadow-sm'
                            : status === 'completed'
                            ? 'border-border/50 bg-card/50'
                            : 'border-border/50 bg-card hover:border-border hover:shadow-sm',
                          isExpanded && 'rounded-b-none border-b-0'
                        )}
                      >
                        {/* Step indicator */}
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background sm:h-14 sm:w-14">
                          {status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-success sm:h-6 sm:w-6" />
                          ) : status === 'active' ? (
                            <>
                              <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                              <Circle className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                            </>
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground sm:text-sm">{idx + 1}</span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                              'font-semibold text-foreground',
                              status === 'active' && 'text-primary'
                            )}>
                              {p.phase}
                            </span>
                            {status === 'active' && (
                              <Badge className="bg-primary/15 text-primary border-0 text-xs">
                                Ongoing
                              </Badge>
                            )}
                            {status === 'completed' && (
                              <Badge variant="secondary" className="text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {p.description}
                          </p>

                          {/* Dates row — always visible */}
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted-foreground">
                              <span className="font-medium text-foreground">{p.registrationStart}</span>
                              {' – '}
                              <span className="font-medium text-foreground">{p.registrationEnd}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Results:{' '}
                              <span className="font-medium text-foreground">{p.results}</span>
                            </span>
                          </div>
                        </div>

                        {/* Expand chevron */}
                        <div className={cn(
                          'shrink-0 text-muted-foreground transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded detail panel */}
                      {isExpanded && (
                        <div className="rounded-b-2xl border border-t-0 border-border/50 bg-muted/40 px-4 pb-4 pt-3 sm:px-5">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-card p-3 border border-border/50">
                              <p className="text-xs text-muted-foreground">Registration Opens</p>
                              <p className="mt-1 font-medium text-foreground">{p.registrationStart}</p>
                            </div>
                            <div className="rounded-xl bg-card p-3 border border-border/50">
                              <p className="text-xs text-muted-foreground">Registration Closes</p>
                              <p className="mt-1 font-medium text-foreground">{p.registrationEnd}</p>
                            </div>
                            <div className={cn(
                              'rounded-xl p-3 border',
                              status === 'active' ? 'bg-primary/5 border-primary/20' : 'bg-card border-border/50'
                            )}>
                              <p className="text-xs text-muted-foreground">Results Announced</p>
                              <p className={cn(
                                'mt-1 font-medium',
                                status === 'active' ? 'text-primary' : 'text-foreground'
                              )}>
                                {p.results}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            {p.description}. Registration is done online via the MOE P1 Registration portal.
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Dates from MOE P1 Registration Exercise 2026. Subject to change — verify at{' '}
            <a
              href="https://www.moe.gov.sg/primary/p1-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              moe.gov.sg
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
