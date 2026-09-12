import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs',
      ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20',
      link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-9 px-4 py-2 text-xs',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-11 rounded-xl px-6 text-sm',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
