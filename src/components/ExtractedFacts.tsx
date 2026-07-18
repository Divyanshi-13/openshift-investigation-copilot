import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Fact, HealthStatus } from '@/types/investigation'

interface ExtractedFactsProps {
  facts: Fact[]
}

function healthVariant(health: HealthStatus) {
  if (health === 'failed') return 'danger' as const
  if (health === 'warning') return 'warning' as const
  return 'success' as const
}

export function ExtractedFacts({ facts }: ExtractedFactsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Facts</CardTitle>
        <p className="text-xs text-[var(--color-muted)]">
          Structured signals parsed from symptoms and evidence.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div
              key={`${fact.component}-${fact.status}`}
              className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-background)] px-3 py-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{fact.component}</p>
                <Badge variant={healthVariant(fact.health)}>{fact.status}</Badge>
              </div>
              <p className="text-xs capitalize text-[var(--color-muted)]">
                Health: {fact.health}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
