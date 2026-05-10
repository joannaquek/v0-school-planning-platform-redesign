export type IntakeDirection = 'increase' | 'decrease' | 'no-change';

export type BallotingPhaseRecord = {
  year: number;
  phase: '2A' | '2B' | '2C';
  vacancies: number;
  applicants: number;
  balloted: boolean;
};

export type SourceLink = {
  label: string;
  url: string;
  lastUpdated: string;
};

/** Shape of each entry in `schools-bundled.json` (built by p1-school-selector). */
export type SchoolDetailData = {
  slug: string;
  name: string;
  address: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
  ballotingPressure: 'Low' | 'Moderate' | 'High';
  intakeDirection: IntakeDirection;
  intakeDelta: number;
  ccas: string[];
  programmes: string[];
  affiliation: string | null;
  subjects: string[];
  distinctiveProgrammes: string[];
  affiliationNotes: string;
  ballotingHistory: BallotingPhaseRecord[];
  sourceLinks: SourceLink[];
};
