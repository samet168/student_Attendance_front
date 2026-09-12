'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType>({
  open: false,
  setOpen: () => {},
});

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild,
  children,
  className,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen } = React.useContext(DropdownContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (e: any) => {
        (children.props as any)?.onClick?.(e);
        setOpen(!open);
      },
    });
  }

  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn('inline-flex items-center justify-center cursor-pointer', className)}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  align = 'right',
  side = 'bottom',
  className,
  children,
}: {
  align?: 'left' | 'right';
  side?: 'top' | 'bottom';
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = React.useContext(DropdownContext);
  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 min-w-[200px] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-1.5 text-slate-700 dark:text-slate-200 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150',
        side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  onClick,
  className,
  children,
}: {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const { setOpen } = React.useContext(DropdownContext);
  return (
    <button
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        'flex w-full items-center px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/90 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left',
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-slate-100 dark:bg-slate-800', className)} />;
}
