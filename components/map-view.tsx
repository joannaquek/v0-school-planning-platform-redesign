'use client';

import { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PressureBadge } from '@/components/pressure-badge';
import type { School } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MapViewProps {
  schools: School[];
  selectedSchoolId?: string | null;
  onSelectSchool?: (id: string) => void;
}

// Simplified map view component with markers
// In production, this would use a proper map library like Mapbox or Google Maps
export function MapView({ schools, selectedSchoolId, onSelectSchool }: MapViewProps) {
  const [zoom, setZoom] = useState(12);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Calculate positions based on coordinates (simplified)
  const getMarkerPosition = (school: School) => {
    // Normalize coordinates to fit in view
    const minLat = 1.27;
    const maxLat = 1.38;
    const minLng = 103.78;
    const maxLng = 103.92;

    const x = ((school.coordinates.lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - school.coordinates.lat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  return (
    <div className="relative h-full w-full min-h-[400px] overflow-hidden rounded-xl bg-secondary/50">
      {/* Map Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDBlMGQwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

      {/* Map Controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg shadow-md bg-card"
          onClick={() => setZoom(Math.min(zoom + 1, 18))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg shadow-md bg-card"
          onClick={() => setZoom(Math.max(zoom - 1, 8))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg shadow-md bg-card"
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Home Marker */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: '50%', top: '50%' }}
      >
        <div className="relative">
          <div className="h-6 w-6 rounded-full bg-primary shadow-lg flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
          </div>
          <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-primary" />
        </div>
      </div>

      {/* School Markers */}
      {schools.map((school) => {
        const pos = getMarkerPosition(school);
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
            className={cn(
              'absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
              (isSelected || isHovered) && 'z-30 scale-125'
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => onSelectSchool?.(school.id)}
            onMouseEnter={() => setHoveredId(school.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className={cn(
                'h-8 w-8 rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-white transition-all',
                pressureColor,
                (isSelected || isHovered) && 'ring-2 ring-white'
              )}
            >
              <MapPin className="h-4 w-4" />
            </div>
          </button>
        );
      })}

      {/* Selected School Info Card */}
      {selectedSchool && (
        <div className="absolute bottom-4 left-4 right-4 z-30 md:left-4 md:right-auto md:w-80">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/schools/${selectedSchool.id}`}>
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                      {selectedSchool.name}
                    </h3>
                  </Link>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{selectedSchool.distance ? `${selectedSchool.distance}km away` : 'Distance unknown'}</span>
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
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:block">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
