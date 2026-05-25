# MOE P1 registration phases (reference)

Official eligibility wording used by this app for copy, the registration planner, and `/guide`.  
**Always confirm current rules on [MOE P1 Registration](https://www.moe.gov.sg/primary/p1-registration) and each school’s website.**

Programmatic source: [`lib/p1-registration-phases.ts`](../lib/p1-registration-phases.ts).

## Phase 2A

For children:

- Whose **parent or sibling** is a former student of the primary school.
- Whose **parent** is a member of the **School Advisory or Management Committee**.
- Whose **parent** is a **staff member** of the primary school.
- **Studying in the MOE Kindergarten** in the primary school.

## Phase 2B

For children:

- Whose **parent** has joined the primary school as a **parent volunteer not later than 1 July** of the year before P1 registration and has given **at least 40 hours** of voluntary service to the school **by 30 June** of the year of P1 registration.
- Whose **parent** is a member **endorsed by the church or clan** directly connected with the primary school.
- Whose **parent** is **endorsed as an active grassroots leader**.

## Phase 2C

For a child who is **not yet registered** in a primary school.

(Singapore Citizens and Permanent Residents typically register by home–school distance in this phase.)

## Phase 2C Supplementary (2CS)

For a child who is **not yet registered** in a primary school **after Phase 2C**.

> The registration planner in this app scores **2A, 2B, and 2C** only (historical ballot data). Phase 2CS is documented here for completeness but is not modelled in recommendations yet.

## Planner selections (one per phase per school)

On `/compare`, parents add schools to a shortlist and pick **at most one pathway per phase per school** (radio buttons). The app compares historical fill rates across those schools. Selections are **not verified** against school records.

| Selection (one per school) | MOE phase |
|----------------------------|-----------|
| Parent or sibling former student | 2A |
| Parent on SAC / Management Committee | 2A |
| Parent is school staff | 2A |
| Child in MOE Kindergarten at school | 2A |
| Parent volunteer (40+ hrs, join-by dates) | 2B |
| Church or clan endorsed by school | 2B |
| Active grassroots leader (endorsed) | 2B |
| Singapore Citizen / PR + home address | 2C (all shortlisted schools; distance affects priority) |
