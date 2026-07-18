import { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { HealthStatus } from '@/types/investigation'
import { cn } from '@/lib/utils'

export type ComponentNodeData = {
  label: string
  status: HealthStatus
  statusLabel: string
  issueCount: number
}

export type ComponentFlowNode = Node<ComponentNodeData, 'component'>

const statusMeta: Record<
  HealthStatus,
  { dot: string; ring: string; text: string; pulse: boolean }
> = {
  failed: {
    dot: 'bg-[var(--color-danger)]',
    ring: 'border-[var(--color-danger)]/50 shadow-sm',
    text: 'text-[var(--color-danger)]',
    pulse: true,
  },
  warning: {
    dot: 'bg-[var(--color-warning)]',
    ring: 'border-[var(--color-warning)]/50 shadow-sm',
    text: 'text-[var(--color-warning)]',
    pulse: false,
  },
  healthy: {
    dot: 'bg-[var(--color-success)]',
    ring: 'border-[var(--color-success)]/50 shadow-sm',
    text: 'text-[var(--color-success)]',
    pulse: false,
  },
}

function ComponentNodeComponent({ data }: NodeProps<ComponentFlowNode>) {
  const meta = statusMeta[data.status]

  return (
    <div
      className={cn(
        'min-w-[168px] rounded-lg border bg-white px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02]',
        meta.ring,
        meta.pulse && 'animate-node-pulse',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-[var(--color-accent)]"
      />
      <p className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
        {data.label}
      </p>
      <p className={cn('mt-1 flex items-center gap-1.5 text-xs font-medium', meta.text)}>
        <span className={cn('inline-block h-2 w-2 rounded-full', meta.dot)} />
        {data.statusLabel}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
        Issues: {data.issueCount}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-[var(--color-accent)]"
      />
    </div>
  )
}

export const ComponentNode = memo(ComponentNodeComponent)
