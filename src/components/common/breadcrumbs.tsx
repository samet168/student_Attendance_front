'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CaretRight, House } from '@phosphor-icons/react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Skip locale in segments
  const displaySegments = segments[0] === 'km' || segments[0] === 'en' 
    ? segments.slice(1) 
    : segments;

  const locale = segments[0] === 'km' || segments[0] === 'en' ? segments[0] : 'km';

  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-400">
      <Link
        href={`/${locale}/dashboard`}
        className="flex items-center hover:text-slate-200 transition-colors"
      >
        <House size={14} className="mr-1" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {displaySegments.map((segment, idx) => {
        const isLast = idx === displaySegments.length - 1;
        const href = `/${locale}/${displaySegments.slice(0, idx + 1).join('/')}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <React.Fragment key={href}>
            <CaretRight size={12} className="text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-200 font-semibold truncate capitalize">{label}</span>
            ) : (
              <Link href={href} className="hover:text-slate-200 transition-colors capitalize">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
