import { Suspense } from 'react';
import { getAllSchoolDetails } from '@/lib/school-data';
import { ComparePlannerClient } from '@/components/compare-planner-client';

function CompareFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      Loading registration planner…
    </div>
  );
}

export default function ComparePage() {
  const details = getAllSchoolDetails();

  return (
    <Suspense fallback={<CompareFallback />}>
      <ComparePlannerClient details={details} />
    </Suspense>
  );
}
