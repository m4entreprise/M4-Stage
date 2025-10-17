import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100', className)}
    {...props}
  />
);

export const CardTitle = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <h3 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h3>
);

export const CardDescription = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <p className={cn('mt-1 text-sm text-slate-500', className)}>{children}</p>
);

export const CardContent = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('mt-4 space-y-3', className)}>{children}</div>
);
