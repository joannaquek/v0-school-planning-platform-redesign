'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { NEARBY_WITHIN_1, NEARBY_WITHIN_2, isNearbyDistanceBand } from '@/lib/nearby-radius';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

type NearbyRadiusToggleProps = {
  className?: string;
  /** Inline label for Option B refine row; stacked label for legacy layouts. */
  layout?: 'stacked' | 'inline';
};

export function NearbyRadiusToggle({ className, layout = 'stacked' }: NearbyRadiusToggleProps) {
  const { filters, setFilters, userLat, userLng } = useAppStore();

  if (userLat == null || userLng == null) return null;

  const activeBand = isNearbyDistanceBand(filters.distanceBand)
    ? filters.distanceBand
    : NEARBY_WITHIN_2;

  useEffect(() => {
    if (userLat != null && userLng != null && filters.distanceBand === 'all') {
      setFilters({ distanceBand: NEARBY_WITHIN_2 });
    }
  }, [userLat, userLng, filters.distanceBand, setFilters]);

  const handleChange = (value: string) => {
    if (value === NEARBY_WITHIN_1 || value === NEARBY_WITHIN_2) {
      setFilters({ distanceBand: value });
    }
  };

  const toggle = (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={activeBand}
      onValueChange={handleChange}
      className="w-full min-w-0"
      aria-label="Distance radius from home"
    >
      <ToggleGroupItem value={NEARBY_WITHIN_1} className="flex-1 px-2 text-xs sm:text-sm">
        0–1km
      </ToggleGroupItem>
      <ToggleGroupItem value={NEARBY_WITHIN_2} className="flex-1 px-2 text-xs sm:text-sm">
        0–2km
      </ToggleGroupItem>
    </ToggleGroup>
  );

  if (layout === 'inline') {
    return (
      <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
        <span className="text-xs font-medium text-muted-foreground">Distance</span>
        {toggle}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-muted-foreground">Distance from home</span>
      {toggle}
    </div>
  );
}
