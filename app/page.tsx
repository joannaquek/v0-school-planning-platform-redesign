import { getAllSchoolDetails, getSchoolCount } from '@/lib/school-data';
import { detailToSchool } from '@/lib/map-detail-to-school';
import { years } from '@/lib/filter-options';
import { HomePageClient } from '@/components/home-page-client';

export default function HomePage() {
  const details = getAllSchoolDetails();
  const latestYear = years[0];
  const pressureRank: Record<'low' | 'moderate' | 'high', number> = {
    high: 3,
    moderate: 2,
    low: 1,
  };
  const featuredSchools = details
    .map((d) => detailToSchool(d, Number(latestYear), '2C'))
    .sort((a, b) => {
      const pressureDiff = pressureRank[b.pressure] - pressureRank[a.pressure];
      if (pressureDiff !== 0) return pressureDiff;
      const fillDiff = (a.subscriptionRate ?? 999) - (b.subscriptionRate ?? 999);
      if (fillDiff !== 0) return fillDiff;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 4);
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
