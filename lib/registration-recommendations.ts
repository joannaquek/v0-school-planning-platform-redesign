import type { SchoolDetailData } from './bundled-types';
import type { GeoPoint } from './geo';
import type { RegistrationPhase } from './compare-phase-metrics';
import { getPhaseFillRatio, getPhaseRegistrationSnapshot } from './compare-phase-metrics';
import {
  getSchoolPhaseSelections,
  hasPhase2ASelection,
  hasPhase2BSelection,
  phase2ALabel,
  phase2BLabel,
} from './registration-profile';
import { detailToSchool } from './map-detail-to-school';
import type { CompareItem, ParentRegistrationProfile, School } from './types';

export type SchoolEligibility = {
  school: School;
  eligiblePhases: RegistrationPhase[];
  eligibilityReasons: string[];
};

export type PhaseRecommendation = {
  phase: RegistrationPhase;
  school: School | null;
  headline: string;
  reasons: string[];
  fillPercent?: number;
  notEligible?: boolean;
  alternatives: School[];
};

export type RegistrationPlan = {
  year: number;
  schools: School[];
  phase2A: PhaseRecommendation;
  phase2B: PhaseRecommendation;
  phase2C: PhaseRecommendation;
};

function distanceBandPriority(band: School['distanceBand']): number {
  switch (band) {
    case '1km':
      return 0;
    case '1-2km':
      return 1;
    case '2km+':
      return 2;
    default:
      return 3;
  }
}

export function getSchoolEligibility(
  school: School,
  profile: ParentRegistrationProfile
): SchoolEligibility {
  const selections = getSchoolPhaseSelections(profile, school.id);
  const eligiblePhases: RegistrationPhase[] = [];
  const eligibilityReasons: string[] = [];

  if (profile.citizenship === 'sc' || profile.citizenship === 'pr') {
    eligiblePhases.push('2C');
    eligibilityReasons.push(
      'Child not yet registered in a primary school (Phase 2C) — SC/PR distance-based registration'
    );
  }

  if (selections.phase2A) {
    eligiblePhases.push('2A');
    eligibilityReasons.push(`Phase 2A pathway: ${phase2ALabel(selections.phase2A)}`);
  }

  if (selections.phase2B) {
    eligiblePhases.push('2B');
    eligibilityReasons.push(`Phase 2B pathway: ${phase2BLabel(selections.phase2B)}`);
  }

  return { school, eligiblePhases, eligibilityReasons };
}

/** Rehydrate schools from the compare shortlist (user-selected schools only). */
export function buildCompareSchools(
  details: SchoolDetailData[],
  year: number,
  home: GeoPoint | null,
  compareList: CompareItem[]
): School[] {
  return compareList.map((item) => {
    const detail = details.find((d) => d.slug === item.school.id);
    if (detail) return detailToSchool(detail, year, '2C', home);
    return item.school;
  });
}

type ScoredCandidate = {
  school: School;
  score: number;
  reasons: string[];
  fillPercent?: number;
};

function buildPhaseReasons(
  school: School,
  phase: RegistrationPhase,
  year: number,
  fillPercent?: number
): string[] {
  const reasons: string[] = [];
  if (school.distance != null) {
    reasons.push(`${school.distance.toFixed(2)}km from home`);
  }
  if (school.distanceBand === '1km') {
    reasons.push('Within 1km distance band (higher MOE priority)');
  } else if (school.distanceBand === '1-2km') {
    reasons.push('Within 1–2km distance band');
  }
  if (fillPercent != null) {
    reasons.push(
      `${year} Phase ${phase}: ${fillPercent}% of vacancies filled in past data (${fillPercent > 100 ? 'oversubscribed' : 'room available'})`
    );
  }
  return reasons;
}

function scoreForPhase(
  school: School,
  phase: RegistrationPhase,
  year: number
): ScoredCandidate | null {
  const fill = getPhaseFillRatio(school, year, phase);
  if (fill == null) return null;

  const snapshot = getPhaseRegistrationSnapshot(school, year, phase);
  const fillPercent = snapshot?.fillPercent;
  const distance = school.distance ?? 99;

  if (phase === '2C') {
    const band = distanceBandPriority(school.distanceBand);
    const score = band * 1000 + fill * 100 + distance;
    return {
      school,
      score,
      fillPercent,
      reasons: buildPhaseReasons(school, phase, year, fillPercent),
    };
  }

  const score = fill * 100 + distance;
  return {
    school,
    score,
    fillPercent,
    reasons: buildPhaseReasons(school, phase, year, fillPercent),
  };
}

function recommendPhase(
  phase: RegistrationPhase,
  profile: ParentRegistrationProfile,
  schools: School[],
  year: number
): PhaseRecommendation {
  const eligible = schools
    .map((school) => {
      const { eligiblePhases } = getSchoolEligibility(school, profile);
      if (!eligiblePhases.includes(phase)) return null;
      return scoreForPhase(school, phase, year);
    })
    .filter((x): x is ScoredCandidate => x != null)
    .sort((a, b) => a.score - b.score);

  if (eligible.length === 0) {
    const hint =
      phase === '2A'
        ? 'Choose one Phase 2A pathway for a school in your shortlist (or skip if not applying in 2A).'
        : phase === '2B'
          ? 'Choose one Phase 2B pathway for a school in your shortlist (or skip if not applying in 2B).'
          : schools.length === 0
            ? 'Add schools to your shortlist to compare Phase 2C odds.'
            : 'Set your home address on Schools to compare distance for Phase 2C.';
    return {
      phase,
      school: null,
      headline: `No ${phase} pick yet`,
      reasons: [hint],
      notEligible: true,
      alternatives: [],
    };
  }

  const best = eligible[0];
  const alternatives = eligible.slice(1, 3).map((e) => e.school);

  return {
    phase,
    school: best.school,
    headline: `Best odds: ${best.school.name}`,
    reasons: best.reasons,
    fillPercent: best.fillPercent,
    alternatives,
  };
}

export function generateRegistrationPlan(
  profile: ParentRegistrationProfile,
  schools: School[],
  year: number
): RegistrationPlan {
  return {
    year,
    schools,
    phase2A: recommendPhase('2A', profile, schools, year),
    phase2B: recommendPhase('2B', profile, schools, year),
    phase2C: recommendPhase('2C', profile, schools, year),
  };
}

export function hasDeclared2ASelection(
  profile: ParentRegistrationProfile,
  schools: School[]
): boolean {
  return schools.some((school) => hasPhase2ASelection(profile, school.id));
}

export function hasDeclared2BSelection(
  profile: ParentRegistrationProfile,
  schools: School[]
): boolean {
  return schools.some((school) => hasPhase2BSelection(profile, school.id));
}
