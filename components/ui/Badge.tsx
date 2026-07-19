import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  className?: string;
}

const badgeVariants = {
  default: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-yellow-500/15 text-yellow-600',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-lg text-xs font-semibold', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}
