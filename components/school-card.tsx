'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, TrendingUp, TrendingDown, Minus, Plus, Scale, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PressureBadge } from '@/components/pressure-badge';
import { useAppStore } from '@/lib/store';
import type { School } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SchoolCardProps {
  school: School;
  variant?: 'default' | 'compact';
  vacancyYearLabel?: string;
}

export function SchoolCard({ school, variant = 'default', vacancyYearLabel }: SchoolCardProps) {
  const { toggleFavorite, isFavorite, addToCompare, isInCompare, removeFromCompare } = useAppStore();
  const favorite = isFavorite(school.id);
  const inCompare = isInCompare(school.id);
  const displayYear =
    vacancyYearLabel ?? String(Math.max(...school.historicalData.map((row) => row.year)));

  const IntakeIcon = school.intakeChange === 'increase' 
    ? TrendingUp 
    : school.intakeChange === 'decrease' 
      ? TrendingDown 
      : Minus;

  const intakeChangeColor = school.intakeChange === 'increase'
    ? 'text-success'
    : school.intakeChange === 'decrease'
      ? 'text-destructive'
      : 'text-muted-foreground';

  const distanceKmLabel =
    school.distance != null ? `${school.distance.toFixed(1)}km` : null;

  if (variant === 'compact') {
    return (
      <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/schools/${school.id}`} className="block">
                <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {school.name}
                </h3>
              </Link>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {distanceKmLabel ? `${distanceKmLabel} away` : 'Distance unknown'}
                </span>
              </div>
            </div>
            <PressureBadge pressure={school.pressure} size="sm" showLabel={false} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
      <CardContent className="p-0">
        {/* School Image/Placeholder */}
        <div className="relative h-32 overflow-hidden bg-muted">
          {school.imageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary p-4">
              <Image
                src={school.imageUrl}
                alt=""
                width={120}
                height={120}
                className="max-h-full w-auto max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <GraduationCap className="h-12 w-12 text-secondary-foreground/40" />
            </div>
          )}
          <div className="absolute right-2 top-2 flex gap-1.5">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-card/90 shadow-sm hover:bg-card"
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(school.id);
              }}
            >
              <Heart className={cn('h-4 w-4', favorite ? 'fill-destructive text-destructive' : '')} />
              <span className="sr-only">{favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
            </Button>
          </div>
          <div className="absolute bottom-2 left-2">
            <PressureBadge pressure={school.pressure} size="sm" />
          </div>
        </div>

        {/* School Info */}
        <div className="p-4">
          <Link href={`/schools/${school.id}`}>
            <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {school.name}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {distanceKmLabel ?? '—'} · {school.distanceBand === '1km' ? 'Within 1km' : school.distanceBand === '1-2km' ? '1-2km' : 'Over 2km'}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Vacancies ({displayYear})
              </p>
              <p className="text-lg font-semibold text-foreground">{school.totalVacancies}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Subscription rate</p>
              <p className="text-lg font-semibold text-foreground">
                {school.subscriptionRate != null ? `${school.subscriptionRate}%` : '—'}
              </p>
            </div>
          </div>

          {/* Intake Change */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <IntakeIcon className={cn('h-4 w-4', intakeChangeColor)} />
            <span className={intakeChangeColor}>
              {school.intakeChange === 'no-change' 
                ? 'No intake change' 
                : `${school.intakeChangeValue && school.intakeChangeValue > 0 ? '+' : ''}${school.intakeChangeValue || 0} vacancies (from ${displayYear})`}
            </span>
          </div>

          {/* Affiliation */}
          {school.affiliation && (
            <div className="mt-3">
              <Badge variant="secondary" className="text-xs font-normal">
                Affiliated: {school.affiliation}
              </Badge>
            </div>
          )}

          {/* CCAs Preview */}
          {school.ccas.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {school.ccas.slice(0, 3).map((cca) => (
                <Badge key={cca} variant="outline" className="text-xs font-normal">
                  {cca}
                </Badge>
              ))}
              {school.ccas.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                  +{school.ccas.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button asChild variant="default" className="flex-1" size="sm">
              <Link href={`/schools/${school.id}`}>View Details</Link>
            </Button>
            <Button
              variant={inCompare ? 'secondary' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => inCompare ? removeFromCompare(school.id) : addToCompare(school)}
            >
              {inCompare ? <Minus className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{inCompare ? 'Remove' : 'Compare'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
