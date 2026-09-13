import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.07]', className)}
      {...props}
    />
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn('h-3', className)} />;
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-full', className)} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-9 w-24', className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5 shadow-xs',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <SkeletonText className="h-3.5 w-24" />
        <Skeleton className="h-10 w-10 rounded-2xl" />
      </div>
      <Skeleton className="h-7 w-20 mt-3.5" />
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <Skeleton className="h-5 w-24 rounded-full" />
        <SkeletonText className="w-12" />
      </div>
    </div>
  );
}

export function SkeletonStatCards({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTableRow({ cells = 4, index = 0 }: { cells?: number; index?: number }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.05]"
      style={{ opacity: 1 - index * 0.12 }}
    >
      {Array.from({ length: cells }).map((_, c) => (
        <Skeleton key={c} className="h-4 flex-1 last:flex-[0.5]" />
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  cells = 4,
  className,
}: {
  rows?: number;
  cells?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] shadow-xs overflow-hidden',
        className
      )}
    >
      <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-200/80 dark:border-white/[0.07]">
        {Array.from({ length: cells }).map((_, c) => (
          <Skeleton key={c} className="h-3.5 flex-1 last:flex-[0.5]" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cells={cells} index={i} />
      ))}
      <div className="px-4 py-3 flex items-center justify-between">
        <SkeletonText className="w-24" />
        <Skeleton className="h-6 w-48" />
      </div>
    </div>
  );
}

export function SkeletonPageHeader({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      <div className="space-y-3">
        <SkeletonText className="h-6 w-56" />
        <SkeletonText className="h-4 w-96 max-w-full" />
        <SkeletonText className="h-4 w-72 max-w-full" />
      </div>
      <SkeletonButton className="w-32" />
    </div>
  );
}

export function SkeletonToolbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent',
        className
      )}
    >
      <Skeleton className="h-10 flex-1 max-w-md rounded-xl" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <SkeletonText className="h-5 w-40" />
          <div className="mt-3 space-y-2">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-3/4" />
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
            <SkeletonText className="w-20" />
            <SkeletonText className="w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({
  count = 5,
  withAvatar = true,
  className,
}: {
  count?: number;
  withAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-4 flex items-center gap-4"
        >
          {withAvatar && <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />}
          <div className="flex-1 space-y-2 min-w-0">
            <SkeletonText className="w-1/3" />
            <SkeletonText className="w-2/3" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-6 shadow-xs',
        className
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <SkeletonText className="h-4 w-36" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {[70, 45, 90, 60, 80, 50, 65, 40, 85, 55, 75, 60].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <div className="flex-1 space-y-3 w-full">
            <SkeletonText className="h-5 w-40" />
            <SkeletonText className="w-64 max-w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <SkeletonButton className="w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#15171e] p-4 flex items-center gap-3"
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonText className="w-20" />
              <SkeletonText className="w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}