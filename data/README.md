# Data files

## Student care centres

| File | Source | Regenerate |
|------|--------|------------|
| `student-care-centres.json` | MSF SCC directory (PDF export used for this snapshot). See `https://www.msf.gov.sg/our-services/directories#studenttab` | `python3 scripts/extract-student-care-centres.py` |
| `student-care-geocode-cache.json` | Google Geocoding (optional) + school postals | `node scripts/geocode-student-care.mjs` |
| `student-care-centres-geocoded.json` | Centres + `coordinates` | `node scripts/geocode-student-care.mjs` |
| `student-care-index.json` | SCC linked to primary schools | `node scripts/link-student-care-schools.mjs` |

Each centre includes name, address, postal code, phone, email(s), and monthly fee (SGD).

**Pipeline:** extract → geocode (optional API key in `.env.local`) → link to schools.

Not imported in the app until `lib/student-care.ts` is used (school detail, compare, map).
