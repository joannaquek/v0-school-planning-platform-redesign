export type StudentCareMatchMethod = 'host-name' | 'postal' | 'distance';

export type StudentCareCentre = {
  id: string;
  name: string;
  address: string;
  addressLines: string[];
  postalCode: string;
  telephone: string | null;
  telephoneDisplay: string | null;
  email: string | null;
  emails: string[];
  monthlyFee: number | null;
  monthlyFeeCurrency: string | null;
  monthlyFeeDisplay: string | null;
  coordinates?: { lat: number; lng: number };
  linkedSchoolSlug?: string;
  matchMethod?: StudentCareMatchMethod;
  distanceToSchoolKm?: number | null;
};

export type StudentCareSchoolBucket = {
  atSchool: StudentCareCentre[];
  nearby: StudentCareCentre[];
};

export type StudentCareIndex = {
  generatedAt: string;
  nearbyRadiusKm: number;
  schoolsWithCentres: number;
  bySchool: Record<string, StudentCareSchoolBucket>;
};

export type StudentCareSourceMeta = {
  document: string;
  documentDate: string;
  extractedAt: string;
  notes: string;
};
