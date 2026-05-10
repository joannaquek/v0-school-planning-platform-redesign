'use client';

import Link from 'next/link';
import { GraduationCap, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export function Header() {
  const { favorites } = useAppStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-lg font-semibold tracking-tight text-foreground sm:inline-block">
            SchoolMatch
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/schools">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Browse Schools
            </Button>
          </Link>
          <Link href="/schools?view=map">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Map View
            </Button>
          </Link>
          <Link href="/guide">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              P1 Guide
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/schools" className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4.5 w-4.5" />
              <span className="sr-only">Search schools</span>
            </Button>
          </Link>
          <Link href="/favorites">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Heart className="h-4.5 w-4.5" />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {favorites.length}
                </span>
              )}
              <span className="sr-only">Favorites</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
