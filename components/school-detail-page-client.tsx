'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  MapPin,
  Heart,
  Scale,
  Share2,
  ExternalLink,
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
import { detailToSchool } from '@/lib/map-detail-to-school';
import type { SchoolDetailData } from '@/lib/bundled-types';
import { cn } from '@/lib/utils';

function normalizePhase(phase: string): '2A' | '2B' | '2C' {
  if (phase === '2A' || phase === '2B' || phase === '2C') return phase;
  return '2C';
}

export function SchoolDetailPageClient({ detail }: { detail: SchoolDetailData }) {
  const { filters, toggleFavorite, isFavorite, addToCompare, isInCompare, removeFromCompare } =
    useAppStore();

  const school = useMemo(
    () => detailToSchool(detail, Number(filters.year), filters.phase),
    [detail, filters.year, filters.phase]
  );

  const phaseKey = normalizePhase(filters.phase);
  const selectionRecord = useMemo(
    () =>
      school.historicalData.find(
        (d) => d.year === Number(filters.year) && d.phase === phaseKey
      ),
    [school.historicalData, filters.year, phaseKey]
  );

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
                  <p className="text-sm text-muted-foreground">Vacancies</p>
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
                          ? 'No change from last year'
                          : `${school.intakeChangeValue && school.intakeChangeValue > 0 ? '+' : ''}${school.intakeChangeValue || 0} vacancies`}
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
                      Phase {phaseKey}, {filters.year}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TrendChart
              data={school.historicalData}
              schoolName={school.name}
              phase={phaseKey}
            />

            <BallotChart data={school.historicalData} phase={phaseKey} />

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
                        <th className="pb-3 px-4 text-center font-medium text-muted-foreground">
                          Phase
                        </th>
                        <th className="pb-3 px-4 text-center font-medium text-muted-foreground">
                          Vacancies
                        </th>
                        <th className="pb-3 px-4 text-center font-medium text-muted-foreground">
                          Registered
                        </th>
                        <th className="pb-3 px-4 text-center font-medium text-muted-foreground">
                          Balloted
                        </th>
                        <th className="pb-3 pl-4 text-center font-medium text-muted-foreground">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {school.historicalData.map((row) => (
                        <tr key={`${row.year}-${row.phase}`}>
                          <td className="py-3 pr-4 font-medium text-foreground">{row.year}</td>
                          <td className="py-3 px-4 text-center">{row.phase}</td>
                          <td className="py-3 px-4 text-center">{row.vacancies}</td>
                          <td className="py-3 px-4 text-center">{row.registered}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={row.balloted ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {row.balloted ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="py-3 pl-4 text-center font-medium">
                            {row.ballotRate != null ? `${row.ballotRate}%` : '—'}
                          </td>
                        </tr>
                      ))}
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
