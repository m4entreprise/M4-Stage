import type { LabelHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export const Label = ({ className, children, ...props }: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) => (
  <label className={cn('text-sm font-medium text-slate-700', className)} {...props}>
    {children}
  </label>
);
