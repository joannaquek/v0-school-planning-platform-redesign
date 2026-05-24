'use client';

import Image from 'next/image';
import { ArrowRight, X, Scale, ChevronUp, ChevronDown, MapPin, Trash2, GraduationCap, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PressureBadge } from '@/components/pressure-badge';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

export function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare, showCompareDrawer, setShowCompareDrawer } = useAppStore();
  const [expanded, setExpanded] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-16 md:bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out',
        showCompareDrawer ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      {/* Toggle Header */}
      <div className="border-t border-border bg-card shadow-lg">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                Comparing {compareList.length} school{compareList.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                {4 - compareList.length} more can be added
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive md:px-3"
              onClick={(e) => {
                e.stopPropagation();
                clearCompare();
              }}
            >
              <Trash2 className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">Clear</span>
            </Button>
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            expanded ? 'max-h-[75vh] overflow-y-auto md:max-h-[500px]' : 'max-h-0'
          )}
        >
          <div className="border-t border-border p-4">
            {/* Mobile compare actions */}
            <div className="space-y-3 md:hidden">
              {compareList.length >= 2 ? (
                <Button asChild className="w-full justify-between">
                  <Link href="/compare">
                    View comparison
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Add one more school to unlock the comparison view.
                </p>
              )}

              <div className="space-y-2">
                {compareList.map(({ school }) => (
                  <Card key={school.id} className="relative">
                    <CardContent className="flex items-center gap-3 p-3 pr-10">
                      <div className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
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
                      <div className="min-w-0 flex-1">
                        <Link href={`/schools/${school.id}`}>
                          <h4 className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary">
                            {school.name}
                          </h4>
                        </Link>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {school.distance != null ? `${school.distance.toFixed(2)}km` : '—'}
                          </span>
                          <PressureBadge pressure={school.pressure} size="sm" />
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCompare(school.id)}
                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                        aria-label={`Remove ${school.name} from comparison`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {compareList.length < 4 && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/schools">
                    <Plus className="h-4 w-4" />
                    Add another school
                  </Link>
                </Button>
              )}
            </div>

            {/* Desktop school cards grid */}
            <div className="hidden grid-cols-2 gap-3 md:grid md:grid-cols-4">
              {compareList.map(({ school }) => (
                <Card key={school.id} className="relative">
                  <button
                    onClick={() => removeFromCompare(school.id)}
                    className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <CardContent className="p-3">
                    <div className="mb-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-md bg-secondary">
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
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {school.name}
                      </h4>
                    </Link>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{school.distance != null ? `${school.distance.toFixed(2)}km` : '—'}</span>
                    </div>
                    <div className="mt-2">
                      <PressureBadge pressure={school.pressure} size="sm" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                <Card key={`empty-${i}`} className="border-dashed">
                  <CardContent className="flex items-center justify-center p-6 text-center">
                    <p className="text-xs text-muted-foreground">Add school to compare</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table Preview */}
            {compareList.length >= 2 && (
              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">School</th>
                      {compareList.map(({ school }) => (
                        <th key={school.id} className="pb-2 px-2 text-center font-medium text-foreground">
                          {school.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Vacancies</td>
                      {compareList.map(({ school }) => (
                        <td key={school.id} className="py-2 px-2 text-center font-medium">
                          {school.totalVacancies}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Registered</td>
                      {compareList.map(({ school }) => (
                        <td key={school.id} className="py-2 px-2 text-center font-medium">
                          {school.registeredStudents}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Ballot Chance</td>
                      {compareList.map(({ school }) => (
                        <td key={school.id} className="py-2 px-2 text-center font-medium">
                          {school.ballotChance ? `${school.ballotChance}%` : '—'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Distance</td>
                      {compareList.map(({ school }) => (
                        <td key={school.id} className="py-2 px-2 text-center font-medium">
                          {school.distance != null ? `${school.distance.toFixed(2)}km` : '—'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* View Full Comparison Button */}
            {compareList.length >= 2 && (
              <div className="mt-4 hidden md:block">
                <Button asChild className="w-full">
                  <Link href="/compare">View Full Comparison</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
