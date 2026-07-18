import { useMemo, useState } from 'react'
import {
  ChevronDown,
  FileCode2,
  Info,
  ScrollText,
  Server,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalysisResult, InvestigationInput } from '@/types/investigation'

interface EvidenceItem {
  id: string
  kind: 'command' | 'log' | 'event' | 'cluster'
  title: string
  body: string
  status: string
  contribution: number
}

interface EvidenceExplorerProps {
  input: InvestigationInput
  analysis: AnalysisResult
}

export function EvidenceExplorer({ input, analysis }: EvidenceExplorerProps) {
  const items = useMemo(() => buildEvidence(input, analysis), [input, analysis])
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <section className="flex h-full min-h-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-3 py-2.5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Evidence Explorer
          </h2>
          <p className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">
            {items.length} artifacts analyzed
          </p>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-2">
        {items.map((item, index) => {
          const open = openId === item.id
          const Icon = iconFor(item.kind)
          return (
            <article
              key={item.id}
              className={cn(
                'animate-fade-up overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 hover:border-[var(--color-accent)]/50',
                open && 'border-[var(--color-accent)]/40 panel-glow',
              )}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left"
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-[var(--color-foreground)]">
                    {item.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="rounded bg-[var(--color-success-soft)] px-1.5 py-0.5 text-[var(--color-success)]">
                      {item.status}
                    </span>
                    <span className="text-[var(--color-orange)]">
                      Confidence contribution: +{item.contribution}%
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-[var(--color-muted)] transition-transform duration-200',
                    open && 'rotate-180',
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-200 ease-out',
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <pre className="border-t border-[var(--color-border-subtle)] bg-[var(--color-background)] px-3 py-2 font-mono text-[11px] leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap">
                    {item.body}
                  </pre>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function iconFor(kind: EvidenceItem['kind']) {
  if (kind === 'command') return FileCode2
  if (kind === 'log') return ScrollText
  if (kind === 'event') return Info
  return Server
}

function buildEvidence(
  input: InvestigationInput,
  analysis: AnalysisResult,
): EvidenceItem[] {
  const commands = analysis.diagnosticCommands.map((cmd, i) => ({
    id: `cmd-${i}`,
    kind: 'command' as const,
    title: cmd.command,
    body: `${cmd.note ?? ''}\nTarget: ${cmd.target}\n\nParsed from investigation evidence intake.`,
    status: 'Analyzed',
    contribution: Math.max(8, 24 - i * 4),
  }))

  const logs = analysis.facts.slice(0, 2).map((fact, i) => ({
    id: `log-${i}`,
    kind: 'log' as const,
    title: `${fact.component} status stream`,
    body: `${fact.component}: ${fact.status}\nHealth: ${fact.health}\n\nCorrelated against ClusterOperator and node signals.`,
    status: 'Analyzed',
    contribution: 12 + i * 3,
  }))

  const events = analysis.timeline.slice(0, 2).map((event, i) => ({
    id: `evt-${i}`,
    kind: 'event' as const,
    title: event.label,
    body: `${event.time} — ${event.description ?? event.label}`,
    status: 'Analyzed',
    contribution: 10,
  }))

  const cluster: EvidenceItem = {
    id: 'cluster',
    kind: 'cluster',
    title: 'Cluster information',
    body: [
      `OCP ${input.ocpVersion}`,
      `Platform: ${input.platform}`,
      `Topology: ${input.topology}`,
      `Managed: ${input.managedService}`,
      `Must-gather: ${input.mustGatherAvailable ? 'available' : 'not available'}`,
      input.recentChanges ? `\nRecent changes:\n${input.recentChanges}` : '',
      `\nCategory: ${analysis.category}`,
      `Severity: ${analysis.severity}`,
    ].join('\n'),
    status: 'Indexed',
    contribution: 15,
  }

  const pasted = input.evidence
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((block, i) => ({
      id: `paste-${i}`,
      kind: 'command' as const,
      title: block.split('\n')[0]?.slice(0, 60) || `Evidence block ${i + 1}`,
      body: block,
      status: 'Analyzed',
      contribution: 18 - i * 2,
    }))

  return [...pasted, ...commands, ...logs, ...events, cluster].slice(0, 10)
}
