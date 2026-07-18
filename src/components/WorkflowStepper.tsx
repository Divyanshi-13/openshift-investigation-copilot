import { cn } from '@/lib/utils'

const steps = [
  'Symptoms',
  'Evidence',
  'AI Findings',
  'Hypotheses',
  'Dependency Graph',
  'Next Action',
  'RCA Report',
]

interface WorkflowStepperProps {
  activeIndex: number
}

export function WorkflowStepper({ activeIndex }: WorkflowStepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const done = index < activeIndex
        const active = index === activeIndex
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs',
                active &&
                  'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
                done &&
                  !active &&
                  'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-foreground)]',
                !done &&
                  !active &&
                  'border-[var(--color-border-subtle)] text-[var(--color-muted-foreground)]',
              )}
            >
              <span className="font-mono text-[10px] opacity-70">
                {String(index + 1).padStart(2, '0')}
              </span>
              {step}
            </span>
            {index < steps.length - 1 && (
              <span className="text-[var(--color-border)]">→</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
