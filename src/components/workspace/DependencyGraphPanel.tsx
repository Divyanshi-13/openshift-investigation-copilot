import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  ComponentNode,
  type ComponentNodeData,
} from '@/components/workspace/ComponentNode'
import type { AnalysisResult, HealthStatus } from '@/types/investigation'

interface DependencyGraphPanelProps {
  graph: AnalysisResult['graph']
}

const nodeTypes: NodeTypes = {
  component: ComponentNode,
}

function enrichStatus(status: HealthStatus): {
  statusLabel: string
  issueCount: number
} {
  if (status === 'failed') return { statusLabel: 'Failed', issueCount: 3 }
  if (status === 'warning') return { statusLabel: 'Warning', issueCount: 1 }
  return { statusLabel: 'Healthy', issueCount: 0 }
}

export function DependencyGraphPanel({ graph }: DependencyGraphPanelProps) {
  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((node, index) => {
        const meta = enrichStatus(node.status)
        const data: ComponentNodeData = {
          label: node.label,
          status: node.status,
          statusLabel: node.statusLabel ?? meta.statusLabel,
          issueCount: node.issueCount ?? meta.issueCount,
        }
        return {
          id: node.id,
          type: 'component',
          position: {
            x: 40 + (index % 2) * 40,
            y: index * 108,
          },
          data,
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
        style: {
          stroke: '#4da3ff',
          strokeWidth: 1.6,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4da3ff',
          width: 16,
          height: 16,
        },
      })),
    [graph.edges],
  )

  return (
    <section className="flex h-full min-h-0 flex-col border-t border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Dependency Graph
          </h2>
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            Interactive failure cascade — hover nodes to inspect
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
          <span>🔴 Failed</span>
          <span>🟡 Warning</span>
          <span>🟢 Healthy</span>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          className="bg-[var(--color-background)]"
        >
          <Background color="#2a3340" gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  )
}
