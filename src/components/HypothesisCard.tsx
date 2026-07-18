import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeedbackControls } from '@/components/FeedbackControls'
import type { Hypothesis } from '@/types/investigation'
import { cn } from '@/lib/utils'

interface HypothesisCardProps {
  hypothesis: Hypothesis
  rank: number
  maxRelevance: number
}

export function HypothesisCard({
  hypothesis,
  rank,
  maxRelevance,
}: HypothesisCardProps) {
  const widthPct =
    maxRelevance > 0
      ? Math.round((hypothesis.relevanceScore / maxRelevance) * 100)
      : 0

  return (
    <Card
      className={cn(
        'transition-colors hover:border-[var(--color-accent)]/40',
        rank === 1 && 'ring-1 ring-[var(--color-accent)]/30',
      )}
    >
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
                Hypothesis #{rank}
              </p>
              <CardTitle className="text-base">{hypothesis.rootCause}</CardTitle>
            </div>
            <span className="shrink-0 text-xs text-[var(--color-muted)]">
              Relevance {hypothesis.relevanceScore}
            </span>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--color-muted)]">
              <span>Relevance score</span>
              <span>
                {widthPct}% of top match
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
              Evidence
            </p>
            <ul className="space-y-1.5 text-sm text-[var(--color-foreground)]">
              {hypothesis.evidence.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-muted)]">
              Missing information
            </p>
            <ul className="space-y-1.5 text-sm text-[var(--color-muted)]">
              {hypothesis.missingInformation.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-warning)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <FeedbackControls hypothesisId={hypothesis.id} />
      </CardContent>
    </Card>
  )
}
