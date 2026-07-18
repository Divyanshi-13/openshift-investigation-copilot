import { useState } from 'react'
import { MessageSquareText, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from '@/types/investigation'

interface InvestigationAssistantProps {
  analysis: AnalysisResult | null
}

type SuggestionId = 'evidence' | 'hypothesis'

const suggestions: Array<{
  id: SuggestionId
  label: string
}> = [
  { id: 'evidence', label: 'What evidence should I collect next?' },
  { id: 'hypothesis', label: 'What hypothesis should I test?' },
]

export function InvestigationAssistant({ analysis }: InvestigationAssistantProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<SuggestionId | null>(null)

  const guidance = getGuidance(active, analysis)

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <div
        className={cn(
          'pointer-events-auto w-[340px] origin-bottom-right overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_60px_rgba(0,0,0,0.55)] transition-all duration-200',
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-95 opacity-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-semibold">Investigation Assistant</p>
              <p className="text-[10px] text-[var(--color-muted)]">
                Guided next moves — not a chat thread
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 p-3">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={cn(
                'w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
                active === item.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]/50',
              )}
            >
              {item.label}
            </button>
          ))}

          {guidance && (
            <div className="animate-fade-up rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-sm leading-relaxed text-[var(--color-muted)]">
              {guidance}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-accent)] px-4 text-sm font-semibold text-[#061018] shadow-[0_0_24px_rgba(77,163,255,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        <MessageSquareText className="h-4 w-4" />
        Assistant
      </button>
    </div>
  )
}

function getGuidance(
  active: SuggestionId | null,
  analysis: AnalysisResult | null,
): string | null {
  if (!active) return null
  if (!analysis) {
    return 'Start an investigation from Case Intake to unlock guided next moves.'
  }

  if (active === 'evidence') {
    const missing = analysis.hypotheses[0]?.missingInformation?.[0]
    const cmd = analysis.diagnosticCommands[0]?.command ?? analysis.nextAction.command
    return missing
      ? `Collect: ${missing}. Highest-gain command right now: \`${cmd}\`.`
      : `Run \`${analysis.nextAction.command}\` next — it maximizes information gain on the leading candidate.`
  }

  const top = analysis.hypotheses[0]
  return top
    ? `Test “${top.rootCause}” first (confidence ${top.relevanceScore}%). Validate with: \`${analysis.nextAction.command}\`.`
    : 'No hypothesis ranked yet — gather more ClusterOperator and node evidence.'
}
