'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PressureBadge } from '@/components/pressure-badge';
import type { School } from '@/lib/types';
import type { GeoPoint, GeoBounds } from '@/lib/geo';
import { boundsAroundPoint, pointToPercent } from '@/lib/geo';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MapViewProps {
  schools: School[];
  home?: GeoPoint | null;
  /** Registration distance circle when home is set (km). */
  radiusKm?: 1 | 2;
  selectedSchoolId?: string | null;
  onSelectSchool?: (id: string) => void;
}

/** Viewport extends beyond the 2km circle (1 = circle fills entire map). */
const DEFAULT_VIEW_PADDING = 1.35;

const SINGAPORE_BOUNDS: GeoBounds = {
  minLat: 1.27,
  maxLat: 1.38,
  minLng: 103.78,
  maxLng: 103.92,
};

const GRID_BG =
  "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDBlMGQwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]";

export function MapView({
  schools,
  home,
  radiusKm = 2,
  selectedSchoolId,
  onSelectSchool,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoomOffset, setZoomOffset] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [circleDiameterPx, setCircleDiameterPx] = useState(0);

  const viewPadding = Math.max(1.1, DEFAULT_VIEW_PADDING - zoomOffset * 0.12);

  const mapBounds = useMemo(() => {
    if (!home) return SINGAPORE_BOUNDS;
    return boundsAroundPoint(home, radiusKm * viewPadding);
  }, [home, radiusKm, viewPadding]);

  const homePosition = useMemo(
    () => (home ? pointToPercent(home, mapBounds) : { x: 50, y: 50 }),
    [home, mapBounds]
  );

  /** Diameter of the radius circle as a fraction of the map’s shorter side. */
  const circleDiameterRatio = 1 / viewPadding;

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el || !home) {
      setCircleDiameterPx(0);
      return;
    }

    const updateCircleSize = () => {
      const minSide = Math.min(el.clientWidth, el.clientHeight);
      setCircleDiameterPx(minSide * circleDiameterRatio);
    };

    updateCircleSize();
    const observer = new ResizeObserver(updateCircleSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [home, circleDiameterRatio]);

  const handleRecenter = useCallback(() => {
    setZoomOffset(0);
  }, []);

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  return (
    <div
      ref={mapContainerRef}
      className="relative h-full w-full min-h-[400px] overflow-hidden rounded-xl bg-secondary/50"
    >
      <div className={cn('absolute inset-0 opacity-50', GRID_BG)} />

      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg bg-card shadow-md"
          onClick={() => setZoomOffset((z) => Math.min(z + 1, 4))}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg bg-card shadow-md"
          onClick={() => setZoomOffset((z) => Math.max(z - 1, 0))}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg bg-card shadow-md"
          onClick={handleRecenter}
          disabled={!home}
          aria-label="Center on your home location"
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {home && circleDiameterPx > 0 ? (
        <>
          <div
            className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/50 bg-primary/20 shadow-inner"
            style={{
              left: `${homePosition.x}%`,
              top: `${homePosition.y}%`,
              width: circleDiameterPx,
              height: circleDiameterPx,
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute z-[6] -translate-x-1/2 whitespace-nowrap rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium text-primary shadow-sm"
            style={{
              left: `${homePosition.x}%`,
              top: `calc(${homePosition.y}% + ${circleDiameterPx / 2}px + 4px)`,
            }}
          >
            {radiusKm}km radius
          </div>
        </>
      ) : null}

      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${homePosition.x}%`, top: `${homePosition.y}%` }}
      >
        <div className="relative">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg ring-2 ring-card">
            <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
          </div>
          <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-primary" />
        </div>
        {home ? (
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-card/95 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
            Your home
          </span>
        ) : null}
      </div>

      {schools.map((school) => {
        const pos = pointToPercent(school.coordinates, mapBounds);
        const isSelected = school.id === selectedSchoolId;
        const isHovered = school.id === hoveredId;

        const pressureColor = {
          low: 'bg-success',
          moderate: 'bg-warning',
          high: 'bg-destructive',
        }[school.pressure];

        return (
          <button
            key={school.id}
            type="button"
            className={cn(
              'absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
              (isSelected || isHovered) && 'z-30 scale-125'
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => onSelectSchool?.(school.id)}
            onMouseEnter={() => setHoveredId(school.id)}
            onMouseLeave={() => setHoveredId(null)}
            aria-label={school.name}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg transition-all',
                pressureColor,
                (isSelected || isHovered) && 'ring-2 ring-white'
              )}
            >
              <MapPin className="h-4 w-4" />
            </div>
          </button>
        );
      })}

      {selectedSchool ? (
        <div className="absolute bottom-4 left-4 right-4 z-30 md:left-4 md:right-auto md:w-80">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/schools/${selectedSchool.id}`}>
                    <h3 className="line-clamp-2 font-semibold text-foreground transition-colors hover:text-primary">
                      {selectedSchool.name}
                    </h3>
                  </Link>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {selectedSchool.distance != null
                        ? `${selectedSchool.distance.toFixed(2)}km away`
                        : 'Distance unknown'}
                    </span>
                  </div>
                </div>
                <PressureBadge pressure={selectedSchool.pressure} size="sm" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 py-2">
                  <p className="text-xs text-muted-foreground">Vacancies</p>
                  <p className="text-lg font-semibold">{selectedSchool.totalVacancies}</p>
                </div>
                <div className="rounded-lg bg-muted/50 py-2">
                  <p className="text-xs text-muted-foreground">Ballot Chance</p>
                  <p className="text-lg font-semibold">
                    {selectedSchool.ballotChance ? `${selectedSchool.ballotChance}%` : '—'}
                  </p>
                </div>
              </div>
              <Button asChild className="mt-3 w-full" size="sm">
                <Link href={`/schools/${selectedSchool.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div
        className={cn(
          'absolute z-20',
          home ? 'bottom-4 left-4 max-w-[11rem]' : 'bottom-4 right-4 hidden md:block'
        )}
      >
        <Card className="shadow-md">
          <CardContent className="p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Pressure Level</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-full bg-success" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-full bg-destructive" />
                <span>High</span>
              </div>
              {home ? (
                <div className="flex items-center gap-2 border-t border-border pt-1.5 text-xs">
                  <span className="h-3 w-3 rounded-full border-2 border-primary/50 bg-primary/25" />
                  <span>Within {radiusKm}km</span>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
