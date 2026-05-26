'use client';

import Link from 'next/link';
import { Baby } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getStudentCareForCompare, summarizeStudentCare } from '@/lib/student-care';
import { StudentCareList } from '@/components/student-care-list';
import type { School } from '@/lib/types';

type StudentCareComparePanelProps = {
  schools: School[];
};

export function StudentCareComparePanel({ schools }: StudentCareComparePanelProps) {
  if (schools.length === 0) return null;

  const buckets = getStudentCareForCompare(schools.map((s) => s.id));

  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Baby className="h-5 w-5 text-primary" />
        Student care for your shortlist
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Compare monthly fees and contacts per school. Multiple operators may serve the same
        school.
      </p>
      <Accordion type="multiple" className="rounded-xl border border-border bg-card px-4">
        {schools.map((school) => {
          const bucket = buckets[school.id];
          const summary = summarizeStudentCare(bucket);
          return (
            <AccordionItem key={school.id} value={school.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex flex-col items-start gap-0.5 pr-2">
                  <span className="font-medium text-foreground">{school.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {summary.total === 0
                      ? 'No centres linked'
                      : `${summary.total} centre${summary.total !== 1 ? 's' : ''}${
                          summary.minFeeDisplay ? ` · from ${summary.minFeeDisplay}/mo` : ''
                        }`}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <StudentCareList
                  atSchool={bucket.atSchool}
                  nearby={bucket.nearby}
                  compact
                />
                <Link
                  href={`/schools/${school.id}`}
                  className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                >
                  View school details
                </Link>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
