import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
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
  failed: '#c9190b',
  warning: '#f0ab00',
  healthy: '#3e8635',
}

const statusBg: Record<HealthStatus, string> = {
  failed: 'rgba(201, 25, 11, 0.08)',
  warning: 'rgba(240, 171, 0, 0.08)',
  healthy: 'rgba(62, 134, 53, 0.08)',
}

export function DependencyGraph({ graph }: DependencyGraphProps) {
  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((node, index) => {
        const col = index % 3
        const row = Math.floor(index / 3)
        return {
          id: node.id,
          position: { x: col * 260 + 40, y: row * 130 },
          data: { label: node.label },
          style: {
            background: statusBg[node.status],
            border: `2px solid ${statusColor[node.status]}`,
            color: '#151515',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            width: 210,
            textAlign: 'center' as const,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          },
        }
      }),
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
        style: { stroke: '#c9190b', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#c9190b',
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
        <div className="h-[520px] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#d2d2d2" gap={24} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(node) => {
                const status = graph.nodes.find((n) => n.id === node.id)?.status
                return status ? statusColor[status] : '#d2d2d2'
              }}
              maskColor="rgba(240, 240, 240, 0.7)"
              style={{
                backgroundColor: 'white',
                border: '1px solid #d2d2d2',
                borderRadius: 8,
              }}
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
        className="h-3 w-3 rounded-full border-2"
        style={{ borderColor: color, backgroundColor: `${color}20` }}
      />
      {label}
    </span>
  )
}
