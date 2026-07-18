import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
        secondary:
          'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-muted)]',
        success:
          'border-transparent bg-[var(--color-success-soft)] text-[var(--color-success)]',
        warning:
          'border-transparent bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
        danger:
          'border-transparent bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
