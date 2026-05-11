import { getAllSchoolDetails, getSchoolCount } from '@/lib/school-data';
import { detailToSchool } from '@/lib/map-detail-to-school';
import { years } from '@/lib/filter-options';
import { HomePageClient } from '@/components/home-page-client';

export default function HomePage() {
  const details = getAllSchoolDetails();
  const sorted = [...details].sort((a, b) => a.name.localeCompare(b.name));
  const latestYear = years[0];
  const featuredSchools = sorted
    .slice(0, 3)
    .map((d) => detailToSchool(d, Number(latestYear), '2C'));
  const schoolCount = getSchoolCount();
  const yearRangeLabel =
    years.length > 1 ? `${years[years.length - 1]}–${years[0]}` : years[0];

  return (
    <HomePageClient
      featuredSchools={featuredSchools}
      schoolCount={schoolCount}
      latestYear={latestYear}
      yearRangeLabel={yearRangeLabel}
    />
  );
}
