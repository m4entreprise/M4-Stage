import { cn } from '@/lib/utils';

type SpinnerProps = {
  size?: 'sm' | 'md';
  className?: string;
};

const sizes: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
};

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <span
    className={cn(
      'inline-block animate-spin rounded-full border-current border-t-transparent text-slate-600',
      sizes[size],
      className,
    )}
  />
);
