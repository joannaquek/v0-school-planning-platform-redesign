import type {
  Citizenship,
  ParentRegistrationProfile,
  Phase2ATie,
  Phase2BTie,
  SchoolPhaseSelections,
} from './types';

export const defaultRegistrationProfile: ParentRegistrationProfile = {
  citizenship: 'sc',
  selectionsBySchoolId: {},
};

/** Legacy boolean ties (persisted before single-selection model). */
type LegacySchoolTies = {
  parentOrSiblingAlumni?: boolean;
  parentAdvisoryManagement?: boolean;
  parentSchoolStaff?: boolean;
  childMoeKindergarten?: boolean;
  parentVolunteer40Hrs?: boolean;
  parentChurchOrClanEndorsed?: boolean;
  parentGrassrootsLeader?: boolean;
  alumni?: boolean;
  schoolStaff?: boolean;
  parentVolunteerMet?: boolean;
  clanOrCommunity?: boolean;
};

type LegacyProfile = ParentRegistrationProfile & {
  tiesBySchoolId?: Record<string, LegacySchoolTies>;
};

const PHASE_2A_ORDER: Phase2ATie[] = [
  'parentOrSiblingAlumni',
  'parentAdvisoryManagement',
  'parentSchoolStaff',
  'childMoeKindergarten',
];

const PHASE_2B_ORDER: Phase2BTie[] = [
  'parentVolunteer40Hrs',
  'parentChurchOrClanEndorsed',
  'parentGrassrootsLeader',
];

function firstLegacy2A(raw: LegacySchoolTies): Phase2ATie | undefined {
  if (raw.parentOrSiblingAlumni || raw.alumni) return 'parentOrSiblingAlumni';
  if (raw.parentAdvisoryManagement) return 'parentAdvisoryManagement';
  if (raw.parentSchoolStaff || raw.schoolStaff) return 'parentSchoolStaff';
  if (raw.childMoeKindergarten) return 'childMoeKindergarten';
  return undefined;
}

function firstLegacy2B(raw: LegacySchoolTies): Phase2BTie | undefined {
  if (raw.parentVolunteer40Hrs || raw.parentVolunteerMet) return 'parentVolunteer40Hrs';
  if (raw.parentChurchOrClanEndorsed || raw.clanOrCommunity) return 'parentChurchOrClanEndorsed';
  if (raw.parentGrassrootsLeader) return 'parentGrassrootsLeader';
  return undefined;
}

function migrateLegacySelections(profile: LegacyProfile, schoolId: string): SchoolPhaseSelections {
  const legacy = profile.tiesBySchoolId?.[schoolId];
  if (!legacy) return {};
  return {
    phase2A: firstLegacy2A(legacy),
    phase2B: firstLegacy2B(legacy),
  };
}

export function getSchoolPhaseSelections(
  profile: ParentRegistrationProfile | LegacyProfile,
  schoolId: string
): SchoolPhaseSelections {
  const current = profile.selectionsBySchoolId?.[schoolId];
  if (current && (current.phase2A || current.phase2B)) {
    return { ...current };
  }
  return migrateLegacySelections(profile as LegacyProfile, schoolId);
}

export function hasPhase2ASelection(profile: ParentRegistrationProfile, schoolId: string): boolean {
  return getSchoolPhaseSelections(profile, schoolId).phase2A != null;
}

export function hasPhase2BSelection(profile: ParentRegistrationProfile, schoolId: string): boolean {
  return getSchoolPhaseSelections(profile, schoolId).phase2B != null;
}

export type PhaseOption<T extends string> = {
  value: T;
  label: string;
  hint: string;
};

export const phase2AOptions: PhaseOption<Phase2ATie>[] = [
  {
    value: 'parentOrSiblingAlumni',
    label: 'Parent or sibling former student',
    hint: 'Parent or sibling was a former student of this primary school',
  },
  {
    value: 'parentAdvisoryManagement',
    label: 'SAC / Management Committee',
    hint: 'Parent is on the School Advisory or Management Committee',
  },
  {
    value: 'parentSchoolStaff',
    label: 'Parent is school staff',
    hint: 'Parent is a staff member of this primary school',
  },
  {
    value: 'childMoeKindergarten',
    label: 'MOE Kindergarten at school',
    hint: 'Child is studying in the MOE Kindergarten in this primary school',
  },
];

export const phase2BOptions: PhaseOption<Phase2BTie>[] = [
  {
    value: 'parentVolunteer40Hrs',
    label: 'Parent volunteer (40+ hrs)',
    hint: 'Joined as parent volunteer by 1 Jul the year before P1 registration; 40+ hours by 30 Jun of the registration year',
  },
  {
    value: 'parentChurchOrClanEndorsed',
    label: 'Church or clan (school-endorsed)',
    hint: 'Parent is a member endorsed by the church or clan directly connected with the school',
  },
  {
    value: 'parentGrassrootsLeader',
    label: 'Active grassroots leader',
    hint: 'Parent is endorsed as an active grassroots leader',
  },
];

export function phase2ALabel(value: Phase2ATie): string {
  return phase2AOptions.find((o) => o.value === value)?.label ?? value;
}

export function phase2BLabel(value: Phase2BTie): string {
  return phase2BOptions.find((o) => o.value === value)?.label ?? value;
}

export function citizenshipLabel(citizenship: Citizenship): string {
  return citizenship === 'sc' ? 'Singapore Citizen' : 'Permanent Resident';
}
