'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  title: string;
  href: string;
  icon: Icon;
  collapsed?: boolean;
  badge?: string | number;
}

export function SidebarNavItem({ title, href, icon: IconComponent, collapsed, badge }: SidebarNavItemProps) {
  const pathname = usePathname();
  // Match current locale prefix or root
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all select-none',
        isActive
          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs border-r-2 border-blue-600'
          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
      )}
      title={collapsed ? title : undefined}
    >
      <IconComponent
        size={20}
        weight={isActive ? 'fill' : 'regular'}
        className={cn('shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200')}
      />
      {!collapsed && (
        <span className="truncate flex-1">{title}</span>
      )}
      {!collapsed && badge && (
        <span className="ml-auto inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
          {badge}
        </span>
      )}
    </Link>
  );
}
