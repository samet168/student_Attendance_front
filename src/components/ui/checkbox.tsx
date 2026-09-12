import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from '@phosphor-icons/react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'h-4 w-4 rounded border border-slate-600 bg-slate-900 transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500',
            className
          )}
        >
          {checked && <Check size={12} weight="bold" className="text-white" />}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
