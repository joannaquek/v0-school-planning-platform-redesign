import { notFound } from 'next/navigation';
import { getSchoolDetailBySlug } from '@/lib/school-data';
import { SchoolDetailPageClient } from '@/components/school-detail-page-client';

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getSchoolDetailBySlug(id);
  if (!detail) notFound();
  return <SchoolDetailPageClient detail={detail} />;
}
