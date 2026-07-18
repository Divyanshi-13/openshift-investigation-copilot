import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalysisResult, HealthStatus } from '@/types/investigation'

interface DependencyGraphProps {
  graph: AnalysisResult['graph']
}

const statusColor: Record<HealthStatus, string> = {
  failed: '#f85149',
  warning: '#d29922',
  healthy: '#3fb950',
}

const statusBg: Record<HealthStatus, string> = {
  failed: 'rgba(248, 81, 73, 0.12)',
  warning: 'rgba(210, 153, 34, 0.12)',
  healthy: 'rgba(63, 185, 80, 0.12)',
}

export function DependencyGraph({ graph }: DependencyGraphProps) {
  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((node, index) => ({
        id: node.id,
        position: { x: 40, y: index * 110 },
        data: { label: node.label },
        style: {
          background: statusBg[node.status],
          border: `1px solid ${statusColor[node.status]}`,
          color: '#e6edf3',
          borderRadius: 8,
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 600,
          width: 180,
          textAlign: 'center' as const,
          boxShadow: `0 0 0 1px ${statusColor[node.status]}22`,
        },
      })),
    [graph.nodes],
  )

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#58a6ff', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#58a6ff',
        },
      })),
    [graph.edges],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Dependency Graph</CardTitle>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Failure cascade from MachineConfig through Authentication.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
            <Legend color={statusColor.failed} label="Failed" />
            <Legend color={statusColor.warning} label="Warning" />
            <Legend color={statusColor.healthy} label="Healthy" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[520px] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-background)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#30363d" gap={18} size={1} />
            <Controls
              showInteractive={false}
              className="!overflow-hidden !rounded-md !border ![border-color:var(--color-border)] ![background:var(--color-surface)]"
            />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}
