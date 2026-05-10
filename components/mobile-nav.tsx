'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Map, Heart, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/schools', icon: Search, label: 'Search' },
  { href: '/schools?view=map', icon: Map, label: 'Map' },
  { href: '/favorites', icon: Heart, label: 'Saved' },
  { href: '/guide', icon: BookOpen, label: 'Guide' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { favorites } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = 
            item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href.split('?')[0]);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.label === 'Saved' && favorites.length > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                    {favorites.length}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
