'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Plus, X, Scale, MapPin, GraduationCap, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { PressureBadge } from '@/components/pressure-badge';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const comparisonMetrics = [
  { key: 'distance', label: 'Distance' },
  { key: 'distanceBand', label: 'Distance Band' },
  { key: 'pressure', label: 'Ballot Pressure' },
  { key: 'totalVacancies', label: 'Total Vacancies' },
  { key: 'registeredStudents', label: 'Registered Students' },
  { key: 'ballotChance', label: 'Ballot Chance' },
  { key: 'intakeChange', label: 'Intake Change' },
  { key: 'affiliation', label: 'Affiliation' },
  { key: 'ccaCount', label: 'CCAs Available' },
];

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useAppStore();

  const getMetricValue = (schoolIndex: number, metricKey: string) => {
    const school = compareList[schoolIndex]?.school;
    if (!school) return null;

    switch (metricKey) {
      case 'distance':
        return school.distance != null ? `${school.distance.toFixed(2)}km` : 'Set location';
      case 'distanceBand':
        return school.distanceBand === '1km' ? 'Within 1km' : 
               school.distanceBand === '1-2km' ? '1-2km' :
               school.distanceBand === '2km+' ? 'Over 2km' : 'Set location';
      case 'pressure':
        return school.pressure;
      case 'totalVacancies':
        return school.totalVacancies;
      case 'registeredStudents':
        return school.registeredStudents;
      case 'ballotChance':
        return school.ballotChance != null ? `${school.ballotChance}%` : 'Not available';
      case 'intakeChange':
        return school.intakeChange === 'no-change' 
          ? 'No change' 
          : `${school.intakeChangeValue && school.intakeChangeValue > 0 ? '+' : ''}${school.intakeChangeValue || 0}`;
      case 'affiliation':
        return school.affiliation || 'None';
      case 'ccaCount':
        return school.ccas.length;
      default:
        return '—';
    }
  };

  const getBestValue = (metricKey: string) => {
    const values = compareList.map((item, index) => ({
      index,
      value: getMetricValue(index, metricKey),
      rawValue: item.school,
    }));

    switch (metricKey) {
      case 'distance':
        const minDistance = Math.min(...values.map(v => v.rawValue.distance || 999));
        return values.filter(v => v.rawValue.distance === minDistance).map(v => v.index);
      case 'distanceBand':
        const hasPriority = values.filter(v => v.rawValue.distanceBand === '1km').map(v => v.index);
        return hasPriority.length > 0 ? hasPriority : [];
      case 'pressure':
        const lowPressure = values.filter(v => v.rawValue.pressure === 'low').map(v => v.index);
        return lowPressure.length > 0 ? lowPressure : 
               values.filter(v => v.rawValue.pressure === 'moderate').map(v => v.index);
      case 'totalVacancies':
        const maxVacancies = Math.max(...values.map(v => v.rawValue.totalVacancies));
        return values.filter(v => v.rawValue.totalVacancies === maxVacancies).map(v => v.index);
      case 'ballotChance':
        const maxChance = Math.max(...values.map(v => v.rawValue.ballotChance || 0));
        return values.filter(v => v.rawValue.ballotChance === maxChance).map(v => v.index);
      case 'ccaCount':
        const maxCcas = Math.max(...values.map(v => v.rawValue.ccas.length));
        return values.filter(v => v.rawValue.ccas.length === maxCcas).map(v => v.index);
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/schools" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to schools
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compare Schools</h1>
            <p className="mt-1 text-muted-foreground">
              {compareList.length} school{compareList.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          {compareList.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCompare}>
              Clear all
            </Button>
          )}
        </div>

        {compareList.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Scale className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No schools to compare</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Add schools to your comparison list to see them side by side.
              </p>
              <Button asChild className="mt-6">
                <Link href="/schools">Browse schools</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
          <section className="space-y-4 md:hidden">
            <div className="-mx-4 border-y border-border bg-background/95 px-4 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {compareList.map(({ school }) => (
                  <Card key={school.id} className="min-w-[9.5rem] max-w-[9.5rem] shrink-0">
                    <CardContent className="relative p-3">
                      <button
                        onClick={() => removeFromCompare(school.id)}
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                        aria-label={`Remove ${school.name} from comparison`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="mb-2 flex h-10 w-full items-center justify-center overflow-hidden rounded-md bg-secondary">
                        {school.imageUrl ? (
                          <Image
                            src={school.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="max-h-full w-auto max-w-full object-contain p-1"
                          />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-secondary-foreground/40" />
                        )}
                      </div>
                      <Link href={`/schools/${school.id}`}>
                        <h3 className="line-clamp-2 pr-4 text-xs font-semibold text-foreground hover:text-primary">
                          {school.name}
                        </h3>
                      </Link>
                    </CardContent>
                  </Card>
                ))}

                {compareList.length < 4 && (
                  <Button asChild variant="outline" className="h-auto min-w-[8rem] shrink-0 flex-col py-4">
                    <Link href="/schools">
                      <Plus className="h-4 w-4" />
                      Add school
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {compareList.length < 2 && (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Add one more school to compare metrics side by side.
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {comparisonMetrics.map((metric) => {
                const bestIndices = getBestValue(metric.key);

                return (
                  <Card key={metric.key}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{metric.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-4 pt-0">
                      {compareList.map(({ school }, index) => {
                        const value = getMetricValue(index, metric.key);
                        const isBest = bestIndices.includes(index);

                        return (
                          <div
                            key={school.id}
                            className={cn(
                              'flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2',
                              isBest && compareList.length > 1 ? 'border-success/30 bg-success/10' : 'bg-card'
                            )}
                          >
                            <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{school.name}</span>
                            {metric.key === 'pressure' ? (
                              <PressureBadge pressure={value as 'low' | 'moderate' | 'high'} size="sm" />
                            ) : (
                              <span
                                className={cn(
                                  'flex shrink-0 items-center gap-1.5 pt-0.5 text-sm font-semibold',
                                  isBest && compareList.length > 1 ? 'text-success' : 'text-foreground'
                                )}
                              >
                                {isBest && compareList.length > 1 && <Check className="h-4 w-4" />}
                                {value}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Co-Curricular Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                {compareList.map(({ school }) => (
                  <div key={school.id}>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">{school.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {school.ccas.length > 0 ? (
                        school.ccas.map((cca) => (
                          <Badge key={cca} variant="outline" className="text-xs">
                            {cca}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None listed</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Special Programmes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                {compareList.map(({ school }) => (
                  <div key={school.id}>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">{school.name}</h3>
                    {school.specialPrograms && school.specialPrograms.length > 0 ? (
                      <ul className="space-y-1">
                        {school.specialPrograms.map((program) => (
                          <li key={program} className="flex items-start gap-1.5 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            <span>{program}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-muted-foreground">None listed</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[600px]">
              {/* School Headers */}
              <div className="grid grid-cols-[200px_repeat(4,1fr)] gap-4 mb-4">
                <div /> {/* Empty corner */}
                {compareList.map(({ school }) => (
                  <Card key={school.id} className="relative overflow-hidden">
                    <button
                      onClick={() => removeFromCompare(school.id)}
                      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <CardContent className="p-4">
                      <div className="h-16 w-full flex items-center justify-center rounded-lg bg-secondary mb-3 overflow-hidden">
                        {school.imageUrl ? (
                          <Image
                            src={school.imageUrl}
                            alt=""
                            width={72}
                            height={72}
                            className="max-h-full w-auto max-w-full object-contain p-2"
                          />
                        ) : (
                          <GraduationCap className="h-8 w-8 text-secondary-foreground/40" />
                        )}
                      </div>
                      <Link href={`/schools/${school.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm">
                          {school.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{school.address}</span>
                      </div>
                      <div className="mt-2">
                        <PressureBadge pressure={school.pressure} size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {/* Add more school slots */}
                {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                  <Card key={`empty-${i}`} className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-4 h-full min-h-[180px]">
                      <Button variant="ghost" size="sm" asChild className="gap-1.5">
                        <Link href="/schools">
                          <Plus className="h-4 w-4" />
                          Add school
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {comparisonMetrics.map((metric) => {
                      const bestIndices = getBestValue(metric.key);
                      
                      return (
                        <div 
                          key={metric.key} 
                          className="grid grid-cols-[200px_repeat(4,1fr)] gap-4 p-4 items-center"
                        >
                          <div className="font-medium text-muted-foreground text-sm">
                            {metric.label}
                          </div>
                          {compareList.map((_, index) => {
                            const value = getMetricValue(index, metric.key);
                            const isBest = bestIndices.includes(index);
                            
                            return (
                              <div 
                                key={index}
                                className={cn(
                                  'text-center py-2 px-3 rounded-lg text-sm font-medium',
                                  isBest && compareList.length > 1 ? 'bg-success/10 text-success' : 'text-foreground'
                                )}
                              >
                                {metric.key === 'pressure' ? (
                                  <div className="flex justify-center">
                                    <PressureBadge pressure={value as 'low' | 'moderate' | 'high'} size="sm" />
                                  </div>
                                ) : (
                                  <span className="flex items-center justify-center gap-1.5">
                                    {isBest && compareList.length > 1 && <Check className="h-4 w-4" />}
                                    {value}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {/* Empty slots */}
                          {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="text-center py-2 px-3 text-muted-foreground">
                              —
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* CCAs Comparison */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Co-Curricular Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-[200px_repeat(4,1fr)] gap-4">
                    <div className="font-medium text-muted-foreground text-sm">CCAs</div>
                    {compareList.map(({ school }) => (
                      <div key={school.id} className="flex flex-wrap gap-1">
                        {school.ccas.map((cca) => (
                          <Badge key={cca} variant="outline" className="text-xs">
                            {cca}
                          </Badge>
                        ))}
                      </div>
                    ))}
                    {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="text-muted-foreground text-sm">—</div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Special Programs Comparison */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Special Programmes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-[200px_repeat(4,1fr)] gap-4">
                    <div className="font-medium text-muted-foreground text-sm">Programmes</div>
                    {compareList.map(({ school }) => (
                      <div key={school.id}>
                        {school.specialPrograms && school.specialPrograms.length > 0 ? (
                          <ul className="space-y-1">
                            {school.specialPrograms.map((program) => (
                              <li key={program} className="flex items-start gap-1.5 text-sm">
                                <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
                                <span>{program}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground text-sm">None listed</span>
                        )}
                      </div>
                    ))}
                    {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="text-muted-foreground text-sm">—</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
