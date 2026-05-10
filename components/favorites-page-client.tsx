'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Heart, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { SchoolCard } from '@/components/school-card';
import { CompareDrawer } from '@/components/compare-drawer';
import { useAppStore } from '@/lib/store';
import { detailsToSchools } from '@/lib/map-detail-to-school';
import type { SchoolDetailData } from '@/lib/bundled-types';

export function FavoritesPageClient({ details }: { details: SchoolDetailData[] }) {
  const { favorites, toggleFavorite, filters } = useAppStore();

  const schoolsById = useMemo(() => {
    const list = detailsToSchools(details, Number(filters.year), filters.phase);
    return new Map(list.map((s) => [s.id, s]));
  }, [details, filters.year, filters.phase]);

  const favoriteSchools = favorites
    .map((id) => schoolsById.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Saved Schools</h1>
            <p className="mt-1 text-muted-foreground">
              {favoriteSchools.length} school{favoriteSchools.length !== 1 ? 's' : ''} saved · Phase{' '}
              {filters.phase}, {filters.year}
            </p>
          </div>
          {favoriteSchools.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => favorites.forEach((id) => toggleFavorite(id))}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>

        {favoriteSchools.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteSchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        ) : (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No saved schools yet</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Start exploring schools and save your favorites to easily compare them later.
              </p>
              <Button asChild className="mt-6">
                <Link href="/schools">
                  <Search className="mr-2 h-4 w-4" />
                  Browse schools
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <CompareDrawer />
      <MobileNav />
    </div>
  );
}
