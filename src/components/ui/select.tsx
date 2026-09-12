import * as React from 'react';
import { cn } from '@/lib/utils';
import { CaretDown } from '@phosphor-icons/react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-xs',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <CaretDown size={14} />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
