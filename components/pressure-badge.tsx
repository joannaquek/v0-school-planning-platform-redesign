import { cn } from '@/lib/utils';

interface PressureBadgeProps {
  pressure: 'low' | 'moderate' | 'high';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const pressureConfig = {
  low: {
    label: 'Low pressure',
    shortLabel: 'Low',
    bgClass: 'bg-success/15',
    textClass: 'text-success',
    dotClass: 'bg-success',
  },
  moderate: {
    label: 'Moderate pressure',
    shortLabel: 'Moderate',
    bgClass: 'bg-warning/15',
    textClass: 'text-warning-foreground',
    dotClass: 'bg-warning',
  },
  high: {
    label: 'High pressure',
    shortLabel: 'High',
    bgClass: 'bg-destructive/15',
    textClass: 'text-destructive',
    dotClass: 'bg-destructive',
  },
};

export function PressureBadge({ pressure, size = 'md', showLabel = true }: PressureBadgeProps) {
  const config = pressureConfig[pressure];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgClass,
        config.textClass,
        sizeClasses[size]
      )}
    >
      <span className={cn('rounded-full', config.dotClass, dotSizes[size])} />
      {showLabel && <span>{size === 'sm' ? config.shortLabel : config.label}</span>}
    </span>
  );
}
