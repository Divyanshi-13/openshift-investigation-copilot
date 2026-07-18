import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from '@/types/investigation'

interface AiInvestigationEngineProps {
  analysis: AnalysisResult
}

const reasoningSteps = [
  'Detected symptom',
  'Collected evidence',
  'Generated hypotheses',
  'Validated root cause',
] as const

export function AiInvestigationEngine({ analysis }: AiInvestigationEngineProps) {
  const [activeStep, setActiveStep] = useState(0)
  const problem =
    analysis.symptoms[0] ?? analysis.rca.problemSummary ?? 'Investigation in progress'
  const maxScore = Math.max(
    ...analysis.hypotheses.map((h) => h.relevanceScore),
    1,
  )

  useEffect(() => {
    setActiveStep(0)
    const id = window.setInterval(() => {
      setActiveStep((prev) => (prev < reasoningSteps.length - 1 ? prev + 1 : prev))
    }, 700)
    return () => window.clearInterval(id)
  }, [analysis.investigationHypothesis])

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--color-panel)]">
      <div className="border-b border-[var(--color-border)] px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
          AI Investigation Engine
        </h2>
      </div>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        <div className="animate-fade-up relative overflow-hidden rounded-lg border border-[var(--color-danger)]/30 bg-white p-4 card-shadow">
          <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-danger)]" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-danger)]">
            Current Problem
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {problem}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            {analysis.investigationHypothesis.slice(0, 180)}
            {analysis.investigationHypothesis.length > 180 ? '…' : ''}
          </p>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            AI Reasoning Timeline
          </p>
          <ol className="relative space-y-0 border-l-2 border-[var(--color-border)] pl-4">
            {reasoningSteps.map((step, index) => {
              const done = index <= activeStep
              const current = index === activeStep
              return (
                <li
                  key={step}
                  className={cn(
                    'animate-timeline-in relative pb-4 last:pb-0',
                    !done && 'opacity-40',
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span
                    className={cn(
                      'absolute -left-[1.45rem] top-1 h-2.5 w-2.5 rounded-full border-2',
                      done
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                        : 'border-[var(--color-border)] bg-white',
                      current && 'animate-pulse-soft',
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm font-medium',
                      current
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-foreground)]',
                    )}
                  >
                    {step}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {analysis.timeline[index]?.description ??
                      analysis.timeline[index]?.label ??
                      'Processing…'}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Root Cause Candidates
          </p>
          <div className="space-y-2.5">
            {analysis.hypotheses.map((h, index) => {
              const tone = confidenceTone(h.relevanceScore)
              const width = Math.round((h.relevanceScore / maxScore) * 100)
              return (
                <article
                  key={h.id}
                  className={cn(
                    'animate-fade-up rounded-lg border bg-white p-3 card-shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    tone.border,
                  )}
                  style={{ animationDelay: `${120 + index * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-[var(--color-foreground)]">{h.rootCause}</h4>
                    <span className={cn('shrink-0 text-sm font-bold tabular-nums', tone.text)}>
                      {h.relevanceScore}%
                    </span>
                  </div>
                  <p className={cn('mt-1 text-[11px] font-medium uppercase tracking-[0.1em]', tone.text)}>
                    Confidence
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-panel)]">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', tone.bar)}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
                    {h.evidence.slice(0, 2).map((e) => (
                      <li key={e} className="truncate">
                        · {e}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function confidenceTone(score: number) {
  if (score >= 80) {
    return {
      border: 'border-[var(--color-danger)]/30',
      text: 'text-[var(--color-danger)]',
      bar: 'bg-gradient-to-r from-[var(--color-orange)] to-[var(--color-danger)]',
    }
  }
  if (score >= 50) {
    return {
      border: 'border-[var(--color-warning)]/30',
      text: 'text-[var(--color-warning)]',
      bar: 'bg-[var(--color-warning)]',
    }
  }
  return {
    border: 'border-[var(--color-border)]',
    text: 'text-[var(--color-muted)]',
    bar: 'bg-[var(--color-muted-foreground)]',
  }
}
