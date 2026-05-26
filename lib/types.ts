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
  /** registered ÷ vacancies × 100 for active registration year/phase */
  subscriptionRate?: number;
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

export type Citizenship = 'sc' | 'pr';

/** One MOE Phase 2A pathway per school (parent picks a single reason). */
export type Phase2ATie =
  | 'parentOrSiblingAlumni'
  | 'parentAdvisoryManagement'
  | 'parentSchoolStaff'
  | 'childMoeKindergarten';

/** One MOE Phase 2B pathway per school (parent picks a single reason). */
export type Phase2BTie =
  | 'parentVolunteer40Hrs'
  | 'parentChurchOrClanEndorsed'
  | 'parentGrassrootsLeader';

/** At most one selection per phase for each school in the compare shortlist. */
export type SchoolPhaseSelections = {
  phase2A?: Phase2ATie;
  phase2B?: Phase2BTie;
};

export type ParentRegistrationProfile = {
  citizenship: Citizenship;
  selectionsBySchoolId: Record<string, SchoolPhaseSelections>;
};
