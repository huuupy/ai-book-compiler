'use client';

import { cn } from '@/lib/utils';
import { CheckboxHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends CheckboxHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-md border-2 transition-all duration-200',
              'flex items-center justify-center',
              checked
                ? 'bg-primary border-primary'
                : 'border-slate-300 peer-hover:border-slate-400',
              className
            )}
          >
            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        </div>
        {label && (
          <span className="text-sm text-slate-700 select-none">{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
