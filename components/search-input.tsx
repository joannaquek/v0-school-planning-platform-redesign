'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
  showLocationButton?: boolean;
  isLoading?: boolean;
  /** Geolocation + reverse geocode (parent implements). */
  onUseMyLocation?: () => void | Promise<void>;
  isLocating?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Enter your home address or postal code',
  className,
  showLocationButton = true,
  isLoading = false,
  onUseMyLocation,
  isLocating = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-4 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-14 rounded-2xl border-border bg-card pl-12 pr-32 text-base shadow-sm transition-shadow focus-visible:shadow-md"
        />
        <div className="absolute right-2 flex items-center gap-2">
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
          <Button
            onClick={onSearch}
            disabled={isLoading || !value.trim()}
            className="h-10 rounded-xl px-5"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>

      {showLocationButton && onUseMyLocation && (
        <button
          type="button"
          disabled={isLocating || isLoading}
          className="mt-3 inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80 disabled:pointer-events-none disabled:opacity-50"
          onClick={() => void onUseMyLocation()}
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {isLocating ? 'Getting location…' : 'Use my current location'}
        </button>
      )}
    </div>
  );
}

interface SchoolSearchInputProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SchoolSearchInput({ onSearch, className }: SchoolSearchInputProps) {
  const [query, setQuery] = useState('');

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Search by school name..."
        className="h-10 pl-9 pr-8"
      />
      {query && (
        <button
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
