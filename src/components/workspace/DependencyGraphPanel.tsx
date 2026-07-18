import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
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

const statusColors: Record<HealthStatus, string> = {
  failed: '#c9190b',
  warning: '#f0ab00',
  healthy: '#3e8635',
}

function layoutNodes(
  graphNodes: AnalysisResult['graph']['nodes'],
  graphEdges: AnalysisResult['graph']['edges'],
) {
  const childMap = new Map<string, string[]>()
  const hasParent = new Set<string>()
  for (const e of graphEdges) {
    const children = childMap.get(e.source) ?? []
    children.push(e.target)
    childMap.set(e.source, children)
    hasParent.add(e.target)
  }

  const roots = graphNodes.filter((n) => !hasParent.has(n.id))
  if (roots.length === 0 && graphNodes.length > 0) roots.push(graphNodes[0])

  const positions = new Map<string, { x: number; y: number }>()
  const COL_WIDTH = 240
  const ROW_HEIGHT = 90
  let rowCounter = 0

  function place(id: string, depth: number) {
    if (positions.has(id)) return
    positions.set(id, { x: depth * COL_WIDTH, y: rowCounter * ROW_HEIGHT })
    const children = childMap.get(id) ?? []
    if (children.length === 0) {
      rowCounter++
      return
    }
    for (const child of children) {
      place(child, depth + 1)
    }
  }

  for (const root of roots) {
    place(root.id, 0)
  }

  const placed = new Set(positions.keys())
  for (const node of graphNodes) {
    if (!placed.has(node.id)) {
      positions.set(node.id, { x: 0, y: rowCounter * ROW_HEIGHT })
      rowCounter++
    }
  }

  return positions
}

export function DependencyGraphPanel({ graph }: DependencyGraphPanelProps) {
  const positions = useMemo(
    () => layoutNodes(graph.nodes, graph.edges),
    [graph.nodes, graph.edges],
  )

  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((node) => {
        const meta = enrichStatus(node.status)
        const data: ComponentNodeData = {
          label: node.label,
          status: node.status,
          statusLabel: node.statusLabel ?? meta.statusLabel,
          issueCount: node.issueCount ?? meta.issueCount,
        }
        const pos = positions.get(node.id) ?? { x: 0, y: 0 }
        return {
          id: node.id,
          type: 'component',
          position: pos,
          data,
        }
      }),
    [graph.nodes, positions],
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
          stroke: '#c9190b',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#c9190b',
          width: 18,
          height: 18,
        },
      })),
    [graph.edges],
  )

  return (
    <section className="flex h-full min-h-0 flex-col border-t-2 border-[var(--color-accent)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--color-accent)]">
              <circle cx="8" cy="3" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="3" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="13" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="8" y1="5.5" x2="4" y2="10.5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="5.5" x2="12" y2="10.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Dependency Graph
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Interactive failure cascade visualization — drag nodes, scroll to zoom
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-[#c9190b] bg-[#c9190b]/15" />
            Failed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-[#f0ab00] bg-[#f0ab00]/15" />
            Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-[#3e8635] bg-[#3e8635]/15" />
            Healthy
          </span>
          <span className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            {graph.nodes.length} nodes · {graph.edges.length} edges
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          className="bg-[var(--color-panel)]"
        >
          <Background color="#d2d2d2" gap={24} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              const status = (node.data as ComponentNodeData)?.status
              return statusColors[status] ?? '#d2d2d2'
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
    </section>
  )
}
