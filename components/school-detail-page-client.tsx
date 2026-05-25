'use client';

import { Fragment, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  MapPin,
  Heart,
  Scale,
  Share2,
  ExternalLink,
  Globe,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  GraduationCap,
  Building,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { PressureBadge } from '@/components/pressure-badge';
import { TrendChart, BallotChart } from '@/components/trend-chart';
import { CompareDrawer } from '@/components/compare-drawer';
import { useAppStore } from '@/lib/store';
import { resolveRegistrationYear } from '@/lib/filter-options';
import { detailToSchool } from '@/lib/map-detail-to-school';
import type { SchoolDetailData } from '@/lib/bundled-types';
import { cn } from '@/lib/utils';

function normalizePhase(phase: string): '2A' | '2B' | '2C' {
  if (phase === '2A' || phase === '2B' || phase === '2C') return phase;
  return '2C';
}

export function SchoolDetailPageClient({ detail }: { detail: SchoolDetailData }) {
  const { filters, toggleFavorite, isFavorite, addToCompare, isInCompare, removeFromCompare, userLat, userLng } =
    useAppStore();

  const home =
    userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null;

  const registrationYear = resolveRegistrationYear(filters.year);

  const school = useMemo(
    () => detailToSchool(detail, Number(registrationYear), filters.phase, home),
    [detail, registrationYear, filters.phase, home]
  );

  const phaseKey = normalizePhase(filters.phase);
  const selectionRecord = useMemo(
    () =>
      school.historicalData.find(
        (d) => d.year === Number(registrationYear) && d.phase === phaseKey
      ),
    [school.historicalData, registrationYear, phaseKey]
  );

  const pivotRows = useMemo(() => {
    const byYear = new Map<number, Map<string, (typeof school.historicalData)[number]>>();
    for (const row of school.historicalData) {
      if (!byYear.has(row.year)) byYear.set(row.year, new Map());
      byYear.get(row.year)!.set(row.phase, row);
    }

    return Array.from(byYear.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, phaseMap]) => ({
        year,
        p2a: phaseMap.get('2A'),
        p2b: phaseMap.get('2B'),
        p2c: phaseMap.get('2C'),
      }));
  }, [school.historicalData]);

  const favorite = isFavorite(school.id);
  const inCompare = isInCompare(school.id);

  const IntakeIcon =
    school.intakeChange === 'increase'
      ? TrendingUp
      : school.intakeChange === 'decrease'
        ? TrendingDown
        : Minus;

  const intakeChangeColor =
    school.intakeChange === 'increase'
      ? 'text-success'
      : school.intakeChange === 'decrease'
        ? 'text-destructive'
        : 'text-muted-foreground';

  const distanceBandLabel =
    school.distanceBand === 'unknown'
      ? 'Not available (distance uses a home address in the full tool)'
      : school.distanceBand === '1km'
        ? 'Within 1km (Priority)'
        : school.distanceBand === '1-2km'
          ? '1-2km'
          : 'Over 2km';

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href="/schools"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to schools
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{school.name}</h1>
                <PressureBadge pressure={school.pressure} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {school.address}, Singapore {school.postalCode}
                </span>
              </div>
              {(school.websiteUrl || school.phone || school.email) && (
                <div className="mt-2 flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                  {(
                    [
                      school.websiteUrl
                        ? {
                            id: 'web',
                            node: (
                              <span className="inline-flex min-w-0 items-center gap-1.5">
                                <Globe className="h-4 w-4 shrink-0" aria-hidden />
                                <a
                                  href={school.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-w-0 break-all text-primary underline-offset-4 hover:underline"
                                >
                                  <span className="sr-only">School website: </span>
                                  {(() => {
                                    try {
                                      return new URL(school.websiteUrl).host;
                                    } catch {
                                      return school.websiteUrl;
                                    }
                                  })()}
                                </a>
                              </span>
                            ),
                          }
                        : null,
                      school.phone
                        ? {
                            id: 'phone',
                            node: (
                              <span className="inline-flex items-center gap-1.5">
                                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                                <a
                                  href={`tel:${school.phone.replace(/[^\d+]/g, '')}`}
                                  className="text-primary underline-offset-4 hover:underline"
                                >
                                  <span className="sr-only">Phone: </span>
                                  {school.phone}
                                </a>
                              </span>
                            ),
                          }
                        : null,
                      school.email
                        ? {
                            id: 'email',
                            node: (
                              <span className="inline-flex min-w-0 items-center gap-1.5">
                                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                                <a
                                  href={`mailto:${school.email}`}
                                  className="min-w-0 break-all text-primary underline-offset-4 hover:underline"
                                >
                                  <span className="sr-only">Email: </span>
                                  {school.email}
                                </a>
                              </span>
                            ),
                          }
                        : null,
                    ]
                  )
                    .filter((p): p is { id: string; node: ReactNode } => p != null)
                    .map((part, i) => (
                      <Fragment key={part.id}>
                        {i > 0 ? (
                          <span className="select-none px-1 text-muted-foreground/50" aria-hidden>
                            |
                          </span>
                        ) : null}
                        {part.node}
                      </Fragment>
                    ))}
                </div>
              )}
              {school.affiliation && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    <Building className="mr-1.5 h-3 w-3" />
                    Affiliated: {school.affiliation}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleFavorite(school.id)}
                className="h-10 w-10"
              >
                <Heart className={cn('h-5 w-5', favorite && 'fill-destructive text-destructive')} />
                <span className="sr-only">
                  {favorite ? 'Remove from favorites' : 'Add to favorites'}
                </span>
              </Button>
              <Button
                variant={inCompare ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => (inCompare ? removeFromCompare(school.id) : addToCompare(school))}
                className="h-10 w-10"
              >
                <Scale className="h-5 w-5" />
                <span className="sr-only">
                  {inCompare ? 'Remove from compare' : 'Add to compare'}
                </span>
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
            {inCompare ? (
              <Link
                href="/compare"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                Add ties &amp; plan registration →
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-xl font-bold text-foreground">
                    {school.distance != null ? `${school.distance.toFixed(1)} km` : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vacancies ({registrationYear})</p>
                  <p className="text-xl font-bold text-foreground">{school.totalVacancies}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="text-xl font-bold text-foreground">{school.registeredStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    school.ballotChance != null && school.ballotChance >= 70
                      ? 'bg-success/10 text-success'
                      : school.ballotChance != null && school.ballotChance >= 40
                        ? 'bg-warning/10 text-warning-foreground'
                        : school.ballotChance != null
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ballot Chance</p>
                  <p className="text-xl font-bold text-foreground">
                    {school.ballotChance != null ? `${school.ballotChance}%` : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registration Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Distance Band</p>
                    <p className="mt-1 text-foreground">{distanceBandLabel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Intake Change</p>
                    <div className="mt-1 flex items-center gap-2">
                      <IntakeIcon className={cn('h-4 w-4', intakeChangeColor)} />
                      <span className={intakeChangeColor}>
                        {school.intakeChange === 'no-change'
                          ? `No change from ${registrationYear}`
                          : `${school.intakeChangeValue && school.intakeChangeValue > 0 ? '+' : ''}${school.intakeChangeValue || 0} vacancies (from ${registrationYear})`}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ballot Required</p>
                    <p className="mt-1 text-foreground">
                      {selectionRecord?.balloted
                        ? 'Yes (oversubscribed)'
                        : selectionRecord
                          ? 'No (places available)'
                          : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Phase</p>
                    <p className="mt-1 text-foreground">
                      Phase {phaseKey}, {registrationYear}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TrendChart data={school.historicalData} />

            <BallotChart data={school.historicalData} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year-by-Year Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">
                          Year
                        </th>
                        <th className="pb-3 px-4 text-center font-medium text-muted-foreground">Phase 2A</th>
                        <th className="pb-3 px-4 text-center font-medium text-muted-foreground">Phase 2B</th>
                        <th className="pb-3 pl-4 text-center font-medium text-muted-foreground">Phase 2C</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pivotRows.map((row) => {
                        const renderPhaseCell = (
                          phaseRow:
                            | {
                                vacancies: number;
                                registered: number;
                                ballotRate?: number;
                              }
                            | undefined
                        ) => {
                          if (!phaseRow) {
                            return <span className="text-muted-foreground">—</span>;
                          }

                          return (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[11px] text-muted-foreground">
                                {phaseRow.vacancies}/{phaseRow.registered}
                              </span>
                              <span className="text-base font-semibold text-foreground">
                                {phaseRow.ballotRate != null ? `${phaseRow.ballotRate}%` : '—'}
                              </span>
                            </div>
                          );
                        };

                        return (
                          <tr key={row.year}>
                            <td className="py-3 pr-4 font-medium text-foreground">{row.year}</td>
                            <td className="py-3 px-4 text-center">{renderPhaseCell(row.p2a)}</td>
                            <td className="py-3 px-4 text-center">{renderPhaseCell(row.p2b)}</td>
                            <td className="py-3 pl-4 text-center">{renderPhaseCell(row.p2c)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Co-Curricular Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {school.ccas.map((cca) => (
                    <Badge key={cca} variant="outline">
                      {cca}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {school.specialPrograms && school.specialPrograms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Special Programmes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {school.specialPrograms.map((program) => (
                      <li key={program} className="flex items-start gap-2 text-sm">
                        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{program}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {school.affiliation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Affiliation Pathway</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Building className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{school.affiliation}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Students may have priority admission to this secondary school.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={favorite ? 'secondary' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => toggleFavorite(school.id)}
                >
                  <Heart className={cn('h-4 w-4', favorite && 'fill-destructive text-destructive')} />
                  {favorite ? 'Remove from favorites' : 'Add to favorites'}
                </Button>
                <Button
                  variant={inCompare ? 'secondary' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    inCompare ? removeFromCompare(school.id) : addToCompare(school)
                  }
                >
                  <Scale className="h-4 w-4" />
                  {inCompare ? 'Remove from compare' : 'Add to compare'}
                </Button>
                <Separator />
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Visit school website
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CompareDrawer />
      <MobileNav />
    </div>
  );
}
