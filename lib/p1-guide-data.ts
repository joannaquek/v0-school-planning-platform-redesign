export type P1GuidePhase = {
  phase: string
  title: string
  description: string
  eligibility: string
  timing: string
  guaranteed: boolean
}

export type P1DistanceBand = {
  band: string
  priority: string
  description: string
}

export type P1GuideFaq = {
  question: string
  answer: string
}

export const p1GuidePhases: P1GuidePhase[] = [
  {
    phase: 'Phase 1',
    title: 'For siblings of current students',
    description: 'Children with siblings currently studying in the school.',
    eligibility: 'Siblings of students in the primary school',
    timing: 'Early July',
    guaranteed: true,
  },
  {
    phase: 'Phase 2A',
    title: 'Former students, SAC/Management, staff, MOE Kindergarten',
    description:
      'Children whose parent or sibling is a former student; whose parent is on the School Advisory or Management Committee or is school staff; or who is in the MOE Kindergarten at the school.',
    eligibility:
      'Parent/sibling former student; parent on SAC/Management Committee; parent school staff; child in MOE Kindergarten at school',
    timing: 'Early July',
    guaranteed: false,
  },
  {
    phase: 'Phase 2B',
    title: 'Parent volunteer, church/clan, grassroots',
    description:
      'Children whose parent met parent volunteer requirements, is endorsed by a church or clan tied to the school, or is an endorsed active grassroots leader.',
    eligibility:
      'Parent volunteer (join by 1 Jul year before, 40+ hrs by 30 Jun registration year); church/clan endorsed; grassroots leader endorsed',
    timing: 'Mid July',
    guaranteed: false,
  },
  {
    phase: 'Phase 2C',
    title: 'Not yet registered in a primary school',
    description:
      'For a child who is not yet registered in a primary school. Singapore Citizens and PRs register by distance from home.',
    eligibility: 'Child not yet registered; SC/PR with home–school distance priority',
    timing: 'Late July',
    guaranteed: false,
  },
  {
    phase: 'Phase 2C Supplementary',
    title: 'After Phase 2C',
    description: 'For a child who is not yet registered in a primary school after Phase 2C.',
    eligibility: 'Child not yet registered after Phase 2C',
    timing: 'Early August',
    guaranteed: false,
  },
  {
    phase: 'Phase 3',
    title: 'Non-citizens',
    description: 'For children who are not Singapore Citizens or PRs.',
    eligibility: 'International students',
    timing: 'Late August',
    guaranteed: false,
  },
]

export const p1GuideDistanceBands: P1DistanceBand[] = [
  {
    band: 'Within 1km',
    priority: 'Highest',
    description: 'Students living within 1km of the school get priority in balloting.',
  },
  {
    band: '1-2km',
    priority: 'Second',
    description: 'After 1km priority students are placed, 1-2km students are considered.',
  },
  {
    band: 'Over 2km',
    priority: 'Third',
    description: 'Students living beyond 2km are considered last.',
  },
]

export const p1GuideFaqs: P1GuideFaq[] = [
  {
    question: 'What happens if a school is oversubscribed?',
    answer:
      'If more students apply than there are vacancies, a ballot (random selection) is conducted. Students living closer to the school (within 1km) get priority. Singapore Citizens also get priority over Permanent Residents.',
  },
  {
    question: 'How is distance calculated?',
    answer:
      'Distance is calculated as the straight-line distance from your registered home address to the school. MOE uses official address records for this calculation.',
  },
  {
    question: 'Can I apply to multiple schools?',
    answer:
      'No, you can only register at one school per phase. If your child is unsuccessful, you can apply to a different school in the next phase.',
  },
  {
    question: 'What if I move house after registration?',
    answer:
      'If you move to a new address after registration but before the start of school, you should inform the school. The distance priority used during registration is based on your address at the time of registration.',
  },
  {
    question: 'How do I check my ballot chances?',
    answer:
      'Our platform provides historical data showing how many students registered vs. how many vacancies were available. Schools that consistently have more registrations than vacancies will require balloting.',
  },
  {
    question: 'What is an affiliated school?',
    answer:
      'Some primary schools are affiliated with secondary schools. Students from affiliated primary schools may get priority admission to the secondary school. However, this is separate from the P1 registration process.',
  },
]
