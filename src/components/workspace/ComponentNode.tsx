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
  { dot: string; ring: string; text: string; bg: string; accent: string; pulse: boolean }
> = {
  failed: {
    dot: 'bg-[#c9190b]',
    ring: 'border-[#c9190b] shadow-md',
    text: 'text-[#c9190b]',
    bg: 'bg-[#c9190b]/[0.06]',
    accent: '#c9190b',
    pulse: true,
  },
  warning: {
    dot: 'bg-[#f0ab00]',
    ring: 'border-[#f0ab00] shadow-md',
    text: 'text-[#b98900]',
    bg: 'bg-[#f0ab00]/[0.06]',
    accent: '#f0ab00',
    pulse: false,
  },
  healthy: {
    dot: 'bg-[#3e8635]',
    ring: 'border-[#3e8635]/60 shadow-sm',
    text: 'text-[#3e8635]',
    bg: 'bg-[#3e8635]/[0.04]',
    accent: '#3e8635',
    pulse: false,
  },
}

function ComponentNodeComponent({ data }: NodeProps<ComponentFlowNode>) {
  const meta = statusMeta[data.status]

  return (
    <div
      className={cn(
        'relative min-w-[180px] rounded-lg border-2 bg-white px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        meta.ring,
        meta.pulse && 'animate-node-pulse',
      )}
    >
      <div
        className={cn('absolute inset-y-0 left-0 w-1 rounded-l-xl')}
        style={{ backgroundColor: meta.accent }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-[var(--color-accent)]"
      />
      <p className="text-sm font-bold tracking-tight text-[var(--color-foreground)]">
        {data.label}
      </p>
      <div className="mt-1.5 flex items-center justify-between">
        <p className={cn('flex items-center gap-1.5 text-xs font-semibold', meta.text)}>
          <span className={cn('inline-block h-2.5 w-2.5 rounded-full', meta.dot)} />
          {data.statusLabel}
        </p>
        {data.issueCount > 0 && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold text-white',
              data.status === 'failed' ? 'bg-[#c9190b]' : 'bg-[#f0ab00]',
            )}
          >
            {data.issueCount} {data.issueCount === 1 ? 'issue' : 'issues'}
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-[var(--color-accent)]"
      />
    </div>
  )
}

export const ComponentNode = memo(ComponentNodeComponent)
