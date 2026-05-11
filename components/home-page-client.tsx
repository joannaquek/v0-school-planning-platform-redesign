'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  Map,
  Scale,
  TrendingUp,
  Shield,
  ChevronRight,
  Star,
  Users,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { SearchInput } from '@/components/search-input';
import { RegistrationTimeline } from '@/components/registration-timeline';
import { PressureBadge } from '@/components/pressure-badge';
import { useAppStore } from '@/lib/store';
import type { School } from '@/lib/types';

const features = [
  {
    icon: Search,
    title: 'Smart Discovery',
    description:
      'Find schools near you with intelligent filtering by distance, pressure, and CCAs.',
  },
  {
    icon: TrendingUp,
    title: 'Historical Data',
    description:
      'View multi-year registration trends to understand ballot patterns and vacancy changes.',
  },
  {
    icon: Scale,
    title: 'Easy Comparison',
    description: 'Compare up to 4 schools side-by-side on key metrics that matter.',
  },
  {
    icon: Map,
    title: 'Visual Map',
    description: 'See all schools on an interactive map with distance bands clearly marked.',
  },
];

export function HomePageClient({
  featuredSchools,
  schoolCount,
  latestYear,
  yearRangeLabel,
}: {
  featuredSchools: School[];
  schoolCount: number;
  latestYear: string;
  yearRangeLabel: string;
}) {
  const router = useRouter();
  const { setUserAddress, setGeocodedHome, userAddress } = useAppStore();
  const [address, setAddress] = useState(userAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    setAddress(userAddress);
  }, [userAddress]);

  const onAddressChange = (value: string) => {
    setAddress(value);
    setUserAddress(value);
    setGeoError('');
  };

  const stats = [
    { value: String(schoolCount), label: 'Schools Tracked' },
    { value: yearRangeLabel, label: 'Historical Data' },
    { value: latestYear, label: 'Latest Year' },
    { value: 'Periodic', label: 'MOE data refresh' },
  ];

  const handleSearch = async () => {
    const q = address.trim();
    if (!q) return;
    setIsSearching(true);
    setGeoError('');
    try {
      const res = await fetch(`/api/onemap/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as
        | { lat: number; lng: number; address: string; postalCode?: string }
        | { error: string };

      if (!res.ok || !('lat' in data)) {
        setGeoError(
          'error' in data
            ? data.error
            : 'Could not find that address or postal code. Try a full address or 6-digit postal code.'
        );
        return;
      }

      const display = data.address?.trim() || q;
      setGeocodedHome(display, data.lat, data.lng);
      setAddress(display);
      router.push('/schools');
    } catch {
      setGeoError('Network error while looking up your address.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseMyLocation = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Location is not available in this browser.');
      return;
    }
    setIsLocating(true);
    setGeoError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        });
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      let label = '';
      try {
        const res = await fetch(
          `/api/onemap/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
        );
        const data = (await res.json()) as
          | { postalCode?: string; address?: string }
          | { error: string };
        if (res.ok && 'postalCode' in data && data.postalCode) {
          label = `Singapore ${data.postalCode}`;
        } else if (res.ok && 'address' in data && data.address) {
          label = data.address;
        }
      } catch {
        /* OneMap reverse optional; fall back to coordinates */
      }
      if (!label) {
        label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
      setGeocodedHome(label, lat, lng);
      setAddress(label);
      router.push('/schools');
    } catch (e) {
      const msg =
        e instanceof GeolocationPositionError
          ? e.code === 1
            ? 'Location permission denied. Allow location for this site in your browser settings.'
            : e.code === 2
              ? 'Location unavailable.'
              : 'Location request timed out.'
          : 'Could not read your location.';
      setGeoError(msg);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              {latestYear} registration data (official school + ballot sources)
            </Badge>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Find the Perfect Primary School for Your Child
            </h1>
            <p className="mt-4 text-pretty text-lg text-muted-foreground md:text-xl">
              Navigate Singapore&apos;s P1 registration with confidence. Explore schools, compare
              ballot pressures, and make informed decisions.
            </p>

            <div className="mx-auto mt-8 max-w-xl text-left">
              <SearchInput
                value={address}
                onChange={onAddressChange}
                onSearch={() => void handleSearch()}
                isLoading={isSearching}
                onUseMyLocation={handleUseMyLocation}
                isLocating={isLocating}
              />
              {geoError ? (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {geoError}
                </p>
              ) : null}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RegistrationTimeline />

      <section className="border-t border-border bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Everything You Need to Decide
            </h2>
            <p className="mt-3 text-muted-foreground">
              Transparent data, clear insights, and powerful tools to guide your school selection
              journey.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured Schools</h2>
              <p className="mt-1 text-muted-foreground">
                A sample of schools from the official directory (Phase 2C, {latestYear})
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/schools">
                View all schools
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSchools.map((school) => (
              <Card
                key={school.id}
                className="group overflow-hidden transition-all hover:border-primary/20 hover:shadow-lg"
              >
                <CardContent className="p-0">
                  <div className="relative h-28 bg-secondary">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <GraduationCap className="h-10 w-10 text-secondary-foreground/30" />
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <PressureBadge pressure={school.pressure} size="sm" />
                    </div>
                  </div>
                  <div className="p-4">
                    <Link href={`/schools/${school.id}`}>
                      <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                        {school.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{school.address}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vacancies:</span>{' '}
                        <span className="font-medium text-foreground">{school.totalVacancies}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ballot:</span>{' '}
                        <span className="font-medium text-foreground">
                          {school.ballotChance != null ? `${school.ballotChance}%` : '—'}
                        </span>
                      </div>
                    </div>
                    {school.affiliation && (
                      <Badge variant="secondary" className="mt-3 text-xs">
                        {school.affiliation}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/schools">
                View all schools
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Transparent & Reliable Data</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              School profiles come from data.gov.sg (MOE). Ballot figures follow the same unofficial
              yearly snapshots used in the companion build pipeline—verify against MOE before
              decisions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Badge variant="outline" className="px-4 py-2">
                <Star className="mr-1.5 h-3.5 w-3.5 text-warning" />
                MOE open data
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <TrendingUp className="mr-1.5 h-3.5 w-3.5 text-success" />
                {yearRangeLabel} trends
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Users className="mr-1.5 h-3.5 w-3.5 text-primary" />
                {latestYear} cycle
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/10">
            <CardContent className="p-8 text-center md:p-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Ready to Start Your Search?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Enter your home address to discover nearby schools and begin comparing your options.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/schools">
                    <Search className="mr-2 h-4 w-4" />
                    Browse All Schools
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/guide">Learn About P1 Registration</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">SchoolMatch SG</span>
            </div>
            <p className="text-sm text-muted-foreground">
              School attributes from data.gov.sg; ballot tables from compiled snapshots. Not
              affiliated with MOE.
            </p>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
