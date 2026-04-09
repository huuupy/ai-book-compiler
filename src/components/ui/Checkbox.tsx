'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { ChangeEvent } from 'react';

interface CheckboxProps {
  className?: string;
  label?: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onChange }, ref) => {
    return (
      <label className="inline-flex items-center gap-3 cursor-pointer select-none">
        <div
          className={cn(
            'w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
            checked
              ? 'bg-blue-500 border-blue-500 shadow-sm'
              : 'border-slate-400 bg-white hover:border-blue-400 hover:shadow-sm',
            className
          )}
        >
          {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        {label && (
          <span className="text-sm font-medium text-slate-700 select-none cursor-pointer">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
