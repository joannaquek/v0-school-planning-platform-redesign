/**
 * MOE P1 registration phase eligibility (parent-facing summaries).
 * Source: MOE P1 Registration — used by planner, filter footnotes, and /guide.
 * Planner tie checkboxes map to these rules; parents self-attest — not verified by this app.
 */

export const moePhase2AEligibility = [
  'Whose parent or sibling is a former student of the primary school.',
  'Whose parent is a member of the School Advisory or Management Committee.',
  'Whose parent is a staff member of the primary school.',
  'Studying in the MOE Kindergarten in the primary school.',
] as const;

export const moePhase2BEligibility = [
  'Whose parent has joined the primary school as a parent volunteer not later than 1 July of the year before P1 registration and has given at least 40 hours of voluntary service to the school by 30 June of the year of P1 registration.',
  'Whose parent is a member endorsed by the church or clan directly connected with the primary school.',
  'Whose parent is endorsed as an active grassroots leader.',
] as const;

export const moePhase2CEligibility = [
  'For a child who is not yet registered in a primary school.',
] as const;

export const moePhase2CSEligibility = [
  'For a child who is not yet registered in a primary school after Phase 2C.',
] as const;

/** Phases with ballot data in bundled JSON (planner scoring). */
export const plannerPhases = ['2A', '2B', '2C'] as const;
export type PlannerPhase = (typeof plannerPhases)[number];

export const registrationPhaseFootnotes: Record<
  PlannerPhase,
  { label: string; summary: string; moeCriteria: readonly string[] }
> = {
  '2A': {
    label: 'Former students, SAC/Management, staff, MOE Kindergarten',
    summary:
      'For children whose parent or sibling is a former student; whose parent is on the School Advisory or Management Committee or is school staff; or who is in the MOE Kindergarten at the school.',
    moeCriteria: moePhase2AEligibility,
  },
  '2B': {
    label: 'Parent volunteer, church/clan, grassroots',
    summary:
      'For children whose parent met the school’s parent volunteer requirements (join by 1 July the year before, 40+ hours by 30 June of the registration year), is endorsed by a church or clan tied to the school, or is an endorsed active grassroots leader.',
    moeCriteria: moePhase2BEligibility,
  },
  '2C': {
    label: 'Not yet registered in a primary school',
    summary:
      'For a child who is not yet registered in a primary school. Singapore Citizens and PRs register by distance from home (within 1km, then 1–2km, then further; balloting may apply).',
    moeCriteria: moePhase2CEligibility,
  },
};

export const phase2CSupplementaryNote = {
  phase: '2CS' as const,
  title: 'Phase 2C Supplementary',
  summary: moePhase2CSEligibility[0],
  moeCriteria: moePhase2CSEligibility,
};
