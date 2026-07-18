import { useState } from 'react'
import { Check, Copy, Crosshair, ListChecks } from 'lucide-react'
import type { AnalysisResult } from '@/types/investigation'

interface NextBestActionPanelProps {
  analysis: AnalysisResult
}

export function NextBestActionPanel({ analysis }: NextBestActionPanelProps) {
  const [copied, setCopied] = useState(false)
  const action = analysis.nextAction

  async function copy() {
    await navigator.clipboard.writeText(action.command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <section className="flex h-full min-h-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="border-b border-[var(--color-border-subtle)] px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
          Next Best Action
        </h2>
      </div>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-3">
        <div className="animate-fade-up rounded-lg border border-[var(--color-accent)]/40 bg-gradient-to-b from-[var(--color-accent-soft)] to-transparent p-3 panel-glow">
          <div className="mb-2 flex items-center gap-2 text-[var(--color-accent)]">
            <Crosshair className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
              Recommended Command
            </span>
          </div>
          <pre className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3 font-mono text-sm text-[var(--color-accent)]">
            {action.command}
          </pre>
          <button
            type="button"
            onClick={() => void copy()}
            className="mt-2 inline-flex items-center gap-1.5 rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy command'}
          </button>
        </div>

        <div className="animate-fade-up rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Why
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]">
            {action.reason}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            This gives highest information gain against the leading hypothesis.
          </p>
        </div>

        <div className="animate-fade-up rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <div className="mb-2 flex items-center gap-2">
            <ListChecks className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Pre-flight checklist
            </p>
          </div>
          <ul className="space-y-2">
            {analysis.healthChecklist.slice(0, 4).map((item) => (
              <li
                key={item}
                className="flex gap-2 text-xs leading-snug text-[var(--color-muted)]"
              >
                <span className="mt-0.5 font-mono text-[var(--color-border)]">□</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {analysis.relatedArticles[0] && (
          <div className="rounded-md border border-[var(--color-border-subtle)] px-3 py-2 text-xs">
            <p className="text-[var(--color-muted-foreground)]">Primary article</p>
            <p className="mt-1 font-mono text-[var(--color-accent)]">
              {analysis.relatedArticles[0].id}
            </p>
            <p className="mt-0.5 text-[var(--color-foreground)]">
              {analysis.relatedArticles[0].title}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
