export interface School {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  distance?: number;
  distanceBand: '1km' | '1-2km' | '2km+' | 'unknown';
  pressure: 'low' | 'moderate' | 'high';
  intakeChange: 'increase' | 'decrease' | 'no-change';
  intakeChangeValue?: number;
  totalVacancies: number;
  registeredStudents: number;
  ballotChance?: number;
  ccas: string[];
  affiliation?: string;
  specialPrograms?: string[];
  historicalData: YearlyData[];
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  websiteUrl?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface YearlyData {
  year: number;
  phase: string;
  vacancies: number;
  registered: number;
  balloted: boolean;
  ballotRate?: number;
}

export type EligibilityFilter =
  | 'all'
  | 'alumni'
  | 'staff'
  | 'parent-volunteer'
  | 'association-sponsor'
  | 'community-leader'
  | 'no-priority';

export interface FilterState {
  distanceBand: string;
  pressure: string;
  year: string;
  phase: string;
  eligibility: EligibilityFilter;
  ccaFilter: string[];
  sortBy: 'distance' | 'pressure' | 'name' | 'vacancies';
}

export interface CompareItem {
  school: School;
  addedAt: Date;
}
