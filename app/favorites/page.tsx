import { getAllSchoolDetails } from '@/lib/school-data';
import { FavoritesPageClient } from '@/components/favorites-page-client';

export default function FavoritesPage() {
  const details = getAllSchoolDetails();
  return <FavoritesPageClient details={details} />;
}
