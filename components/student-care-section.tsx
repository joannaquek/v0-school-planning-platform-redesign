'use client';

import { Baby } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentCareForSchool } from '@/lib/student-care';
import { StudentCareList } from '@/components/student-care-list';

type StudentCareSectionProps = {
  schoolSlug: string;
  schoolName: string;
};

export function StudentCareSection({ schoolSlug, schoolName }: StudentCareSectionProps) {
  const bucket = getStudentCareForSchool(schoolSlug);
  const total = bucket.atSchool.length + bucket.nearby.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Baby className="h-5 w-5 text-primary" />
          Student care
        </CardTitle>
        <CardDescription>
          {total > 0
            ? `${bucket.atSchool.length} at ${schoolName} · ${bucket.nearby.length} nearby (MSF list)`
            : `Centres linked to ${schoolName} in the MSF student care list`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StudentCareList atSchool={bucket.atSchool} nearby={bucket.nearby} />
      </CardContent>
    </Card>
  );
}
