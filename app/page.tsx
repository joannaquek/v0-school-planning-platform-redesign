'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Search, Map, Scale, TrendingUp, Shield, ChevronRight, Star, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { SearchInput } from '@/components/search-input';
import { PressureBadge } from '@/components/pressure-badge';
import { useAppStore } from '@/lib/store';
import { mockSchools } from '@/lib/mock-data';
import { RegistrationTimeline } from '@/components/registration-timeline';

const features = [
  {
    icon: Search,
    title: 'Smart Discovery',
    description: 'Find schools near you with intelligent filtering by distance, pressure, and CCAs.',
  },
  {
    icon: TrendingUp,
    title: 'Historical Data',
    description: 'View 5-year registration trends to understand ballot patterns and vacancy changes.',
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

export default function HomePage() {
  const router = useRouter();
  const { setUserAddress, userAddress } = useAppStore();
  const [address, setAddress] = useState(userAddress);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!address.trim()) return;
    setIsSearching(true);
    setUserAddress(address);
    setTimeout(() => {
      router.push('/schools');
    }, 500);
  };

  // Featured schools
  const featuredSchools = mockSchools.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              2025 Registration Data Available
            </Badge>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Find the Perfect Primary School for Your Child
            </h1>
            <p className="mt-4 text-pretty text-lg text-muted-foreground md:text-xl">
              Navigate Singapore&apos;s P1 registration with confidence. Explore schools, compare ballot pressures, and make informed decisions.
            </p>

            {/* Search Box */}
            <div className="mx-auto mt-8 max-w-xl">
              <SearchInput
                value={address}
                onChange={setAddress}
                onSearch={handleSearch}
                isLoading={isSearching}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Registration Timeline */}
      <RegistrationTimeline />

      {/* Features Section */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Everything You Need to Decide
            </h2>
            <p className="mt-3 text-muted-foreground">
              Transparent data, clear insights, and powerful tools to guide your school selection journey.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card transition-all hover:shadow-md hover:border-primary/20">
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

      {/* Featured Schools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Popular Schools</h2>
              <p className="mt-1 text-muted-foreground">Highly sought-after schools with competitive registration</p>
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
              <Card key={school.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
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
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
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
                        <span className="font-medium text-foreground">{school.ballotChance}%</span>
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

      {/* Trust Section */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Transparent & Reliable Data</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              All registration data is sourced from official MOE records. We only show metrics you can verify: 
              distance, historical ballot pressure, intake changes, CCAs, and affiliation pathways. 
              No rankings, no subjective ratings.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Badge variant="outline" className="px-4 py-2">
                <Star className="mr-1.5 h-3.5 w-3.5 text-warning" />
                Official MOE Data
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <TrendingUp className="mr-1.5 h-3.5 w-3.5 text-success" />
                5 Years Historical
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Users className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Updated for 2025
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/10 border-primary/20">
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
                  <Link href="/guide">
                    Learn About P1 Registration
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
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
              Data sourced from MOE. Not affiliated with MOE or any school.
            </p>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
