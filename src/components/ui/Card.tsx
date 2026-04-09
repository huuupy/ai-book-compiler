'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ReactNode } from 'react';

interface CardProps {
  className?: string;
  hover?: boolean;
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 shadow-sm',
          'transition-all duration-200',
          hover && 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps {
  className?: string;
  children?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-slate-100', className)}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardContentProps {
  className?: string;
  children?: ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn('p-6', className)}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps {
  className?: string;
  children?: ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl', className)}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

interface CardDescriptionProps {
  className?: string;
  children?: ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500 mt-1', className)}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardContent, CardFooter, CardDescription };
