'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType>({
  open: false,
  setOpen: () => {},
});

export function Popover({ children }: { children: React.ReactNode }) {
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
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  asChild,
  children,
  className,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen } = React.useContext(PopoverContext);

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

export function PopoverContent({
  align = 'left',
  className,
  children,
}: {
  align?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = React.useContext(PopoverContext);
  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[240px] rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150',
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  );
}
