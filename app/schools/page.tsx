import { Suspense } from 'react';
import { getAllSchoolDetails } from '@/lib/school-data';
import { SchoolsPageClient } from '@/components/schools-page-client';

function SchoolsFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      Loading schools…
    </div>
  );
}

export default function SchoolsPage() {
  const details = getAllSchoolDetails();

  return (
    <Suspense fallback={<SchoolsFallback />}>
      <SchoolsPageClient details={details} />
    </Suspense>
  );
}
