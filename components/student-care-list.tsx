'use client';

import { Phone, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StudentCareCentre } from '@/lib/student-care-types';
import { getStudentCareSource } from '@/lib/student-care';
import { cn } from '@/lib/utils';

type StudentCareListProps = {
  atSchool: StudentCareCentre[];
  nearby: StudentCareCentre[];
  className?: string;
  compact?: boolean;
  showDisclaimer?: boolean;
};

function CentreRow({
  centre,
  variant,
  compact,
}: {
  centre: StudentCareCentre;
  variant: 'at-school' | 'nearby';
  compact?: boolean;
}) {
  return (
    <li
      className={cn(
        'rounded-lg border border-border bg-card p-3',
        compact && 'p-2.5'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className={cn('font-medium text-foreground', compact ? 'text-sm' : 'text-sm')}>
          {centre.name}
        </p>
        {centre.monthlyFeeDisplay ? (
          <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
            {centre.monthlyFeeDisplay}/mo
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">
          {variant === 'at-school' ? 'At school' : 'Nearby'}
        </Badge>
        {variant === 'nearby' && centre.distanceToSchoolKm != null ? (
          <span className="text-[10px] text-muted-foreground">
            {centre.distanceToSchoolKm.toFixed(2)} km from school
          </span>
        ) : null}
        {centre.matchMethod === 'distance' ? (
          <span className="text-[10px] text-muted-foreground">~linked by distance</span>
        ) : null}
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
        <span>{centre.address}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        {centre.telephoneDisplay ? (
          <a
            href={`tel:${centre.telephone ?? centre.telephoneDisplay}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Phone className="h-3 w-3" />
            {centre.telephoneDisplay}
          </a>
        ) : null}
        {centre.email ? (
          <a
            href={`mailto:${centre.email}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Mail className="h-3 w-3" />
            {centre.email}
          </a>
        ) : null}
      </div>
    </li>
  );
}

export function StudentCareList({
  atSchool,
  nearby,
  className,
  compact = false,
  showDisclaimer = true,
}: StudentCareListProps) {
  const source = getStudentCareSource();
  const total = atSchool.length + nearby.length;

  if (total === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        No student care centres linked in our MSF list for this school. Try enabling student
        care on the map near your home.
      </p>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {atSchool.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            At this school ({atSchool.length})
          </p>
          <ul className="space-y-2">
            {atSchool.map((centre) => (
              <CentreRow key={centre.id} centre={centre} variant="at-school" compact={compact} />
            ))}
          </ul>
        </div>
      ) : null}
      {nearby.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nearby ({nearby.length})
          </p>
          <ul className="space-y-2">
            {nearby.map((centre) => (
              <CentreRow key={`${centre.id}-nearby`} centre={centre} variant="nearby" compact={compact} />
            ))}
          </ul>
        </div>
      ) : null}
      {showDisclaimer ? (
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Fees from MSF list ({source.documentDate}). Confirm availability and eligibility with
          each centre.
        </p>
      ) : null}
    </div>
  );
}
