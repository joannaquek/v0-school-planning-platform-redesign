'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const phases = [
  {
    phase: 'Phase 1',
    shortLabel: 'Phase 1',
    description: 'Siblings of current students',
    registrationStart: '30 Jun 9am',
    registrationEnd: '2 Jul 4:30pm',
    results: '8 Jul',
    startDate: new Date('2026-06-30T09:00:00'),
    endDate: new Date('2026-07-02T16:30:00'),
    resultsDate: new Date('2026-07-08'),
    color: 'teal',
  },
  {
    phase: 'Phase 2A',
    shortLabel: 'Phase 2A',
    description: 'Children of alumni & school staff',
    registrationStart: '9 Jul 9am',
    registrationEnd: '10 Jul 4:30pm',
    results: '17 Jul',
    startDate: new Date('2026-07-09T09:00:00'),
    endDate: new Date('2026-07-10T16:30:00'),
    resultsDate: new Date('2026-07-17'),
    color: 'blue',
  },
  {
    phase: 'Phase 2B',
    shortLabel: 'Phase 2B',
    description: 'Community volunteers & church/clan members',
    registrationStart: '20 Jul 9am',
    registrationEnd: '21 Jul 4:30pm',
    results: '27 Jul',
    startDate: new Date('2026-07-20T09:00:00'),
    endDate: new Date('2026-07-21T16:30:00'),
    resultsDate: new Date('2026-07-27'),
    color: 'violet',
  },
  {
    phase: 'Phase 2C',
    shortLabel: 'Phase 2C',
    description: 'Open to all Singapore Citizens & PRs',
    registrationStart: '28 Jul 9am',
    registrationEnd: '30 Jul 4:30pm',
    results: '11 Aug',
    startDate: new Date('2026-07-28T09:00:00'),
    endDate: new Date('2026-07-30T16:30:00'),
    resultsDate: new Date('2026-08-11'),
    color: 'amber',
  },
  {
    phase: 'Phase 2C Supp.',
    shortLabel: '2C Supp.',
    description: 'Schools with remaining vacancies',
    registrationStart: '17 Aug 9am',
    registrationEnd: '18 Aug 4:30pm',
    results: '27 Aug',
    startDate: new Date('2026-08-17T09:00:00'),
    endDate: new Date('2026-08-18T16:30:00'),
    resultsDate: new Date('2026-08-27'),
    color: 'rose',
  },
];

type ColorKey = 'teal' | 'blue' | 'violet' | 'amber' | 'rose';

const colorMap: Record<ColorKey, { node: string; nodeBorder: string; label: string; card: string; cardBorder: string; dot: string }> = {
  teal:   { node: 'bg-teal-500',   nodeBorder: 'border-teal-500',   label: 'text-teal-700',   card: 'bg-teal-50',   cardBorder: 'border-teal-200',   dot: 'bg-teal-500' },
  blue:   { node: 'bg-blue-500',   nodeBorder: 'border-blue-500',   label: 'text-blue-700',   card: 'bg-blue-50',   cardBorder: 'border-blue-200',   dot: 'bg-blue-500' },
  violet: { node: 'bg-violet-500', nodeBorder: 'border-violet-500', label: 'text-violet-700', card: 'bg-violet-50', cardBorder: 'border-violet-200', dot: 'bg-violet-500' },
  amber:  { node: 'bg-amber-500',  nodeBorder: 'border-amber-500',  label: 'text-amber-700',  card: 'bg-amber-50',  cardBorder: 'border-amber-200',  dot: 'bg-amber-500' },
  rose:   { node: 'bg-rose-500',   nodeBorder: 'border-rose-500',   label: 'text-rose-700',   card: 'bg-rose-50',   cardBorder: 'border-rose-200',   dot: 'bg-rose-500' },
};

function getPhaseStatus(startDate: Date, resultsDate: Date) {
  const today = new Date();
  if (today > resultsDate) return 'completed';
  if (today >= startDate) return 'active';
  return 'upcoming';
}

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function RegistrationTimeline() {
  const [activePhase, setActivePhase] = useState<string | null>(null);

  const phase1 = phases[0];
  const daysUntilPhase1 = getDaysUntil(phase1.startDate);
  const phase1Status = getPhaseStatus(phase1.startDate, phase1.resultsDate);

  return (
    <section className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">

          {/* Header row */}
          <div className="mb-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">MOE P1 Registration 2026</p>
              <h2 className="text-2xl font-bold text-foreground">Registration Timeline</h2>
            </div>

            {/* Countdown chip — only show if Phase 1 hasn't started */}
            {phase1Status === 'upcoming' && daysUntilPhase1 > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
                <div className="text-center">
                  <p className="text-2xl font-bold leading-none text-teal-700">{daysUntilPhase1}</p>
                  <p className="mt-0.5 text-xs text-teal-600">days</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-teal-800">Until Phase 1 opens</p>
                  <p className="text-xs text-teal-600">Starts {phase1.registrationStart}</p>
                </div>
              </div>
            )}
            {phase1Status === 'active' && (
              <div className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
                </span>
                <p className="text-sm font-semibold text-teal-800">Phase 1 is open now</p>
              </div>
            )}
          </div>

          {/* Vertical timeline — mobile only */}
          <div className="sm:hidden">
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" />

              {phases.map((p, idx) => {
                const colors = colorMap[p.color as ColorKey];
                const status = getPhaseStatus(p.startDate, p.resultsDate);
                const isActive = activePhase === p.phase;
                const isCurrentPhase = status === 'active';
                const daysUntil = getDaysUntil(p.startDate);

                return (
                  <div key={p.phase} className={cn('relative mb-5 last:mb-0')}>
                    {/* Node */}
                    <div className="absolute -left-8 flex h-7 w-7 items-center justify-center">
                      <button
                        onClick={() => setActivePhase(isActive ? null : p.phase)}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-background transition-all',
                          isActive
                            ? `${colors.node} border-transparent text-white shadow-md`
                            : status === 'completed'
                            ? 'border-border bg-muted text-muted-foreground'
                            : isCurrentPhase
                            ? `${colors.nodeBorder} ${colors.node} text-white shadow-md`
                            : 'border-border bg-background'
                        )}
                        aria-label={`View ${p.phase} details`}
                      >
                        {status === 'completed' ? (
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className={cn(
                            'text-[10px] font-bold',
                            isActive || isCurrentPhase ? 'text-white' : 'text-muted-foreground'
                          )}>
                            {idx + 1}
                          </span>
                        )}
                      </button>
                      {isCurrentPhase && !isActive && (
                        <span className={cn('absolute inset-0 rounded-full animate-ping opacity-30', colors.node)} />
                      )}
                    </div>

                    {/* Content card */}
                    <button
                      onClick={() => setActivePhase(isActive ? null : p.phase)}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition-all',
                        isActive
                          ? `${colors.card} ${colors.cardBorder}`
                          : 'border-border bg-card hover:border-primary/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-base font-bold', isActive ? colors.label : 'text-foreground')}>
                              {p.phase}
                            </span>
                            {status === 'active' && (
                              <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border', colors.card, colors.cardBorder, colors.label)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', colors.dot)} />
                                Open
                              </span>
                            )}
                            {status === 'upcoming' && daysUntil > 0 && idx === 0 && (
                              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold border', colors.card, colors.cardBorder, colors.label)}>
                                In {daysUntil}d
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <p className="mt-1 rounded-md bg-background/70 px-2 py-1 text-xs text-muted-foreground">
                              {p.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] text-muted-foreground">{p.registrationStart}</p>
                          <p className="text-[11px] text-muted-foreground">– {p.registrationEnd}</p>
                          <p className={cn('mt-0.5 text-[11px] font-semibold', colors.label)}>Results: {p.results}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Horizontal timeline — desktop only */}
          <div className="hidden sm:block overflow-x-auto pb-4 no-scrollbar">
            <div className="min-w-[640px]">

              {/* Top labels (phase name + reg dates) */}
              <div className="flex">
                {phases.map((p, idx) => {
                  const colors = colorMap[p.color as ColorKey];
                  const status = getPhaseStatus(p.startDate, p.resultsDate);
                  const isActive = activePhase === p.phase;
                  return (
                    <Tooltip key={p.phase}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActivePhase(isActive ? null : p.phase)}
                          className={cn(
                            'group flex-1 cursor-pointer text-left',
                            idx !== phases.length - 1 && 'pr-2'
                          )}
                        >
                          {/* Phase label */}
                          <div className={cn(
                            'mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold transition-colors',
                            isActive
                              ? `${colors.card} ${colors.label} ${colors.cardBorder} border`
                              : 'text-muted-foreground hover:text-foreground'
                          )}>
                            <span className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              status === 'completed' ? 'bg-muted-foreground' : colors.dot
                            )} />
                            {p.shortLabel}
                          </div>

                          {/* Reg dates */}
                          <p className="text-[11px] leading-tight text-muted-foreground">
                            {p.registrationStart}
                          </p>
                          <p className="text-[11px] leading-tight text-muted-foreground">
                            to {p.registrationEnd}
                          </p>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8}>
                        {p.description}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Track with nodes */}
              <div className="relative my-5 flex items-center">
                {/* Full connecting line */}
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />

                {phases.map((p, idx) => {
                  const colors = colorMap[p.color as ColorKey];
                  const status = getPhaseStatus(p.startDate, p.resultsDate);
                  const isActive = activePhase === p.phase;
                  const isCurrentPhase = status === 'active';

                  return (
                    <div
                      key={p.phase}
                      className={cn('relative z-10 flex flex-1 items-center', idx === phases.length - 1 && 'justify-end')}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setActivePhase(isActive ? null : p.phase)}
                            className="group relative flex flex-col items-center focus:outline-none"
                            aria-label={`View ${p.phase} details`}
                          >
                        {/* Node */}
                            <div className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-full border-2 bg-background transition-all duration-200 group-hover:scale-110',
                              isActive
                                ? `${colors.node} border-transparent text-white shadow-lg`
                                : status === 'completed'
                                ? 'border-border bg-muted text-muted-foreground'
                                : isCurrentPhase
                                ? `${colors.nodeBorder} text-white ${colors.node} shadow-md`
                                : 'border-border bg-background'
                            )}>
                              {status === 'completed' ? (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <span className={cn(
                                  'text-xs font-bold',
                                  isActive || isCurrentPhase ? 'text-white' : 'text-muted-foreground'
                                )}>
                                  {idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Pulse ring for active phase */}
                            {isCurrentPhase && !isActive && (
                              <span className={cn('absolute inset-0 rounded-full animate-ping opacity-30', colors.node)} />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={8}>
                          {p.description}
                        </TooltipContent>
                      </Tooltip>

                      {/* Progress fill between nodes */}
                      {idx < phases.length - 1 && (
                        <div className={cn(
                          'h-px flex-1 transition-all duration-500',
                          status === 'completed' ? 'bg-muted-foreground/40' : 'bg-border'
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom labels (results dates) */}
              <div className="flex">
                {phases.map((p, idx) => {
                  const colors = colorMap[p.color as ColorKey];
                  const status = getPhaseStatus(p.startDate, p.resultsDate);
                  return (
                    <div key={p.phase} className={cn('flex-1', idx !== phases.length - 1 && 'pr-2')}>
                      <p className="text-[11px] text-muted-foreground">Results</p>
                      <p className={cn(
                        'text-[11px] font-semibold',
                        status === 'active' ? colors.label : 'text-foreground'
                      )}>
                        {p.results}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail card — shown on node click (desktop only) */}
          <div className="hidden sm:block">
          {activePhase && (() => {
            const p = phases.find(ph => ph.phase === activePhase)!;
            const colors = colorMap[p.color as ColorKey];
            const status = getPhaseStatus(p.startDate, p.resultsDate);
            const daysUntil = getDaysUntil(p.startDate);

            return (
              <div className={cn(
                'mt-2 rounded-2xl border p-5 transition-all',
                colors.card, colors.cardBorder
              )}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={cn('text-base font-bold', colors.label)}>{p.phase}</h3>
                      {status === 'active' && (
                        <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', colors.card, colors.label, `border ${colors.cardBorder}`)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', colors.dot)} />
                          Open now
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Completed
                        </span>
                      )}
                      {status === 'upcoming' && daysUntil > 0 && (
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold border', colors.card, colors.cardBorder, colors.label)}>
                          In {daysUntil} days
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/80 bg-white/70 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Opens</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{p.registrationStart}</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white/70 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Closes</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{p.registrationEnd}</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white/70 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Results</p>
                    <p className={cn('mt-1 text-sm font-semibold', colors.label)}>{p.results}</p>
                  </div>
                </div>
              </div>
            );
          })()}
          </div>

          {/* Source note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Source: MOE P1 Registration Exercise 2026. Verify at{' '}
            <a
              href="https://www.moe.gov.sg/primary/p1-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              moe.gov.sg
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
